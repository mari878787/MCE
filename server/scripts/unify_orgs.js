const db = require('../db');

async function fixOrgs() {
    try {
        console.log('Fixing Organizations...');

        // 1. Get the Admin User's Org ID
        const users = await db.query("SELECT * FROM users LIMIT 1");
        if (users.rows.length === 0) throw new Error('No users found');

        const adminUser = users.rows[0];
        const correctOrgId = adminUser.organization_id;

        console.log(`Target Org ID: ${correctOrgId} (from user ${adminUser.email})`);

        if (!correctOrgId) throw new Error('User has no Org ID');

        // 2. Update ALL leads to this Org ID
        // This is a nuclear option for a single-user system repair
        const result = await db.query(
            "UPDATE leads SET organization_id = ?",
            [correctOrgId]
        );

        console.log(`Updated all leads to join Organization ${correctOrgId}.`);

        // 3. Update verify
        const verify = await db.query("SELECT count(*) as count FROM leads WHERE organization_id = ?", [correctOrgId]);
        console.log(`Total Leads in Org: ${verify.rows[0].count}`);

    } catch (e) {
        console.error(e);
    }
}

fixOrgs();
