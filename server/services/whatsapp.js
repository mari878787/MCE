const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const db = require('../db');
const AIAnalyzer = require('./ai_analyzer');

class WhatsAppService {
    constructor() {
        this.instanceId = Math.random().toString(36).substring(7);
        console.log('WhatsAppService Instance Created:', this.instanceId);
        this.client = null;
        this.qr = null;
        this.status = 'DISCONNECTED';
        this.initialize();
    }

    initialize() {
        console.log('Initializing WhatsApp Client...');
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        this.client.on('qr', async (qr) => {
            console.log('QR RECEIVED', qr.substring(0, 20) + '...');
            try {
                this.qr = await qrcode.toDataURL(qr);
                console.log('QR GENERATED SUCCESS');
                this.status = 'QR_READY';
            } catch (err) {
                console.error('QR GENERATION FAILED:', err);
            }
        });

        this.client.on('ready', () => {
            console.log('WHATSAPP READY');
            this.status = 'CONNECTED';
            this.qr = null;
        });

        this.client.on('authenticated', () => {
            console.log('WHATSAPP AUTHENTICATED');
            this.status = 'AUTHENTICATED';
        });

        this.client.on('loading_screen', (percent, message) => {
            console.log('WHATSAPP LOADING:', percent, '%', message);
        });

        this.client.on('auth_failure', async () => {
            console.log('WHATSAPP AUTH FAILURE');
            this.status = 'DISCONNECTED';
            this.qr = null;
            await this.client.destroy();
            this.initialize();
        });

        this.client.on('disconnected', async (reason) => {
            console.log('WHATSAPP DISCONNECTED', reason);
            this.status = 'DISCONNECTED';
            this.qr = null;
            await this.client.destroy();
            this.initialize();
        });

        this.client.on('message', async (msg) => {
            console.log('MESSAGE RECEIVED', msg.from);
            await this.saveIncomingMessage(msg);
        });


        this.client.on('message_ack', async (msg, ack) => {
            /*
                ACK STATUSES:
                1 = SENT
                2 = RECEIVED (Delivered)
                3 = READ
            */
            console.log(`MESSAGE ACK: ${msg.id._serialized} STATUS: ${ack}`);
            let status = 'sent';
            if (ack === 2) status = 'delivered';
            if (ack === 3) status = 'read';

            try {
                if (msg.fromMe) {
                    // Update message status in DB
                    await db.query("UPDATE messages SET status = ? WHERE content = ? AND status != 'read'", [status, msg.body]);
                }
            } catch (e) {
                console.error('Error handling ACK:', e);
            }
        });

        this.client.initialize();
    }

