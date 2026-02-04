const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsapp');

// GET /api/whatsapp/status
router.get('/status', (req, res) => {
    try {
        console.log('Route /status hit');
        const { status, qr, info, instanceId } = whatsappService.getStatus();
        console.log('Route /status result:', status, 'Instance:', instanceId);
        res.json({
            status,
            qr,
            info,
            instanceId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get status' });
    }
});

// POST /api/whatsapp/logout
router.post('/logout', async (req, res) => {
    try {
        await whatsappService.client.logout();
        whatsappService.initialize(); // Restart to get new QR
        res.json({ success: true, message: 'Logged out' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

// GET /api/whatsapp/chats
router.get('/chats', async (req, res) => {
    console.log('[DEBUG] GET /api/whatsapp/chats Request received');
    try {
        const chats = await whatsappService.getLiveChats();
        console.log(`[DEBUG] GET /api/whatsapp/chats returning ${chats.length} chats`);
        res.json(chats);
    } catch (error) {
        console.error('[DEBUG] GET /api/whatsapp/chats failed:', error);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
});
// GET /api/whatsapp/media/:chatId/:msgId
router.get('/media/:chatId/:msgId', async (req, res) => {
    try {
        const { chatId, msgId } = req.params;
        const media = await whatsappService.getMessageMedia(chatId, msgId);

        if (media) {
            res.setHeader('Content-Type', media.mimetype);
            res.end(Buffer.from(media.data, 'base64'));
        } else {
            res.status(404).send('Media not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching media');
    }
});

// GET /api/whatsapp/chats/:id/messages
router.get('/chats/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await whatsappService.getLiveMessages(id);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST /api/whatsapp/send
router.post('/send', async (req, res) => {
    try {
        const { to, content } = req.body;
        await whatsappService.sendMessage(to, content);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/whatsapp/chats/:id/messages
router.post('/chats/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        // Use client directly to send
        const success = await whatsappService.client.sendMessage(id, content);
        res.json({ success: true, id: success.id._serialized });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});
// POST /api/whatsapp/chats/:id/read
router.post('/chats/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        await whatsappService.markAsRead(id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/restart', async (req, res) => {
    try {
        await whatsappService.restart();
        res.json({ success: true, message: 'Restarting WhatsApp Service...' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Setup Multer
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/whatsapp/chats/:id/files
router.post('/chats/:id/files', upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;
        const caption = req.body.caption || '';

        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        await whatsappService.sendMessageMedia(id, file, caption);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send file' });
    }
});

// POST /api/whatsapp/hard-reset - Delete session and restart
router.post('/hard-reset', async (req, res) => {
    try {
        console.log('Hard Resetting WhatsApp...');
        await whatsappService.client.destroy();

        const fs = require('fs');
        const path = require('path');
        const root = path.resolve(__dirname, '..');

        fs.rmSync(path.join(root, '.wwebjs_auth'), { recursive: true, force: true });
        fs.rmSync(path.join(root, '.wwebjs_cache'), { recursive: true, force: true });

        console.log('Session files deleted. Restarting...');
        whatsappService.initialize();

        res.json({ success: true, message: 'Hard Reset Complete. Wait for QR.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/whatsapp/sync - Sync History
router.post('/sync', async (req, res) => {
    try {
        const result = await whatsappService.syncHistory();
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/whatsapp/bulk-send
router.post('/bulk-send', async (req, res) => {
    const { leadIds, message, templateId } = req.body;
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
        return res.status(400).json({ error: 'No leads selected' });
    }
    if (!message && !templateId) {
        return res.status(400).json({ error: 'Message content is required' });
    }

    try {
        console.log(`[BULK] Starting bulk send for ${leadIds.length} leads`);

        // 1. Fetch Leads to get phone numbers
        // Note: sqlite3 'IN' clause handling can be tricky with parameterized queries, so we construct it.
        const placeholders = leadIds.map(() => '?').join(',');
        const query = `SELECT id, name, phone FROM leads WHERE id IN (${placeholders}) AND organization_id = ?`;
        const params = [...leadIds, req.user.organization_id];

        const leads = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        if (leads.length === 0) {
            return res.status(404).json({ error: 'No valid leads found' });
        }

        // 2. Process Sending (Async - don't wait for all to finish to respond)
        let sentCount = 0;
        let failedCount = 0;

        // Respond immediately that the job has started
        res.json({ success: true, message: `Queued ${leads.length} messages` });

        // Run in background
        (async () => {
            for (const lead of leads) {
                if (!lead.phone) {
                    console.log(`[BULK] Skipping lead ${lead.name} (No phone)`);
                    failedCount++;
                    continue;
                }

                // Personalize
                let finalMsg = message.replace(/{name}/g, lead.name || 'there');

                try {
                    // Format phone (remove +, spaces, etc)
                    let phone = lead.phone.replace(/\D/g, '');
                    if (!phone.endsWith('@c.us')) phone += '@c.us';

                    await whatsappService.sendMessage(phone, finalMsg);
                    sentCount++;
                    console.log(`[BULK] Sent to ${lead.name}`);

                    // Delay to be safe (random 2-5 seconds)
                    const delay = Math.floor(Math.random() * 3000) + 2000;
                    await new Promise(r => setTimeout(r, delay));

                } catch (e) {
                    console.error(`[BULK] Failed to send to ${lead.name}:`, e.message);
                    failedCount++;
                }
            }
            console.log(`[BULK] Job Complete. Sent: ${sentCount}, Failed: ${failedCount}`);
        })();

    } catch (err) {
        console.error('[BULK] Error:', err);
        // If response wasn't sent yet
        if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
