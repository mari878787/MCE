const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/mce.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Running Tracking Migration...');

    db.run(`CREATE TABLE IF NOT EXISTS tracked_links (
        id TEXT PRIMARY KEY,
        organization_id TEXT,
        lead_id TEXT,
        url TEXT NOT NULL,
        title TEXT,
        views INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(organization_id) REFERENCES organizations(id),
        FOREIGN KEY(lead_id) REFERENCES leads(id)
    )`, (err) => {
        if (err) console.error('Error creating table:', err);
        else console.log('✅ Created tracked_links table');
    });

    db.run(`CREATE TABLE IF NOT EXISTS link_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        link_id TEXT,
        viewer_ip TEXT,
        user_agent TEXT,
        viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(link_id) REFERENCES tracked_links(id)
    )`, (err) => {
        if (err) console.error('Error creating link_views:', err);
        else console.log('✅ Created link_views table');
    });
});

db.close();
