const db = require('./db');

async function cleanup() {
    console.log('Cleaning up duplicate audience entries...');

    // 1. Find duplicates
    const duplicates = await db.query(`
        SELECT lead_id, campaign_id, count(*) as qty
        FROM campaign_audience
        GROUP BY lead_id, campaign_id
        HAVING qty > 1
    `);

    for (const row of duplicates.rows) {
        console.log(`Fixing Lead ${row.lead_id} in Campaign ${row.campaign_id} (${row.qty} entries)...`);

        // Get all entries for this lead/campaign
        const entries = await db.query(`
            SELECT id, status, current_step 
            FROM campaign_audience 
            WHERE lead_id = ? AND campaign_id = ?
            ORDER BY next_run_at DESC
        `, [row.lead_id, row.campaign_id]);

        // Keep the first one (latest next_run_at), delete the rest
        const [keep, ...remove] = entries.rows;

        for (const item of remove) {
            console.log(`Deleting duplicate entry ${item.id} (Status: ${item.status})`);
            await db.query('DELETE FROM campaign_audience WHERE id = ?', [item.id]);
        }
    }
    console.log('Done.');
}

cleanup();
