const express = require('express');
const router = express.Router();
const facebookService = require('../services/facebook');
const db = require('../db');
const axios = require('axios');

// 1. Verification (GET)
// Facebook calls this to verify the callback URL
router.get('/facebook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verify Token should be in .env or settings. For now, hardcode or use simple env
    const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'mce_webhook_secret';

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// 2. Event Listener (POST)
router.post('/facebook', async (req, res) => {
    try {
        const body = req.body;

        if (body.object === 'page') {
            body.entry.forEach(async (entry) => {
                const pageId = entry.id;
                // const timeOfEvent = entry.time;

                entry.changes.forEach(async (change) => {
                    if (change.field === 'leadgen') {
                        const leadgenId = change.value.leadgen_id;
                        console.log(`[FB WEBHOOK] Received leadgen_id: ${leadgenId} for page ${pageId}`);

                        // Fetch Page Token from Settings (to get lead details)
                        // This assumes we stored it as 'fb_page_token' globally or per org?
                        // Problem: Webbook doesn't tell us the Org ID directly.
                        // We must look up which Org owns this Page ID.

                        const settingRes = await db.query("SELECT organization_id, value FROM settings WHERE key = 'fb_page_id' AND value = ?", [pageId]);

                        // If page not found, maybe look for page token directly mapped to page_id?
                        // For MVP, we assume single-tenant-ish or we query by page_id.
                        // A better schema would be `integrations` table: org_id, provider, external_id, credentials.
                        // Using 'settings' is tricky if multiple orgs connect same page (unlikely) or diverse pages.
                        // We'll search `settings` for the Org that has this page_id configured.

                        // Alternate: SELECT organization_id FROM settings WHERE key='fb_page_id' AND value = pageId

                        if (settingRes.rows.length === 0) {
                            console.error(`[FB WEBHOOK] No Organization found for Page ID ${pageId}`);
                            return;
                        }

                        const orgId = settingRes.rows[0].organization_id;

                        // Now get access token for this Org
                        const tokenRes = await db.query("SELECT value FROM settings WHERE key = 'fb_page_token' AND organization_id = ?", [orgId]);
                        const pageAccessToken = tokenRes.rows[0]?.value;

                        if (!pageAccessToken) {
                            console.error(`[FB WEBHOOK] No Page Token found for Org ${orgId}`);
                            return;
                        }

                        // Fetch Lead Details
                        try {
                            const leadData = await facebookService.getPageLead(leadgenId, pageAccessToken);
                            console.log('[FB WEBHOOK] Lead Data:', leadData);

                            // Transform to MCE Format
                            // leadData.field_data = [ { name: "full_name", values: ["John"] }, ... ]
                            const rawFields = {};
                            if (leadData.field_data) {
                                leadData.field_data.forEach(f => {
                                    rawFields[f.name] = f.values[0];
                                });
                            }

                            // Load Mapping for this Form
                            const mappingKey = `fb_mapping_${leadData.form_id}`;
                            const mappingRes = await db.query("SELECT value FROM settings WHERE key = ? AND organization_id = ?", [mappingKey, orgId]);
                            const mapping = mappingRes.rows.length > 0 ? JSON.parse(mappingRes.rows[0].value) : null;

                            let name = rawFields.full_name || rawFields.name || 'Facebook Lead';
                            let phone = rawFields.phone_number || rawFields.phone;
                            let email = rawFields.email;

                            // Apply Mapping if exists
                            if (mapping) {
                                // Mapping: { "question_key": "db_column" }
                                // Reverse find keys mapped to 'name', 'phone', 'email'
                                for (const [fbKey, dbCol] of Object.entries(mapping)) {
                                    if (dbCol === 'name' && rawFields[fbKey]) name = rawFields[fbKey];
                                    if (dbCol === 'phone' && rawFields[fbKey]) phone = rawFields[fbKey];
                                    if (dbCol === 'email' && rawFields[fbKey]) email = rawFields[fbKey];
                                }
                            }

                            // Standardize
                            const payload = {
                                name,
                                phone,
                                email,
                                source: 'facebook_lead_ads',
                                status: 'NEW',
                                metadata: {
                                    facebook_lead_id: leadgenId,
                                    facebook_page_id: pageId,
                                    form_id: leadData.form_id,
                                    campaign_name: leadData.campaign_name, // If available
                                    ad_name: leadData.ad_name,
                                    raw_fields: rawFields // Store original data just in case
                                },
                                tracking_dna: {
                                    utm_source: 'facebook',
                                    utm_medium: 'cpc'
                                }
                            };

                            // Ingest
                            // We can call the Ingest Route internally or use DB directly.
                            // Let's use internal HTTP call OR require the router logic?
                            // Requiring 'ingest' logic is cleaner but 'ingest' is a Route.
                            // I'll call existing db logic or refactor ingest to a service.
                            // For MVP speed: HTTP POST to localhost/api/leads/ingest?

                            // Better: Just Insert. We have `AssignLead` logic to run too.
                            // Let's copy the ingestion logic or make a `LeadService`.

                            const { assignLead } = require('../utils/router');
                            const { v4: uuidv4 } = require('uuid');

                            const leadId = uuidv4();
                            const assignedUserId = await assignLead(orgId);

                            await db.query(
                                `INSERT INTO leads (id, name, phone, email, source, status, metadata, tags, tracking_dna, organization_id, assigned_to)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    leadId,
                                    payload.name,
                                    payload.phone,
                                    payload.email,
                                    payload.source,
                                    payload.status,
                                    JSON.stringify(payload.metadata),
                                    JSON.stringify([]),
                                    JSON.stringify(payload.tracking_dna),
                                    orgId,
                                    assignedUserId
                                ]
                            );
                            console.log(`[FB WEBHOOK] Lead ${leadId} created and assigned to ${assignedUserId}`);

                        } catch (e) {
                            console.error('[FB WEBHOOK] Processing Error:', e.message);
                        }
                    }
                });
            });

            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

module.exports = router;
