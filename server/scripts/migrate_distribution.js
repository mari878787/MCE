const db = require('../db');

(async () => {
    try {
        console.log('Migrating users table to add last_assigned_at...');

        // Add last_assigned_at column (using catch for "duplicate column" error if re-run)
        try {
            await db.query(`ALTER TABLE users ADD COLUMN last_assigned_at DATETIME`);
            console.log('Added last_assigned_at column.');
        } catch (e) {
            console.log('last_assigned_at column might already exist:', e.message);
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
})();
