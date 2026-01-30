const db = require('./db');

async function migrate() {
    try {
        console.log('Starting Analytics Schema Migration...');

        // 1. Add 'status' column to messages
        try {
            await db.query("ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'sent'");
            console.log('✅ Added status column to messages');
        } catch (e) {
            if (e.message.includes('duplicate column')) {
                console.log('ℹ️ status column already exists');
            } else {
                console.error('❌ Failed to add status column:', e.message);
            }
        }

        // 2. Add 'campaign_id' column to messages
        try {
            await db.query("ALTER TABLE messages ADD COLUMN campaign_id TEXT");
            console.log('✅ Added campaign_id column to messages');
        } catch (e) {
            if (e.message.includes('duplicate column')) {
                console.log('ℹ️ campaign_id column already exists');
            } else {
                console.error('❌ Failed to add campaign_id column:', e.message);
            }
        }

        console.log('Migration Complete.');
    } catch (err) {
        console.error('Migration Failed:', err);
    }
}

migrate();
