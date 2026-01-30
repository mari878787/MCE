const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// POST /api/hooks/whatsapp (Twilio Webhook)
router.post('/whatsapp', async (req, res) => {
    try {
        const { From, Body, ProfileName } = req.body;
        console.log(`[WHATSAPP HOOK] Received from ${From}: ${Body}`);

        // 1. Normalize Phone (Twilio sends 'whatsapp:+91...', we need '+91...')
        const cleanPhone = From.replace('whatsapp:', '');

        // 2. Find Lead
        const leadResult = await db.query(
            "SELECT * FROM leads WHERE phone = ?",
            [cleanPhone]
        );

        if (leadResult.rows.length === 0) {
            console.log('[WHATSAPP HOOK] Unknown number. Optionally create lead logic here.');
            return res.status(200).send('<Response></Response>');
        }

        const lead = leadResult.rows[0];

        // 3. Save Message
        const msgId = uuidv4();
        await db.query(
            "INSERT INTO messages (id, lead_id, type, direction, content, timestamp) VALUES (?, ?, 'whatsapp', 'inbound', ?, datetime('now'))",
            [msgId, lead.id, Body]
        );

        // 4. KILL SWITCH: Stop Automation & Update Status
        if (lead.stopped_automation === 0) {
            console.log(`[KILL SWITCH] Stopping automation for ${lead.name}`);
            await db.query(
                "UPDATE leads SET stopped_automation = 1, status = 'REPLIED' WHERE id = ?",
                [lead.id]
            );

            // 5. Notify Client (Mock Push Notification)
            console.log(`[ALERT] 🚨 Lead ${lead.name} replied! Automation stopped. Take over now.`);
        }

        res.status(200).send('<Response></Response>');

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('Error');
    }
});

module.exports = router;
