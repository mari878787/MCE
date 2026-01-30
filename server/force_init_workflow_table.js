const db = require('./db');

async function run() {
    try {
        console.log('Forcing creation of workflow tables...');

        await db.query(`
        CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            name TEXT,
            nodes TEXT, -- JSON
            edges TEXT, -- JSON
            status TEXT DEFAULT 'DRAFT',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        `);
        console.log(' - Created workflows table');

        await db.query(`
        CREATE TABLE IF NOT EXISTS workflow_executions (
            id TEXT PRIMARY KEY,
            workflow_id TEXT NOT NULL,
            lead_id TEXT NOT NULL,
            current_node_id TEXT, -- The Node ID (string) we are currently at (or just finished)
            status TEXT DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, WAITING
            context TEXT, -- JSON bag for variables (e.g. { "form_data": ... })
            next_run_at DATETIME, -- For delays
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(workflow_id) REFERENCES workflows(id),
            FOREIGN KEY(lead_id) REFERENCES leads(id)
        );
        `);
        console.log(' - Created workflow_executions table');

    } catch (e) {
        console.error('FAIL:', e);
    }
}

run();
