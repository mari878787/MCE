const db = require('./index');

async function migrate() {
    try {
        console.log('Migrating: Adding metadata column to leads table...');
        await db.query('ALTER TABLE leads ADD COLUMN metadata TEXT');
        console.log('Migration successful.');
    } catch (e) {
        if (e.message.includes('duplicate column')) {
            console.log('Column already exists.');
        } else {
            console.error('Migration failed:', e);
        }
    }
}

migrate();
