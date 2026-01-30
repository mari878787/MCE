
const db = require('./db');
async function check() {
    try {
        const res = await db.query('SELECT id, name, phone, last_message_sent_at FROM leads ORDER BY last_message_sent_at DESC LIMIT 10');
        console.log('--- DB LEADS ---');
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    }
}
check();
