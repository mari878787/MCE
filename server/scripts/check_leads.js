const db = require('../db');
async function check() {
    try {
        const res = await db.query('SELECT status, source, name, phone FROM leads');
        console.log('Leads found:', res.rows);
    } catch (e) { console.error(e); }
}
check();
