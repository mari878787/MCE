const db = require('./db');

async function deepDebug() {
    try {
        console.log('--- DEEP DEBUG ---');

        // 1. Check Messages Table
        console.log('\n[1] Messages Table Sample:');
        const msgs = await db.query('SELECT id, lead_id, direction, type FROM messages LIMIT 5');
        console.log(JSON.stringify(msgs.rows, null, 2));

        if (msgs.rows.length === 0) {
            console.log('NO MESSAGES FOUND.');
            return;
        }

        // 2. Check specific Lead IDs from those messages
        const leadIds = msgs.rows.map(m => m.lead_id).filter(id => id);
        console.log('\n[2] Checking Leads for these Message LeadIDs:', leadIds);

        if (leadIds.length > 0) {
            const placeholders = leadIds.map(() => '?').join(',');
            const leads = await db.query(`SELECT id, name, organization_id FROM leads WHERE id IN (${placeholders})`, leadIds);
            console.log('Found Leads:', JSON.stringify(leads.rows, null, 2));
        } else {
            console.log('No Lead IDs in messages?');
        }

        // 3. Check Organization ID being used by the backend currently
        // We can't easily see the "current user's" org ID without a request, but we can see what Users exist.
        console.log('\n[3] Users & their Orgs:');
        const users = await db.query('SELECT id, email, organization_id FROM users');
        console.log(JSON.stringify(users.rows, null, 2));

        // 4. Test the Analytics Query Manually for the first User's Org
        if (users.rows.length > 0) {
            const testOrgId = users.rows[0].organization_id;
            console.log('\n[4] Testing Analytics Query for Org:', testOrgId);
            const res = await db.query(
                `SELECT COUNT(m.id) as count 
                 FROM messages m 
                 JOIN leads l ON m.lead_id = l.id 
                 WHERE m.direction = 'outbound' AND l.organization_id = ?`,
                [testOrgId]
            );
            console.log('Result:', res.rows[0].count);
        }

    } catch (e) {
        console.error(e);
    }
}

deepDebug();
