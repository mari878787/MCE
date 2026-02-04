const express = require('express');
const router = express.Router();
const db = require('../db');
const { validatePhone } = require('../utils/validator');
const { scoreLead } = require('../utils/scorer');
const { assignLead } = require('../utils/router');
const { v4: uuidv4 } = require('uuid');

// The Universal Listener
router.post('/ingest', async (req, res) => {
    try {
        const rawData = req.body;
        console.log('Received Payload:', JSON.stringify(rawData, null, 2));

        // 1. Validate Phone
        const phoneValidation = validatePhone(rawData.phone || rawData.phone_number);

        // Standardization Logic
        const standardizedLead = {
            name: rawData.name || rawData.full_name || 'Unknown',
            phone: phoneValidation.valid ? phoneValidation.formatted : (rawData.phone || 'Invalid'),
            email: rawData.email,
            source: rawData.source || 'website',
            tracking_dna: {
                gclid: rawData.gclid,
                fbp: rawData.fbp,
                fbc: rawData.fbc,
                utm_source: rawData.utm_source,
                utm_campaign: rawData.utm_campaign
            },
            metadata: rawData
        };

        // 2. Score & Tag
        const { score, tags, status } = scoreLead(standardizedLead, phoneValidation);
        standardizedLead.score = score;
        standardizedLead.tags = tags;
        standardizedLead.status = status;

        // 3a. Duplicate Manager (Check exists)
        if (standardizedLead.phone !== 'Invalid') {
            const existing = await db.query('SELECT * FROM leads WHERE phone = ?', [standardizedLead.phone]);
            if (existing.rows.length > 0) {
                const existingLead = existing.rows[0];
                console.log(`[DUPLICATE] Lead exists: ${existingLead.id}`);

                // Logic: Append Source, Move to NEW (if not WON)
                const newMetadata = {
                    ...JSON.parse(existingLead.metadata || '{}'),
                    last_source: standardizedLead.source,
                    duplicate_attempt: new Date().toISOString()
                };

                // Only reset status if not already converted
                const newStatus = existingLead.status === 'WON' ? 'WON' : 'NEW';

                await db.query(
                    "UPDATE leads SET status = ?, metadata = ? WHERE id = ?",
                    [newStatus, JSON.stringify(newMetadata), existingLead.id]
                );

                return res.status(200).json({
                    success: true,
                    message: 'Lead merged with existing record',
                    lead: { ...existingLead, status: newStatus }
                });
            }
        }

        // 3b. User Assignment
        let assignedUserId = null;
        if (status !== 'TRASH') {
            assignedUserId = await assignLead();
        }

        // 4. Insert into DB (SQLite)
        const leadId = uuidv4();
        try {
            const insertQuery = `
        INSERT INTO leads (id, name, phone, email, source, status, score, tags, tracking_dna, metadata, assigned_to, organization_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const values = [
                leadId,
                standardizedLead.name,
                standardizedLead.phone,
                standardizedLead.email,
                standardizedLead.source,
                standardizedLead.status,
                standardizedLead.score,
                JSON.stringify(standardizedLead.tags),
                JSON.stringify(standardizedLead.tracking_dna),
                JSON.stringify(standardizedLead.metadata),
                assignedUserId,
                1 // TODO: Dynamic Org ID from API Key or Webhook param. Defaulting to 1.
            ];

            await db.query(insertQuery, values);

        } catch (dbError) {
            console.warn('DB Insert Failed:', dbError.message);
        }

        // 6. CAPI Trigger - Lead Event
        // Only fire if not coming directly from Facebook (deduplication)
        // This captures Website Leads (WordPress, ClickFunnels, etc.)
        if (standardizedLead.source !== 'facebook_lead_ads') {
            try {
                const facebookCapiService = require('../services/facebook_capi'); // Lazy load
                const eventData = {
                    email: standardizedLead.email,
                    phone: standardizedLead.phone,
                    fbp: standardizedLead.tracking_dna.fbp,
                    fbc: standardizedLead.tracking_dna.fbc,
                    ip: req.ip || req.headers['x-forwarded-for'] || '',
                    userAgent: req.headers['user-agent'] || '',
                    sourceUrl: req.headers['referer'] || '',
                    value: 0.00,
                    currency: 'USD'
                };
                // Default to Org ID 1 as per current ingest logic
                facebookCapiService.sendEvent('Lead', eventData, 1);
            } catch (capiErr) { console.error('CAPI Ingest Error:', capiErr.message); }
        }

        // 5. Respond
        res.status(200).json({
            success: true,
            message: 'Lead captured & processed',
            lead: { ...standardizedLead, id: leadId }
        });

    } catch (error) {
        console.error('Ingestion Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

module.exports = router;
