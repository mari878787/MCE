const db = require('./db');
const { v4: uuidv4 } = require('uuid');

async function run() {
    try {
        console.log('=== TESTING CAMPAIGN STATS ENDPOINT (LOGIC) ===');

        // 1. Setup Data
        const campId = uuidv4();
        await db.query('INSERT INTO campaigns (id, name, status) VALUES (?, ?, ?)', [campId, 'Stats Test Campaign', 'RUNNING']);

        // Add audience with mixed statuses
        const leadId = uuidv4(); // We can reuse leadId or create new. FK constraint on leads?
        // Need to ensure lead exists. 
        // Let's create a lead first.
        await db.query("INSERT OR IGNORE INTO leads (id, name, phone) VALUES (?, ?, ?)", [leadId, 'Stats Tester', '5555555555']);

        // Insert audience rows
        await db.query("INSERT INTO campaign_audience (id, campaign_id, lead_id, status) VALUES (?, ?, ?, ?)", [uuidv4(), campId, leadId, 'COMPLETED']);
        await db.query("INSERT INTO campaign_audience (id, campaign_id, lead_id, status) VALUES (?, ?, ?, ?)", [uuidv4(), campId, leadId, 'FAILED']);
        await db.query("INSERT INTO campaign_audience (id, campaign_id, lead_id, status) VALUES (?, ?, ?, ?)", [uuidv4(), campId, leadId, 'PENDING']);

        // 2. Query Stats (Replicating Endpoint Logic)
        const result = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status IN ('PENDING', 'ACTIVE', 'WAITING') THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
            FROM campaign_audience 
            WHERE campaign_id = ?
        `, [campId]);

        const stats = result.rows[0];
        console.log('Stats Result:', stats);

        if (stats.total === 3 && stats.completed === 1 && stats.failed === 1 && stats.pending === 1) {
            console.log('✅ Campaign Stats Verification PASSED');
        } else {
            console.error('❌ Stats Calculation Mismatch');
        }

    } catch (e) {
        console.error(e);
    }
}

run();
