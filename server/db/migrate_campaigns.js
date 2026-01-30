
const db = require('./index');

async function migrate() {
    console.log('Migrating DB...');
    await db.query(`
        CREATE TABLE IF NOT EXISTS campaigns (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            template_content TEXT NOT NULL,
            target_filter TEXT DEFAULT 'ALL',
            status TEXT DEFAULT 'DRAFT',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS campaign_logs (
            id TEXT PRIMARY KEY,
            campaign_id TEXT,
            lead_id TEXT,
            status TEXT DEFAULT 'PENDING',
            sent_at DATETIME,
            error_message TEXT,
            FOREIGN KEY(campaign_id) REFERENCES campaigns(id),
            FOREIGN KEY(lead_id) REFERENCES leads(id)
        );
    `);
    console.log('Migration Complete');
}

migrate();
