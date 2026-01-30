const express = require('express');
const router = express.Router();
const db = require('../db');

// DELETE /api/leads/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM campaign_audience WHERE lead_id = ?', [id]);
        await db.query('DELETE FROM messages WHERE lead_id = ?', [id]);
        await db.query('DELETE FROM leads WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});

// PUT /api/leads/:id - Update Lead & Check Triggers
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, tags, notes, status, email } = req.body; // Expanded fields

    try {
        // 1. Get Old Data
        const oldRes = await db.query('SELECT * FROM leads WHERE id = ?', [id]);
        if (oldRes.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
        const oldLead = oldRes.rows[0];
        const oldTags = JSON.parse(oldLead.tags || '[]');

        // 2. Prepare New Data
        // Handle tags: if array, ensure it's JSON string for DB
        let newTagsArray = [];
        if (Array.isArray(tags)) newTagsArray = tags;
        else if (typeof tags === 'string') {
            try { newTagsArray = JSON.parse(tags); } catch { newTagsArray = [tags]; }
        }

        // 3. Update DB
        // Using generic update for modularity
        await db.query(
            `UPDATE leads SET 
                name = COALESCE(?, name), 
                phone = COALESCE(?, phone), 
                email = COALESCE(?, email),
                tags = ?, 
                status = COALESCE(?, status),
                notes = COALESCE(?, notes)
            WHERE id = ?`,
            [name, phone, email, JSON.stringify(newTagsArray), status, notes, id]
        );

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

    } catch (err) {
        console.error('Update Lead Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/leads - Fetch all leads
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT * FROM leads 
            ORDER BY 
                CASE WHEN last_message_sent_at IS NOT NULL THEN 1 ELSE 2 END,
                last_message_sent_at DESC, 
                created_at DESC 
            LIMIT 50
        `);

        // Parse JSON strings back to objects
        const leads = rows.map(lead => ({
            ...lead,
            tags: JSON.parse(lead.tags || '[]'),
            tracking_dna: JSON.parse(lead.tracking_dna || '{}'),
            metadata: JSON.parse(lead.metadata || '{}')
        }));

        res.json(leads);
    } catch (error) {
        console.error('Fetch Leads Error:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

module.exports = router;
