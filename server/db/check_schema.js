const db = require('./index');

(async () => {
    try {
        console.log('Checking messages table columns via SELECT...');
        // get 0 rows just to see keys? No, db.all returns array of objects.
        // We need at least one row or just check if it throws error for created_at

        try {
            const res = await db.query("SELECT created_at FROM messages LIMIT 1");
            console.log('Column created_at EXISTS.');
        } catch (e) {
            console.log('Column created_at MISSING:', e.message);
        }

        try {
            const res = await db.query("SELECT timestamp FROM messages LIMIT 1");
            console.log('Column timestamp EXISTS.');
        } catch (e) {
            console.log('Column timestamp MISSING:', e.message);
        }

    } catch (e) {
        console.error(e);
    }
})();
