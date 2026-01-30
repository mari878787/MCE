
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'mce.db');
const db = new sqlite3.Database(dbPath);

const schema = `
-- Workflows (The Container)
CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'INACTIVE', -- ACTIVE, INACTIVE
    trigger_type TEXT, -- NEW_LEAD, WEBHOOK, etc. (helper for quick lookup)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Nodes (The Logic Blocks)
CREATE TABLE IF NOT EXISTS workflow_nodes (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    type TEXT NOT NULL, -- TRIGGER, ACTION, CONDITION, CAMPAIGN
    position_x REAL,
    position_y REAL,
    data_json TEXT, -- Config like { "message": "hi", "campaign_id": "123" }
    FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Workflow Edges (The Connections)
CREATE TABLE IF NOT EXISTS workflow_edges (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    source_handle TEXT,
    target_handle TEXT,
    FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);
`;

db.serialize(() => {
    db.exec(schema, (err) => {
        if (err) {
            console.error('Schema apply error:', err.message);
        } else {
            console.log('Workflow tables created/verified.');
        }
    });
});
