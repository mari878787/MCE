const db = require('../db');

const migrate = async () => {
    console.log('Starting Phone Constraint Migration...');
    try {
        await db.query('BEGIN TRANSACTION');

        // 1. Rename existing table
        await db.query('ALTER TABLE leads RENAME TO leads_backup');

        // 2. Create new table (EXACT COPY of schema but NO unique constraint on phone if it existed)
        // We ensure phone is just NOT NULL
        await db.query(`
            CREATE TABLE leads (
                id TEXT PRIMARY KEY,
                organization_id TEXT,
                name TEXT,
                phone TEXT NOT NULL,
                email TEXT,
                source TEXT,
                status TEXT DEFAULT 'NEW',
                score INTEGER DEFAULT 0,
                tags TEXT,
                tracking_dna TEXT,
                metadata TEXT,
                assigned_to INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_message_sent_at DATETIME,
                stopped_automation INTEGER DEFAULT 0,
                FOREIGN KEY(assigned_to) REFERENCES users(id),
                FOREIGN KEY(organization_id) REFERENCES organizations(id)
            )
        `);

        // 3. Copy Data
        // We list columns explicitly to be safe
        const columns = 'id, organization_id, name, phone, email, source, status, score, tags, tracking_dna, metadata, assigned_to, created_at, updated_at, last_message_sent_at, stopped_automation';
        await db.query(`INSERT INTO leads (${columns}) SELECT ${columns} FROM leads_backup`);

        // 4. Create Correct Composite Index
        await db.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_phone_org ON leads(phone, organization_id)');

        // 5. Drop Backup
        await db.query('DROP TABLE leads_backup');

        await db.query('COMMIT');
        console.log('Migration Successful: Phone constraint scoped to Organization.');

    } catch (err) {
        console.error('Migration Failed:', err);
        await db.query('ROLLBACK');
    }
};

migrate();
