const db = require('./db');

async function debugAnalytics() {
    console.log('--- DEBUG ANALYTICS ---');

    console.log('1. Organizations:');
    const orgs = await db.query('SELECT * FROM organizations');
    console.log(JSON.stringify(orgs.rows, null, 2));

    console.log('\n2. Total Messages (Raw):');
    const allMsgs = await db.query('SELECT count(*) as total FROM messages');
    console.log('Total:', allMsgs.rows[0].total);

    console.log('\n3. Messages by Direction:');
    const byDir = await db.query('SELECT direction, count(*) as count FROM messages GROUP BY direction');
    console.log(JSON.stringify(byDir.rows, null, 2));

    console.log('\n4. Messages joined with Leads (checking Org ID):');
    // Using LEFT JOIN to see if leads are missing
    const joinCheck = await db.query(`
        SELECT 
            m.id as msg_id, 
            m.direction, 
            l.id as lead_id, 
            l.organization_id 
        FROM messages m 
        LEFT JOIN leads l ON m.lead_id = l.id
        LIMIT 10
    `);
    console.log(JSON.stringify(joinCheck.rows, null, 2));

    console.log('\n5. Leads Sample (checking Org ID):');
    const leads = await db.query('SELECT id, name, organization_id FROM leads LIMIT 5');
    console.log(JSON.stringify(leads.rows, null, 2));
}

debugAnalytics();
