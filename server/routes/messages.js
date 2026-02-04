const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/leads/:id/messages
router.get('/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;

        // Security Check: Verify Lead belongs to Org
        const leadCheck = await db.query('SELECT id FROM leads WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);
        if (leadCheck.rows.length === 0) return res.status(404).json({ error: 'Lead not found or access denied' });

        const { rows } = await db.query(
            'SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at ASC',
            [id]
        );

        if (rows.length === 0) {
            // Try to Sync History from WhatsApp
            const leadInfo = await db.query('SELECT phone FROM leads WHERE id = ?', [id]);
            if (leadInfo.rows.length > 0 && leadInfo.rows[0].phone) {
                const whatsappService = require('../services/whatsapp');
                await whatsappService.syncChatMessages(leadInfo.rows[0].phone, id);

                // Re-fetch
                const retry = await db.query(
                    'SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at ASC',
                    [id]
                );
                return res.json(retry.rows);
            }
        }

        res.json(rows);
    } catch (error) {
        console.error('Fetch Messages Error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST /api/leads/:id/messages
router.post('/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { content, direction = 'outbound' } = req.body;

        // Get Lead Phone
        // Get Lead Phone (Scoped to Org)
        const leadRes = await db.query('SELECT phone FROM leads WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);
        if (leadRes.rows.length === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }
        const phone = leadRes.rows[0].phone;

        // Send via WhatsApp
        const whatsappService = require('../services/whatsapp');
        const result = await whatsappService.sendMessage(phone, content, { leadId: id });

        if (result && result.success) {
            // Update Lead Last Message Time
            const now = new Date().toISOString();
            // result.leadId might be different from id, but we update the one used/resolved
            await db.query(
                "UPDATE leads SET last_message_sent_at = ?, status = 'CONTACTED' WHERE id = ?",
                [now, result.leadId || id]
            );

            res.json({ success: true, id: result.msgId });
        } else {
            throw new Error('Message sending failed in service');
        }
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;
