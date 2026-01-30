const db = require('./index');

(async () => {
    try {
        console.log('Starting migration: Rename timestamp to created_at in messages...');

        // 1. Check if column exists to avoid error
        // SQLite doesn't behave nicely with IF EXISTS on column rename in all versions, 
        // but we'll assume the schema.sql state (timestamp exists)

        // Option A: Alter table directly (Supported in newer SQLite)
        try {
            await db.query(`ALTER TABLE messages RENAME COLUMN timestamp TO created_at`);
            console.log('Successfully renamed column via ALTER TABLE.');
        } catch (e) {
            console.log('ALTER TABLE failed (might be old SQLite), trying manual migration...', e.message);

            // Option B: Manual migration (Create new, Copy, Drop old)
            await db.query('BEGIN TRANSACTION');

            // 1. Create temporary table with correct schema
            await db.query(`
                CREATE TABLE messages_new (
                  id TEXT PRIMARY KEY,
                  lead_id TEXT,
                  type TEXT,
                  direction TEXT,
                  content TEXT,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY(lead_id) REFERENCES leads(id)
                );
            `);

            // 2. Copy data
            await db.query(`
                INSERT INTO messages_new (id, lead_id, type, direction, content, created_at)
                SELECT id, lead_id, type, direction, content, timestamp
                FROM messages;
            `);

            // 3. Drop old table
            await db.query('DROP TABLE messages');

            // 4. Rename new table
            await db.query('ALTER TABLE messages_new RENAME TO messages');

            await db.query('COMMIT');
            console.log('Manual migration successful.');
        }

    } catch (err) {
        console.error('Migration failed:', err);
        if (err.message.includes('no such column: timestamp')) {
            console.log('Column timestamp might not exist. Maybe already migrated?');
        }
    }
})();
