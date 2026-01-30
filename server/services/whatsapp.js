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
        // this.initialize(); 
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

    async sendMessage(to, content, campaignId = null) {
        if (!this.client || this.status !== 'CONNECTED') {
            throw new Error('WhatsApp not connected');
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
            let leadId;
            // Check for existing lead with various formats
            const formats = [phone, `+${phone}`, `p:+${phone}`];
            const placeholders = formats.map(() => '?').join(' OR phone = ');
            const existing = await db.query(`SELECT id FROM leads WHERE phone = ${placeholders}`, formats);

            if (existing.rows.length > 0) {
                leadId = existing.rows[0].id;
                console.log(`[DEBUG] Found existing lead ${leadId} for phone ${phone}`);
                // Update Last Msg Time
                await db.query("UPDATE leads SET last_message_sent_at = CURRENT_TIMESTAMP WHERE id = ?", [leadId]);
            } else {
                console.warn(`[DEBUG] No lead found for ${phone}, creating stub...`);
                leadId = randomUUID();
                await db.query("INSERT INTO leads (id, phone, name, status) VALUES (?, ?, 'Unknown', 'NEW')", [leadId, phone]);
            }

            console.log(`[DEBUG] Inserting message for lead ${leadId}`);

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
                // Create stub lead if not exists
                leadId = randomUUID();
                await db.query("INSERT INTO leads (id, phone, name, status) VALUES (?, ?, 'Unknown', 'NEW')", [leadId, phone]);
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
        if (!this.client || this.status !== 'CONNECTED') return [];
        try {
            const chats = await this.client.getChats();

            // Resolve names in parallel
            const chatsWithDetails = await Promise.all(chats.map(async c => {
                let name = c.name;
                // If it's not a group and no name (or name is phone number), try to get contact info
                if (!c.isGroup) {
                    try {
                        const contact = await c.getContact();
                        console.log(`[DEBUG] Chat ${c.id.user}: Name=${contact.name}, Push=${contact.pushname}, Short=${contact.shortName}`);
                        // Priority: Saved Name -> Pushname -> ShortName -> Existing Name -> Phone
                        name = contact.name || contact.pushname || contact.shortName || name;

                        if (!name || name === c.id.user) {
                            // Fallback to DB with robust lookup
                            const phone = c.id.user; // Standard format from WA (no +)
                            // Check formats
                            const formats = [phone, `+${phone}`, `p:+${phone}`];
                            const placeholders = formats.map(() => '?').join(' OR phone = ');
                            const leadRes = await db.query(`SELECT name FROM leads WHERE phone = ${placeholders}`, formats);

                            if (leadRes.rows.length > 0 && leadRes.rows[0].name && leadRes.rows[0].name !== 'Unknown') {
                                name = leadRes.rows[0].name;
                            }
                        }

                        // If we resolved a real name (not phone), update the contact stub in DB if it exists as Unknown
                        if (name && name !== c.id.user) {
                            const phone = c.id.user;
                            await db.query("UPDATE leads SET name = ? WHERE phone = ? AND name = 'Unknown'", [name, phone]);
                        }

                        name = name || c.id.user;
                    } catch (err) {
                        console.error('Name resolve error:', err);
                        name = name || c.id.user;
                    }
                }

                return {
                    id: c.id._serialized,
                    name: name || c.id.user,
                    unreadCount: c.unreadCount,
                    timestamp: c.timestamp,
                    lastMessage: c.lastMessage ? c.lastMessage.body : ''
                };
            }));

            return chatsWithDetails;
        } catch (e) {
            console.error('Error getting chats:', e);
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
                leadId = randomUUID();
                await db.query(
                    'INSERT INTO leads (id, name, phone, source, status, last_message_sent_at) VALUES (?, ?, ?, ?, ?, ?)',
                    [leadId, name, phone, 'whatsapp_realtime', 'new', msgTime]
                );
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
        if (this.status !== 'CONNECTED') {
            console.log('Sync attempted but not connected');
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
                        leadId = randomUUID();
                        await db.query(
                            'INSERT INTO leads (id, name, phone, source, status, last_message_sent_at) VALUES (?, ?, ?, ?, ?, ?)',
                            [leadId, name, phone, 'whatsapp_sync', 'new', lastMessageTime]
                        );
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
}

module.exports = new WhatsAppService();
