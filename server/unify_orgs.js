const db = require('./db');

async function unify() {
    console.log('Unifying Organization IDs...');

    // 1. Get the Main Org
    const orgRes = await db.query('SELECT id FROM organizations LIMIT 1');
    if (orgRes.rows.length === 0) {
        // Create one if missing
        console.log('No org found, creating one...');
        // Not implementing creation here, assuming one exists or using a hardcoded UUID if needed
        return;
    }
    const mainOrgId = orgRes.rows[0].id;
    console.log('Using Master Org ID:', mainOrgId);

    // 2. Update Leads
    console.log('Updating Leads...');
    await db.query('UPDATE leads SET organization_id = ?', [mainOrgId]);

    // 3. Update Campaigns
    console.log('Updating Campaigns...');
    await db.query('UPDATE campaigns SET organization_id = ?', [mainOrgId]);

    // 4. Update Users
    console.log('Updating Users...');
    await db.query('UPDATE users SET organization_id = ?', [mainOrgId]);

    console.log('Done. All data aligned to Org:', mainOrgId);
}

unify();
