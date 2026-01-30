/**
 * Migration: Add Auto Replies table
 */
const db = require('./db');
const { randomUUID } = require('crypto');

async function migrate() {
    try {
        console.log('Running migration: Add Auto Replies...');

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS auto_replies (
                    id TEXT PRIMARY KEY,
                    keyword TEXT NOT NULL, -- e.g. "pricing", "hello"
                    response TEXT NOT NULL, -- e.g. "Here is our pricing..."
                    match_type TEXT DEFAULT 'contains', -- 'exact', 'contains'
                    is_active INTEGER DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Ensure table auto_replies exists.');
        } catch (err) {
            console.error('Error creating auto_replies table:', err);
        }

        // Add some default rules
        const count = await db.query("SELECT COUNT(*) as count FROM auto_replies");
        if (count.rows[0].count === 0) {
            await db.query("INSERT INTO auto_replies (id, keyword, response, match_type) VALUES (?, ?, ?, ?)",
                [randomUUID(), 'price', 'Our pricing starts at $99/mo. Would you like a demo?', 'contains']);
            await db.query("INSERT INTO auto_replies (id, keyword, response, match_type) VALUES (?, ?, ?, ?)",
                [randomUUID(), 'address', 'We are located at 123 Innovation Dr, Tech City.', 'contains']);
            console.log('Added default auto-replies.');
        }

        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
