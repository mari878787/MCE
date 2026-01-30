/**
 * Migration: Add ROI tracking columns
 */
const db = require('./db');

async function migrate() {
    try {
        console.log('Running migration: Add ROI columns...');

        // Add lead_value to leads (default 0)
        try {
            await db.query("SELECT lead_value FROM leads LIMIT 1");
            console.log('Column lead_value already exists in leads.');
        } catch (err) {
            await db.query("ALTER TABLE leads ADD COLUMN lead_value REAL DEFAULT 0");
            console.log('Added lead_value column to leads.');
        }

        // Add cost/budget to campaigns
        try {
            await db.query("SELECT budget FROM campaigns LIMIT 1");
            console.log('Column budget already exists in campaigns.');
        } catch (err) {
            await db.query("ALTER TABLE campaigns ADD COLUMN budget REAL DEFAULT 0"); // Total Budget
            await db.query("ALTER TABLE campaigns ADD COLUMN spend REAL DEFAULT 0"); // Actual Spend
            console.log('Added budget and spend columns to campaigns.');
        }

        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
