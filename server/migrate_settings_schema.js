/**
 * Migration: Create Settings Table
 */
const db = require('./db');

async function migrate() {
    try {
        console.log('Running migration: Create Settings table...');

        // 1. Create Settings table
        await db.query(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Ensured table settings exists.');

        // 2. Insert default setting if not exists
        const check = await db.query("SELECT key FROM settings WHERE key = 'auto_reply_enabled'");
        if (check.rows.length === 0) {
            await db.query("INSERT INTO settings (key, value) VALUES (?, ?)", ['auto_reply_enabled', 'true']);
            console.log('Inserted default auto_reply_enabled = true');
        }

        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
