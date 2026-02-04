const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { validatePhone } = require('../utils/validator');
const { scoreLead } = require('../utils/scorer');
const { assignLead } = require('../utils/router');
const { v4: uuidv4 } = require('uuid');

// Enforce Auth for all routes
router.use(authMiddleware);

// POST /api/leads - Create Manual Lead
router.post('/', async (req, res) => {
    try {
        const rawData = req.body;
        console.log('[LEAD] Manual Creation:', rawData);

        // 1. Validate Phone
        const phoneValidation = validatePhone(rawData.phone);
        // Ensure name is present
        const name = rawData.name || 'Unknown';
        const source = rawData.source || 'manual';

        // Standardization
        const standardizedLead = {
            name: name,
            phone: phoneValidation.valid ? phoneValidation.formatted : (rawData.phone || 'Invalid'),
            email: rawData.email,
            source: source,
            tracking_dna: {},
            metadata: { created_by_user: req.user.id }
        };

        // 2. Score & Tag
        const { score, tags, status } = scoreLead(standardizedLead, phoneValidation);
        standardizedLead.score = score;

        // Merge calculated tags with manual tags
        const manualTags = Array.isArray(rawData.tags) ? rawData.tags :
            (typeof rawData.tags === 'string' ? rawData.tags.split(',').map(t => t.trim()) : []);

        standardizedLead.tags = [...new Set([...tags, ...manualTags])];
        standardizedLead.status = rawData.status || status; // Allow manual status override

        // 1.5 Check Duplicates (Scoped to Org)
        const existing = await db.query(
            'SELECT id FROM leads WHERE phone = ? AND organization_id = ?',
            [standardizedLead.phone, req.user.organization_id]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: `Lead already exists with phone ${standardizedLead.phone}` });
        }

        // 3. User Assignment (SaaS: Org Scoped)
        const assignedUserId = await assignLead(req.user.organization_id);

        // 4. Insert
        const leadId = uuidv4();
        await db.query(`
            INSERT INTO leads (id, name, phone, email, source, status, score, tags, tracking_dna, metadata, assigned_to, organization_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
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
                req.user.organization_id
            ]
        );

        res.json({ success: true, lead: { ...standardizedLead, id: leadId } });

    } catch (err) {
        console.error('Create Lead Error:', err);
        res.status(500).json({ error: 'Failed to create lead: ' + err.message });
    }
});

// DELETE /api/leads/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Ensure we only delete leads belonging to the user's org
        // First check strict ownership
        const leadCheck = await db.query('SELECT id FROM leads WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);
        if (leadCheck.rows.length === 0) return res.status(404).json({ error: 'Lead not found or access denied' });

        await db.query('DELETE FROM campaign_audience WHERE lead_id = ?', [id]); // Link table, cascade logic usually safer but manual for now
        await db.query('DELETE FROM messages WHERE lead_id = ?', [id]);
        await db.query('DELETE FROM leads WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});

// GET /api/leads/reminders
router.get('/reminders', async (req, res) => {
    try {
        // Fetch leads with reminders due in the past (and not yet cleared?) 
        // For now, we'll just fetch all leads where reminder_at < NOW and maybe we need a flag 'reminder_dismissed'?
        // A simpler MVP approach: Frontend polls this. Backend returns leads with reminder_at < NOW.
        // User must "Clear" the reminder to stop it? Or we just show it.
        // Let's assume we show it once or show a list.

        const sql = `SELECT * FROM leads WHERE organization_id = ? AND reminder_at IS NOT NULL AND reminder_at <= datetime('now') ORDER BY reminder_at ASC`;
        const { rows } = await db.query(sql, [req.user.organization_id]);
        res.json({ data: rows });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
});

// PUT /api/leads/:id - Update Lead & Check Triggers
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, tags, notes, status, email, reminder_at, reminder_note } = req.body;

    try {
        // 1. Get Old Data (Scoped to Org)
        const oldRes = await db.query('SELECT * FROM leads WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);
        if (oldRes.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
        const oldLead = oldRes.rows[0];
        const oldTags = JSON.parse(oldLead.tags || '[]');

        // 2. Prepare Updates
        const fields = [];
        const values = [];

        if (name !== undefined) { fields.push('name = ?'); values.push(name); }
        if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
        if (email !== undefined) { fields.push('email = ?'); values.push(email); }
        if (status !== undefined) { fields.push('status = ?'); values.push(status); }
        if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }
        if (reminder_note !== undefined) { fields.push('reminder_note = ?'); values.push(reminder_note); }
        if (reminder_at !== undefined) { fields.push('reminder_at = ?'); values.push(reminder_at); }

        let newTagsArray = oldTags;
        if (tags !== undefined) {
            if (Array.isArray(tags)) newTagsArray = tags;
            else if (typeof tags === 'string') {
                try { newTagsArray = JSON.parse(tags); } catch { newTagsArray = [tags]; }
            }
            fields.push('tags = ?');
            values.push(JSON.stringify(newTagsArray));
        }

        if (fields.length === 0) {
            return res.json({ success: true, message: "No changes detected" });
        }

        // 3. Update DB
        const sql = `UPDATE leads SET ${fields.join(', ')} WHERE id = ? AND organization_id = ?`;
        values.push(id, req.user.organization_id);

        console.log(`[LEAD UPDATE] Executing SQL: ${sql}`);
        console.log(`[LEAD UPDATE] Values:`, values);

        await db.query(sql, values);

        // 4. CHECK TRIGGERS - Tag Addition
        // Find tags in newTags which were NOT in oldTags
        const addedTags = newTagsArray.filter(t => !oldTags.includes(t));

        if (addedTags.length > 0) {
            console.log(`[LEADS] Tags added for ${id}:`, addedTags);
            const workflowEngine = require('../lib/WorkflowEngine');
            for (const tag of addedTags) {
                await workflowEngine.checkTriggers('TAG_ADDED', { leadId: id, tag });
            }
        }

        res.json({ success: true, added_tags: addedTags });

        // 5. CAPI Trigger - Status Change
        if (status && status !== oldLead.status) {
            // Check for 'WON' or 'CLIENT' status status to trigger Purchase
            // In a real app, this mapping should be configurable
            const conversionStatuses = ['WON', 'CLIENT', 'CLOSED'];
            if (conversionStatuses.includes(status.toUpperCase())) {
                const facebookCapiService = require('../services/facebook_capi'); // Lazy load or move to top
                const eventData = {
                    email: email || oldLead.email,
                    phone: phone || oldLead.phone,
                    value: 100.00, // Default value for now
                    currency: 'USD'
                };
                // Fire and forget
                console.log(`[CAPI] Triggering Purchase event for lead ${id}`);
                facebookCapiService.sendEvent('Purchase', eventData, req.user.organization_id);
            }
        }

    } catch (err) {
        console.error('Update Lead Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/leads - Fetch all leads with Search & Pagination
router.get('/', async (req, res) => {
    try {
        const { search, status, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        // Base Query
        let sql = 'SELECT * FROM leads WHERE organization_id = ?';
        let countSql = 'SELECT COUNT(*) as total FROM leads WHERE organization_id = ?';
        const params = [req.user.organization_id];
        const countParams = [req.user.organization_id];

        console.log(`[DEBUG] Fetching leads for Org: ${req.user.organization_id}`);
        console.log(`[DEBUG] User Role: ${req.user.role}, Name: ${req.user.name}`);

        // Search Filter
        if (search) {
            sql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
            countSql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term);
            countParams.push(term, term, term);
        }

        // Status Filter
        if (status && status !== 'ALL') {
            sql += ' AND status = ?';
            countSql += ' AND status = ?';
            params.push(status);
            countParams.push(status);
        }

        // Created After Filter (For Polling)
        const { created_after } = req.query;
        if (created_after) {
            sql += ' AND created_at > ?';
            countSql += ' AND created_at > ?';
            // Ensure timestamp is valid string or date
            params.push(created_after);
            countParams.push(created_after);
        }

        // Ordering & Pagination
        sql += ` ORDER BY 
                CASE WHEN last_message_sent_at IS NOT NULL THEN 1 ELSE 2 END,
                last_message_sent_at DESC, 
                created_at DESC 
                LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Execute Params
        const [rowsRes, countRes] = await Promise.all([
            db.query(sql, params),
            db.query(countSql, countParams)
        ]);

        const rows = rowsRes.rows;
        const total = countRes.rows[0].total;

        console.log(`[DEBUG] Found ${rows.length} leads. Total: ${total}`);

        // Parse JSON strings back to objects
        const leads = rows.map(lead => ({
            ...lead,
            tags: JSON.parse(lead.tags || '[]'),
            tracking_dna: JSON.parse(lead.tracking_dna || '{}'),
            metadata: JSON.parse(lead.metadata || '{}')
        }));

        res.json({
            data: leads,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Fetch Leads Error:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

// POST /api/leads/bulk-delete
router.post('/bulk-delete', async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'IDs array required' });

    try {
        const placeholders = ids.map(() => '?').join(',');

        // 1. Verify IDs belong to user's org
        const verifySql = `SELECT id FROM leads WHERE id IN (${placeholders}) AND organization_id = ?`;
        const verifyRes = await db.query(verifySql, [...ids, req.user.organization_id]);
        const validIds = verifyRes.rows.map(r => r.id);

        if (validIds.length === 0) return res.json({ success: true, count: 0 });

        const validPlaceholders = validIds.map(() => '?').join(',');
        const params = validIds;

        await db.query('BEGIN TRANSACTION');

        await db.query(`DELETE FROM campaign_audience WHERE lead_id IN (${validPlaceholders})`, params);
        await db.query(`DELETE FROM messages WHERE lead_id IN (${validPlaceholders})`, params);
        await db.query(`DELETE FROM leads WHERE id IN (${validPlaceholders})`, params);

        await db.query('COMMIT');

        res.json({ success: true, count: validIds.length });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Bulk Delete Error:', err);
        res.status(500).json({ error: 'Failed to delete leads' });
    }
});

module.exports = router;
