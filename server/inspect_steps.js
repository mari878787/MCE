const db = require('./db');
async function inspect() {
    console.log('--- CAMPAIGN AUDIENCE STEPS ---');
    const res = await db.query("SELECT campaign_id, current_step, status, next_run_at FROM campaign_audience");
    console.log(JSON.stringify(res.rows, null, 2));
}
inspect();
