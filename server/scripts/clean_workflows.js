const db = require('../db');

async function clean() {
    try {
        console.log('Cleaning up dummy data...');
        await db.query('DELETE FROM workflows');
        await db.query('DELETE FROM workflow_nodes');
        await db.query('DELETE FROM workflow_edges');
        console.log('All workflows deleted.');
    } catch (e) {
        console.error(e);
    }
}

clean();