    async sendMessage(to, content, options = null) {
        if (!this.client || this.status !== 'CONNECTED') {
            throw new Error('WhatsApp not connected');
        }

        // Handle options (backward compat: if string/number, it's campaignId)
        let campaignId = null;
        let explicitLeadId = null;

        if (options && typeof options === 'object') {
            campaignId = options.campaignId;
            explicitLeadId = options.leadId;
        } else if (options) {
            campaignId = options;
        }

        try {
            // Ensure number format (remove +, spaces, add @c.us if missing)
            let chatId = to.replace(/\+/g, '').replace(/\s/g, '');
            if (!chatId.includes('@')) {
                chatId = `${chatId}@c.us`;
            }
            const sentMsg = await this.client.sendMessage(chatId, content);
            console.log(`Message sent to ${chatId}`);

            // Store in DB
            const { randomUUID } = require('crypto');
            const msgId = randomUUID();
            const phone = chatId.replace('@c.us', '');

            // Resolve Lead ID
            let leadId = explicitLeadId;

            if (!leadId) {
                // Check for existing lead with various formats
                const formats = [phone, `+${phone}`, `p:+${phone}`];
                const placeholders = formats.map(() => '?').join(' OR phone = ');
                const existing = await db.query(`SELECT id FROM leads WHERE phone = ${placeholders}`, formats);

                if (existing.rows.length > 0) {
                    leadId = existing.rows[0].id;
                    console.log(`[DEBUG] Found existing lead ${leadId} for phone ${phone}`);
                } else {
                    console.warn(`[BLOCKED] Attempted to send to unknown number ${phone}`);
                    throw new Error(`Lead not found for phone ${phone}. Outbound creation disabled.`);
                }
            } else {
                console.log(`[DEBUG] Using explicit leadId: ${leadId}`);
            }

            // Update Last Msg Time
            await db.query("UPDATE leads SET last_message_sent_at = CURRENT_TIMESTAMP WHERE id = ?", [leadId]);

            console.log(`[DEBUG] Inserting message for lead ${leadId}`);

            await db.query(
                "INSERT INTO messages (id, lead_id, type, direction, content, status, campaign_id) VALUES (?, ?, 'whatsapp', 'outbound', ?, 'sent', ?)",
                [msgId, leadId, content, campaignId]
            );

            return { success: true, msgId, leadId };
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    async sendMessageMedia(to, file, caption = '') {
        if (!this.client || this.status !== 'CONNECTED') {
            throw new Error('WhatsApp not connected');
        }
        try {
            let chatId = to.replace(/\+/g, '').replace(/\s/g, '');
            if (!chatId.includes('@')) {
                chatId = `${chatId}@c.us`;
            }

            // Create MessageMedia instance
            const media = new MessageMedia(file.mimetype, file.buffer.toString('base64'), file.originalname);

            // Send
            await this.client.sendMessage(chatId, media, { caption: caption });
            console.log(`Media sent to ${chatId}`);

            // Simplify DB log for media: just log text as [Media] for now or filename
            const { randomUUID } = require('crypto');
            const msgId = randomUUID();
            const phone = chatId.replace('@c.us', '');

            let leadId;
            // Check for existing lead with various formats (clean, +, p:+)
            const formats = [phone, `+${phone}`, `p:+${phone}`];
            const placeholders = formats.map(() => '?').join(' OR phone = ');

            const existing = await db.query(`SELECT id FROM leads WHERE phone = ${placeholders}`, formats);

            if (existing.rows.length > 0) {
                leadId = existing.rows[0].id;
            } else {
                console.warn(`[BLOCKED] Media send to unknown ${phone}`);
                return false;
            }

            await db.query(
                "INSERT INTO messages (id, lead_id, type, direction, content, status) VALUES (?, ?, 'whatsapp', 'outbound', ?, 'sent')",
                [msgId, leadId, `[Media] ${file.originalname} ${caption}`]
            );

            return true;
        } catch (e) {
            console.error('Error sending media:', e);
            throw e;
        }
    }

    getStatus() {
        console.log(`getStatus called on Instance ${this.instanceId}. Status: ${this.status}`);
        return {
            status: this.status,
            qr: this.qr,
            info: this.client ? this.client.info : null,
            instanceId: this.instanceId
        };
    }

    async getLiveChats() {
        console.log(`[DEBUG] getLiveChats called. Status: ${this.status}`);
        let liveChats = [];

        // 1. Try fetching Live Chats from WhatsApp
        if (this.client && (this.status === 'CONNECTED' || this.status === 'AUTHENTICATED')) {
            try {
                liveChats = await this.client.getChats();
                console.log(`[DEBUG] Live chats count: ${liveChats.length}`);

                if (liveChats.length === 0) {
                    // Retry logic...
                    await new Promise(r => setTimeout(r, 2000));
                    liveChats = await this.client.getChats();
                }
            } catch (e) {
                console.error('Error getting live chats:', e);
            }
        }

        // 2. Fetch Local DB Chats (Fallback & Hybrid)
        // We want leads sorted by last_message_time or last created message
        try {
            // Get leads who have messages or are recently updated
            // This is a simplified query. Ideal to join with messages table for last msg snippet.
            // Using `last_message_sent_at` column which we update on incoming/outgoing.
            const dbChats = await db.query(`
                SELECT id, name, phone, last_message_sent_at 
                FROM leads 
                WHERE last_message_sent_at IS NOT NULL 
                ORDER BY last_message_sent_at DESC 
                LIMIT 50
            `);

            // If we have live chats, we merge/enrich them. 
            // If live chats failed, we strictly use DB chats.

            // Map Map DB chats to the format frontend expects
            const detailsMap = new Map();

            // Format DB Chats
            for (const lead of dbChats.rows) {
                // Get last message content
                const msgRes = await db.query("SELECT content, created_at FROM messages WHERE lead_id = ? ORDER BY created_at DESC LIMIT 1", [lead.id]);
                const lastMsg = msgRes.rows.length > 0 ? msgRes.rows[0].content : '';
                const timestamp = msgRes.rows.length > 0 ? new Date(msgRes.rows[0].created_at).getTime() / 1000 : 0;

                // Use phone as ID to match WA serialized ID format (approx)
                // WA ID: 123456789@c.us
                // DB Phone: 123456789 (usually sanitized)

                let waID = lead.phone;
                if (waID && !waID.includes('@')) waID = `${waID.replace(/\+/g, '')}@c.us`;

                detailsMap.set(waID, {
                    id: waID, // Use phone as ID for frontend key
                    name: lead.name,
                    unreadCount: 0, // DB doesn't track unread perfectly yet
                    timestamp: timestamp, // Unix timestamp
                    lastMessage: lastMsg,
                    isLocal: true,
                    leadId: lead.id // Keep ref
                });
            }

            // Overlay Live Chats (Priority)
            for (const c of liveChats) {
                const contact = await c.getContact();
                const name = contact.name || contact.pushname || c.name || c.id.user;

                detailsMap.set(c.id._serialized, {
                    id: c.id._serialized,
                    name: name,
                    unreadCount: c.unreadCount,
                    timestamp: c.timestamp,
                    lastMessage: c.lastMessage ? c.lastMessage.body : '',
                    isLocal: false
                });
            }

            // Convert back to array and sort
            const unifiedChats = Array.from(detailsMap.values());
            unifiedChats.sort((a, b) => b.timestamp - a.timestamp);

            console.log(`[DEBUG] Returning ${unifiedChats.length} unified chats.`);
            return unifiedChats;

        } catch (dbError) {
            console.error("DB Chat fetch failed", dbError);
            return [];
        }
    }

    async getLiveMessages(chatId) {
        if (!this.client || this.status !== 'CONNECTED') return [];
        try {
            const chat = await this.client.getChatById(chatId);
            const messages = await chat.fetchMessages({ limit: 50 });
            return messages.map(m => ({
                id: m.id._serialized,
                fromMe: m.fromMe,
                body: m.body,
                timestamp: m.timestamp,
                ack: m.ack,
                hasMedia: m.hasMedia,
                type: m.type
            }));
        } catch (e) {
            console.error('Error getting messages:', e);
            return [];
        }
    }

    async getMessageMedia(chatId, msgId) {
        if (!this.client) return null;
        try {
            const chat = await this.client.getChatById(chatId);
            console.log(`[MEDIA DEBUG] Fetching media for msg ${msgId} in chat ${chatId}`);

            // We have to find the message to downlaod media. 
            // Fetching recent might miss old ones, but good enough for Inbox view.
            const messages = await chat.fetchMessages({ limit: 50 });
            const msg = messages.find(m => m.id._serialized === msgId);

            if (!msg) {
                console.log(`[MEDIA DEBUG] Message not found in recent 50 messages.`);
                return null;
            }

            if (msg && msg.hasMedia) {
                console.log(`[MEDIA DEBUG] Downloading media...`);
                const media = await msg.downloadMedia();
                return media;
            } else {
                console.log(`[MEDIA DEBUG] Message found but hasMedia is false.`);
            }
        } catch (e) {
            console.error('Error downloading media:', e);
        }
        return null;
    }

    async markAsRead(chatId) {
        if (!this.client || this.status !== 'CONNECTED') return false;
        try {
            const chat = await this.client.getChatById(chatId);
            await chat.sendSeen();
            return true;
        } catch (e) {
            console.error('Error marking as read:', e);
            return false;
        }
    }

    async restart() {
        console.log('Restarting WhatsApp Client...');
        try {
            if (this.client) {
                await this.client.destroy();
            }
        } catch (e) {
            console.error('Error destroying client:', e);
        }
        this.status = 'DISCONNECTED';
        this.qr = null;
        this.initialize();
        return true;
    }

    async saveIncomingMessage(msg) {
        try {
            const { randomUUID } = require('crypto');
            const from = msg.from;
            const phone = from.replace('@c.us', '').replace('@g.us', '');
            const pushName = msg._data ? msg._data.notifyName : null;
            const name = pushName || phone; // Use notifyName (pushname) or phone if unknown

            const msgTime = new Date(msg.timestamp * 1000).toISOString();

            // 1. Analyze Sentiment
            const sentiment = AIAnalyzer.analyzeSentiment(msg.body);
            console.log(`Sentiment Analysis: ${sentiment} for "${msg.body}"`);

            let leadId;
            const existing = await db.query('SELECT id FROM leads WHERE phone = ?', [phone]);
            if (existing.rows.length > 0) {
                leadId = existing.rows[0].id;
                await db.query(
                    'UPDATE leads SET last_message_sent_at = ?, name = COALESCE(NULLIF(name, ?), name) WHERE id = ?',
                    [msgTime, name, leadId]
                );
            } else {
                console.log(`[IGNORED] Message from unknown number ${phone}. Lead creation disabled.`);
                return; // STRICT MODE: Do not create lead, do not save message
            }

            const direction = msg.fromMe ? 'outbound' : 'inbound';
            // Insert with sentiment
            await db.query(
                'INSERT INTO messages (lead_id, type, direction, content, created_at, sentiment) VALUES (?, ?, ?, ?, ?, ?)',
                [leadId, 'text', direction, msg.body, msgTime, sentiment]
            );
            console.log(`Saved message from ${name} (${phone}) [${sentiment}]`);

            // 2. Auto-Reply Check
            // Check global setting first
            const settingRes = await db.query("SELECT value FROM settings WHERE key = 'auto_reply_enabled'");
            const isAutoReplyEnabled = settingRes.rows.length > 0 ? settingRes.rows[0].value === 'true' : true;

            if (isAutoReplyEnabled) {
                const AutoReplyService = require('./auto_reply');
                const replyText = await AutoReplyService.checkAndGetReply(msg.body);

                if (replyText) {
                    console.log(`Sending Auto-Reply to ${phone}: ${replyText}`);
                    await this.sendMessage(from, replyText);
                }
            } else {
                console.log('Auto-Reply disabled globally. Skipping.');
            }

        } catch (e) {
            console.error('Error saving message:', e);
        }
    }

    async syncHistory() {
        if (this.status !== 'CONNECTED' && this.status !== 'AUTHENTICATED') {
            console.log('Sync attempted but not connected (Status: ' + this.status + ')');
            return { success: false, message: 'Not connected' };
        }
        console.log('Starting History Sync...');
        const { randomUUID } = require('crypto');

        try {
            let chats = await this.client.getChats();
            if (chats.length === 0) {
                console.log('Chats empty. Waiting 5s to retry...');
                await new Promise(r => setTimeout(r, 5000));
                chats = await this.client.getChats();
            }
            if (chats.length === 0) {
                console.log('Chats still empty. Attempting force reload...');
                await new Promise(r => setTimeout(r, 5000));
                chats = await this.client.getChats();
            }

            console.log(`Found ${chats.length} chats. Syncing top 50...`);
            const recentChats = chats.slice(0, 50);

            let syncCount = 0;

            for (const chat of recentChats) {
                try {
                    // AVOID calling chat.getContact()
                    const phone = chat.id.user; // Correct way to get number
                    const name = chat.name || phone; // Chat name (title) or phone
                    const lastMessageTime = new Date(chat.timestamp * 1000).toISOString();

                    console.log(`Syncing chat: ${name} (${phone})`);

                    let leadId;
                    const existing = await db.query('SELECT id FROM leads WHERE phone = ?', [phone]);

                    if (existing.rows.length > 0) {
                        leadId = existing.rows[0].id;
                        await db.query(
                            'UPDATE leads SET last_message_sent_at = ?, name = COALESCE(NULLIF(name, ?), name) WHERE id = ?',
                            [lastMessageTime, name, leadId]
                        );
                    } else {
                        // console.log(`[SYNC SKIP] Unknown contact ${phone}`);
                        continue;
                    }

                    // fetchMessages should work fine
                    const messages = await chat.fetchMessages({ limit: 20 });
                    for (const msg of messages) {
                        const msgTime = new Date(msg.timestamp * 1000).toISOString();
                        const direction = msg.fromMe ? 'outbound' : 'inbound';

                        const msgExists = await db.query('SELECT id FROM messages WHERE lead_id = ? AND created_at = ? AND content = ?', [leadId, msgTime, msg.body]);
                        if (msgExists.rows.length === 0) {
                            await db.query(
                                'INSERT INTO messages (lead_id, type, direction, content, created_at) VALUES (?, ?, ?, ?, ?)',
                                [leadId, 'text', direction, msg.body, msgTime]
                            );
                        }
                    }
                    syncCount++;
                } catch (chatError) {
                    console.error(`Error syncing chat ${chat.id._serialized}:`, chatError.message);
                    continue;
                }
            }
            console.log(`Sync Complete. Processed ${syncCount} chats.`);
            return { success: true, count: syncCount };
        } catch (err) {
            console.error('Critical Sync Error:', err);
            return { success: false, error: err.message };
        }
    }
    async syncChatMessages(phone, leadId) {
        if (this.status !== 'CONNECTED') return;
        try {
            console.log(`[SYNC] Syncing chat for ${phone} (Lead: ${leadId})`);

            // Format ID
            let chatId = phone.replace(/\D/g, '');
            if (!chatId.includes('@')) chatId += '@c.us';

            const chat = await this.client.getChatById(chatId);
            if (!chat) {
                console.log(`[SYNC] Chat not found for ${chatId}`);
                return;
            }

            // Fetch limits
            const messages = await chat.fetchMessages({ limit: 50 });
            console.log(`[SYNC] Found ${messages.length} messages`);

            for (const msg of messages) {
                const msgTime = new Date(msg.timestamp * 1000).toISOString();
                const direction = msg.fromMe ? 'outbound' : 'inbound';

                // Check if exists
                const msgExists = await db.query('SELECT id FROM messages WHERE lead_id = ? AND created_at = ? AND content = ?', [leadId, msgTime, msg.body]);

                if (msgExists.rows.length === 0) {
                    const { randomUUID } = require('crypto');
                    const msgId = randomUUID();
                    await db.query(
                        'INSERT INTO messages (id, lead_id, type, direction, content, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [msgId, leadId, 'text', direction, msg.body, msgTime, 'read']
                    );
                }
            }
        } catch (e) {
            console.error(`[SYNC] Failed to sync chat for ${phone}:`, e.message);
        }
    }
}

module.exports = new WhatsAppService();
