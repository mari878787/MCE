const db = require('./db');
const { v4: uuidv4 } = require('uuid');

async function run() {
    try {
        console.log('=== TESTING DETAILED ANALYTICS (LOGIC) ===');

        const campId = uuidv4();
        // 1. Create Campaign
        await db.query('INSERT INTO campaigns (id, name, status) VALUES (?, ?, ?)', [campId, 'Deep Analytics Test', 'RUNNING']);

        // 2. Create Audience
        const lead1 = uuidv4();
        const lead2 = uuidv4();

        // Randomize phone to prevent collision with bad data
        const p1 = Math.floor(Math.random() * 1e9).toString();
        const p2 = Math.floor(Math.random() * 1e9).toString();

        await db.query("INSERT INTO leads (id, name, phone, status) VALUES (?, 'L1', ?, 'NEW')", [lead1, p1]);
        await db.query("INSERT INTO leads (id, name, phone, status) VALUES (?, 'L2', ?, 'INTERESTED')", [lead2, p2]);

        await db.query("INSERT INTO campaign_audience (id, campaign_id, lead_id, status) VALUES (?, ?, ?, ?)", [uuidv4(), campId, lead1, 'COMPLETED']);
        await db.query("INSERT INTO campaign_audience (id, campaign_id, lead_id, status) VALUES (?, ?, ?, ?)", [uuidv4(), campId, lead2, 'COMPLETED']);

        // 3. Create Messages (Performance)
        // Msg 1: Sent to L1
        await db.query("INSERT INTO messages (id, lead_id, campaign_id, type, direction, status) VALUES (?, ?, ?, ?, ?, ?)",
            [uuidv4(), lead1, campId, 'whatsapp', 'outbound', 'sent']);

        // Msg 2: Read by L2
        await db.query("INSERT INTO messages (id, lead_id, campaign_id, type, direction, status) VALUES (?, ?, ?, ?, ?, ?)",
            [uuidv4(), lead2, campId, 'whatsapp', 'outbound', 'read']);

        // Msg 3: Reply from L2 (Inbound)
        await db.query("INSERT INTO messages (id, lead_id, campaign_id, type, direction, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
            [uuidv4(), lead2, campId, 'whatsapp', 'inbound']);

        // 4. Run Query (Simulate API Logic - Updated)
        const audRes = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
                (SELECT COUNT(*) FROM campaign_audience ca JOIN leads l ON ca.lead_id = l.id WHERE ca.campaign_id = ? AND l.status = 'INTERESTED') as interested
            FROM campaign_audience WHERE campaign_id = ?
        `, [campId, campId]);

        const msgRes = await db.query(`
            SELECT 
                COUNT(*) as sent,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read
            FROM messages WHERE campaign_id = ? AND direction = 'outbound'
        `, [campId]);

        const replyRes = await db.query(`
            SELECT COUNT(DISTINCT m.lead_id) as replies
            FROM messages m
            JOIN campaign_audience ca ON m.lead_id = ca.lead_id
            WHERE ca.campaign_id = ? AND m.direction = 'inbound'
        `, [campId]);

        const stats = {
            total: audRes.rows[0].total,
            interested: audRes.rows[0].interested,
            sent: msgRes.rows[0].sent,
            read: msgRes.rows[0].read,
            replies: replyRes.rows[0].replies
        };

        console.log('Stats Result:', stats);

        // EXPECTATIONS:
        // Total Audience: 2
        // Interested: 1 (L2)
        // Sent: 2 (Outbound msgs to L1 and L2)
        // Read: 1 (Msg2)
        // Replies: 1 (Msg3 from L2)

        if (stats.total === 2 && stats.interested === 1 && stats.sent === 2 && stats.read === 1 && stats.replies === 1) {
            console.log('✅ Detailed Analytics Verification PASSED');
        } else {
            console.error('❌ Stats Calculation Mismatch');
        }

    } catch (e) {
        console.error(e);
    }
}

run();
