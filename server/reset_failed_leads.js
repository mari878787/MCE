const db = require('./db');

async function resetFailed() {
    console.log('Resetting FAILED leads to PENDING...');
    await db.query("UPDATE campaign_audience SET status = 'PENDING', next_run_at = datetime('now') WHERE status = 'FAILED'");
    console.log('Done.');
}

resetFailed().catch(console.error);
