const db = require('./db');

async function inspect() {
    console.log('\n--- LEADS ---');
    const leads = await db.query('SELECT id, name, phone, stopped_automation FROM leads');
    console.log(JSON.stringify(leads.rows, null, 2));

    console.log('\n--- CAMPAIGNS ---');
    const campaigns = await db.query('SELECT id, name, status FROM campaigns');
    console.log(JSON.stringify(campaigns.rows, null, 2));

    console.log('\n--- CAMPAIGN AUDIENCE ---');
    if (campaigns.rows.length > 0) {
        const aud = await db.query('SELECT * FROM campaign_audience');
        console.log(JSON.stringify(aud.rows, null, 2));
    }
}

inspect().catch(console.error);
