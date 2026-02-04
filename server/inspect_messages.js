const db = require('./db');
async function inspect() {
    console.log('--- RECENT MESSAGES ---');
    const res = await db.query("SELECT id, type, direction, campaign_id, content FROM messages ORDER BY timestamp DESC LIMIT 5");
    console.log(JSON.stringify(res.rows, null, 2));
}
inspect();
