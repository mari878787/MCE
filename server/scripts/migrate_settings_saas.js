const db = require('../db');
const fs = require('fs');

async function migrate() {
    console.log('Starting Settings SaaS Migration...');

    try {
        // 1. Create table if not exists (initially global)
        // This handles case where settings might not exist at all yet
        await db.query(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY, 
                value TEXT, 
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Check if organization_id exists
        // SQLite: PRAGMA table_info(settings)
        const info = await db.query("PRAGMA table_info(settings)");
        const hasOrgId = info.rows.some(col => col.name === 'organization_id');

        if (!hasOrgId) {
            console.log('Adding organization_id to settings...');

            // SQLite cannot easily add column to Primary Key constraint.
            // We must recreate the table.

            // A. Rename existing
            await db.query("ALTER TABLE settings RENAME TO settings_old");

            // B. Create new table with organization_id in PK
            await db.query(`
                CREATE TABLE settings (
                    key TEXT,
                    value TEXT,
                    organization_id TEXT NOT NULL DEFAULT 'default-org',
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (key, organization_id)
                )
            `);

            // C. Copy Data (Assign to default Org)
            // Assuming 'default-org' exists or is what we seeded.
            // Let's verify default org ID from leads or users? 
            // Better to fetch valid org ID.
            const orgRes = await db.query("SELECT id FROM organizations LIMIT 1");
            const defaultOrgId = orgRes.rows.length > 0 ? orgRes.rows[0].id : 'default-org';

            console.log('Migrating global settings to Org:', defaultOrgId);

            const oldSettings = await db.query("SELECT * FROM settings_old");
            for (const row of oldSettings.rows) {
                await db.query(
                    "INSERT INTO settings (key, value, organization_id, updated_at) VALUES (?, ?, ?, ?)",
                    [row.key, row.value, defaultOrgId, row.updated_at]
                );
            }

            // D. Drop old
            await db.query("DROP TABLE settings_old");

            console.log('Settings migration complete.');
        } else {
            console.log('Settings table already has organization_id.');
        }

    } catch (e) {
        console.error('Migration Failed:', e);
    }
}

migrate();
