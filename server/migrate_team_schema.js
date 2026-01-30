/**
 * Migration: Add Users and Assignment columns
 */
const db = require('./db');
const { randomUUID } = require('crypto');

async function migrate() {
    try {
        console.log('Running migration: Add Users and Assignment...');

        // 1. Create Users table
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    role TEXT DEFAULT 'agent', -- 'admin', 'agent'
                    status TEXT DEFAULT 'active',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Ensure table users exists.');
        } catch (err) {
            console.error('Error creating users table:', err);
        }

        // 2. Add Default Users (if empty)
        const userCount = await db.query("SELECT COUNT(*) as count FROM users");
        if (userCount.rows[0].count === 0) {
            await db.query("INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)",
                [randomUUID(), 'Admin User', 'admin@example.com', 'admin']);
            await db.query("INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)",
                [randomUUID(), 'Sarah Agent', 'sarah@example.com', 'agent']);
            await db.query("INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)",
                [randomUUID(), 'Mike Support', 'mike@example.com', 'agent']);
            console.log('Added default users.');
        } else {
            console.log('Users table already populated.');
        }

        // 3. Add assigned_to to leads
        try {
            await db.query("SELECT assigned_to FROM leads LIMIT 1");
            console.log('Column assigned_to already exists in leads.');
        } catch (err) {
            await db.query("ALTER TABLE leads ADD COLUMN assigned_to TEXT REFERENCES users(id)");
            console.log('Added assigned_to column to leads.');
        }

        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
