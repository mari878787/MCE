const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/mce.db');
const db = new sqlite3.Database(dbPath);

const schema = `
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    target_filter TEXT DEFAULT 'ALL',
    status TEXT DEFAULT 'DRAFT',
    scheduled_at DATETIME,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaign_steps (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    type TEXT NOT NULL,
    content TEXT,
    meta TEXT,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS campaign_audience (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    lead_id TEXT NOT NULL,
    current_step INTEGER DEFAULT 1,
    status TEXT DEFAULT 'PENDING',
    next_run_at DATETIME,
    last_run_at DATETIME,
    error_message TEXT,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY(lead_id) REFERENCES leads(id)
);
`;

db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    const statements = schema.split(';').filter(s => s.trim());
    for (const stmt of statements) {
        db.run(stmt, (err) => {
            if (err) console.error('Error executing:', stmt, err);
            else console.log('Executed successfully');
        });
    }
    db.run('COMMIT', () => {
        console.log('Tables created/verified.');
        db.close();
    });
});
