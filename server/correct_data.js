const db = require('./db');

async function correctData() {
    console.log('Correcting Data...');

    // 1. Get the running campaign ID
    const camps = await db.query("SELECT id FROM campaigns WHERE status = 'RUNNING' LIMIT 1");
    if (camps.rows.length === 0) {
        console.log('No running campaign found.');
        return;
    }
    const campaignId = camps.rows[0].id;
    console.log('Target Campaign:', campaignId);

    // 2. Backfill Messages (Assume all Recent Nulls belong here)
    console.log('Backfilling messages...');
    await db.query("UPDATE messages SET campaign_id = ? WHERE campaign_id IS NULL AND direction = 'outbound'", [campaignId]);

    // 3. Update Audience to Step 2 (Assume they received Step 1)
    console.log('Advancing audience to Step 2...');
    await db.query(`
        UPDATE campaign_audience 
        SET current_step = 2, status = 'PENDING', next_run_at = datetime('now') 
        WHERE campaign_id = ? AND current_step = 1
    `, [campaignId]);

    console.log('Done.');
}

correctData();
