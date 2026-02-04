const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/mce.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Running Quick Responses Migration...');

    db.run(`
        CREATE TABLE IF NOT EXISTS quick_responses (
            id TEXT PRIMARY KEY,
            organization_id TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            type TEXT DEFAULT 'text', -- text, image, video
            media_url TEXT,
            shortcut TEXT, -- e.g. "intro" for /intro
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('✅ quick_responses table created successfully.');
        }
    });
});

db.close();
