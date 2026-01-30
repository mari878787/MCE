
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'leads.db');
const db = new sqlite3.Database(dbPath);

const schema = `
-- Campaign Steps
CREATE TABLE IF NOT EXISTS campaign_steps (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    type TEXT NOT NULL,
    content TEXT,
    meta TEXT,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Campaign Audience
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

-- Add scheduled_at to campaigns if it doesn't exist
-- SQLite doesn't support IF NOT EXISTS for columns, so we try/catch
ALTER TABLE campaigns ADD COLUMN scheduled_at DATETIME;
`;

// Drop old simple campaigns table to rebuild (since we are in dev and user wants "Advanced")
// Or we can just keep it and ignore the 'template_content' column. 
// For cleanliness, we will try to just add the tables first. If we need to drop, we will do it manually.

db.serialize(() => {
    // Run creation
    db.exec(schema, (err) => {
        if (err) {
            console.warn('Schema apply warning (might already exist):', err.message);
        } else {
            console.log('Tables created/verified.');
        }
    });

    // Try adding column
    db.run("ALTER TABLE campaigns ADD COLUMN scheduled_at DATETIME", (err) => {
        if (err) console.log("Column scheduled_at might already exist.");
        else console.log("Added column scheduled_at.");
    });
});
