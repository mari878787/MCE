const db = require('./db');
async function inspect() {
    console.log('--- DUPLICATE CHECK ---');
    const res = await db.query(`
        SELECT lead_id, count(*) as count 
        FROM campaign_audience 
        GROUP BY lead_id 
        HAVING count > 1
    `);
    console.log("Duplicate Lead IDs:", JSON.stringify(res.rows, null, 2));

    console.log('\n--- ALL AUDIENCE ENTRIES ---');
    const all = await db.query(`
        SELECT ca.id, ca.lead_id, l.name, ca.current_step, ca.status, ca.next_run_at 
        FROM campaign_audience ca
        LEFT JOIN leads l ON ca.lead_id = l.id
    `);
    console.log(JSON.stringify(all.rows, null, 2));
}
inspect();
