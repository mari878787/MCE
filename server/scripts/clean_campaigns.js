const db = require('../db');

async function clean() {
    try {
        console.log('Cleaning up campaign data...');
        // Order matters for foreign keys
        await db.query('DELETE FROM campaign_audience');
        await db.query('DELETE FROM campaign_steps');
        await db.query('DELETE FROM campaigns');

        // Also clean up messages linked to these campaigns if any (optional, but good for "deep" clean)
        // await db.query('DELETE FROM messages WHERE campaign_id IS NOT NULL'); 

        console.log('All campaigns purged.');
    } catch (e) {
        console.error(e);
    }
}

clean();
