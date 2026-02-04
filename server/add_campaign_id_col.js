const db = require('./db');

async function migrate() {
    console.log('Adding campaign_id column to messages table...');
    try {
        await db.query(`ALTER TABLE messages ADD COLUMN campaign_id TEXT DEFAULT NULL`);
        console.log('Column added successfully.');
    } catch (err) {
        if (err.message.includes('duplicate column')) {
            console.log('Column already exists.');
        } else {
            console.error('Error:', err.message);
        }
    }
}
migrate();
