const db = require('./db');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

async function initAuth() {
    try {
        console.log('Re-initializing users table for Auth...');

        // Check if password column exists, if not re-create table
        // For simplicity in this dev environment, we will drop and recreate to ensure schema match
        await db.query("DROP TABLE IF EXISTS users");

        console.log('Creating users table with password...');
        await db.query(`
            CREATE TABLE users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'agent',
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Seeding default admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await db.query("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
            [randomUUID(), 'Admin User', 'admin@example.com', hashedPassword, 'admin']);

        console.log('Auth Init Complete. Default user: admin@example.com / admin123');

    } catch (err) {
        console.error('Auth Init Error:', err);
    }
}

initAuth();
