/**
 * Migration: Add sentiment column to messages table
 */
const db = require('./db');

async function migrate() {
    try {
        console.log('Running migration: Add sentiment column...');

        // Check if column exists
        try {
            await db.query("SELECT sentiment FROM messages LIMIT 1");
            console.log('Column sentiment already exists.');
        } catch (err) {
            if (err.message.includes('no such column')) {
                await db.query("ALTER TABLE messages ADD COLUMN sentiment TEXT DEFAULT 'NEUTRAL'");
                console.log('Added sentiment column.');
            } else {
                throw err;
            }
        }

        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
