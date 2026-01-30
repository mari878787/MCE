
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'mce.db');
const db = new sqlite3.Database(dbPath);

const schema = `
-- Smart Segments (Saved Filters)
CREATE TABLE IF NOT EXISTS segments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    criteria_json TEXT NOT NULL, -- JSON object storing rules e.g. { "operator": "AND", "rules": [...] }
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

db.serialize(() => {
    db.exec(schema, (err) => {
        if (err) {
            console.error('Schema apply error:', err.message);
        } else {
            console.log('Segments table created/verified.');
        }
    });
});
