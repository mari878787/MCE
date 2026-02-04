const db = require('./db');
const { randomUUID } = require('crypto');

async function migrateToSaaS() {
    try {
        console.log('Starting SaaS Migration...');

        // 1. Create Organizations Table
        console.log('Creating organizations table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS organizations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Create Default Organization (for existing data)
        const defaultOrgId = randomUUID();
        console.log(`Creating Default Organization (ID: ${defaultOrgId})...`);
        await db.query("INSERT INTO organizations (id, name) VALUES (?, ?)", [defaultOrgId, 'My Agency']);

        // 3. Add organization_id to Users
        console.log('Migrating Users...');
        try {
            await db.query("ALTER TABLE users ADD COLUMN organization_id TEXT");
        } catch (e) { console.log('Column organization_id likely exists on users'); }
        await db.query("UPDATE users SET organization_id = ? WHERE organization_id IS NULL", [defaultOrgId]);

        // 4. Add to Leads
        console.log('Migrating Leads...');
        try {
            await db.query("ALTER TABLE leads ADD COLUMN organization_id TEXT");
        } catch (e) { }
        await db.query("UPDATE leads SET organization_id = ? WHERE organization_id IS NULL", [defaultOrgId]);

        // 5. Add to Campaigns
        console.log('Migrating Campaigns...');
        try {
            await db.query("ALTER TABLE campaigns ADD COLUMN organization_id TEXT");
        } catch (e) { }
        await db.query("UPDATE campaigns SET organization_id = ? WHERE organization_id IS NULL", [defaultOrgId]);

        // 6. Add to Workflows
        console.log('Migrating Workflows...');
        try {
            await db.query("ALTER TABLE workflows ADD COLUMN organization_id TEXT");
        } catch (e) { }
        await db.query("UPDATE workflows SET organization_id = ? WHERE organization_id IS NULL", [defaultOrgId]);

        // 7. Add to Messages
        // Note: Messages link to Leads, so technically we can derive Org from Lead, 
        // but explicit column helps performance and isolation security.
        console.log('Migrating Messages...');
        try {
            await db.query("ALTER TABLE messages ADD COLUMN organization_id TEXT");
        } catch (e) { }
        await db.query("UPDATE messages SET organization_id = ? WHERE organization_id IS NULL", [defaultOrgId]);

        console.log('SaaS Migration Complete!');
        console.log('All existing data assigned to "My Agency"');

    } catch (err) {
        console.error('Migration Failed:', err);
    }
}

migrateToSaaS();
