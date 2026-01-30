const db = require('./db');

async function fix() {
    try {
        console.log('Dropping users table...');
        await db.query("DROP TABLE IF EXISTS users");
        console.log('Dropped.');

        // Re-run migration logic
        console.log('Creating users table with TEXT ID...');
        await db.query(`
            CREATE TABLE users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                role TEXT DEFAULT 'agent',
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created.');

        console.log('Adding default users...');
        const { randomUUID } = require('crypto');
        await db.query("INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)",
            [randomUUID(), 'Admin User', 'admin@example.com', 'admin']);
        await db.query("INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)",
            [randomUUID(), 'Sarah Agent', 'sarah@example.com', 'agent']);
        await db.query("INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)",
            [randomUUID(), 'Mike Support', 'mike@example.com', 'agent']);

        console.log('Fix Complete.');
    } catch (err) {
        console.error(err);
    }
}

fix();
