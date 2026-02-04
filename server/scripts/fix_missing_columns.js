const db = require('../db').db;

async function migrate() {
    console.log('Running migration: Add Reminder Columns to Leads');

    // Helper to run query
    const run = (sql) => new Promise((resolve, reject) => {
        db.run(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    try {
        console.log('Adding reminder_at column...');
        await run("ALTER TABLE leads ADD COLUMN reminder_at DATETIME;").catch(e => {
            if (e.message.includes('duplicate column')) console.log('reminder_at already exists');
            else throw e;
        });

        console.log('Adding reminder_note column...');
        await run("ALTER TABLE leads ADD COLUMN reminder_note TEXT;").catch(e => {
            if (e.message.includes('duplicate column')) console.log('reminder_note already exists');
            else throw e;
        });

        console.log('Adding notes column (just in case)...');
        await run("ALTER TABLE leads ADD COLUMN notes TEXT;").catch(e => {
            if (e.message.includes('duplicate column')) console.log('notes already exists');
            else throw e;
        });


        console.log('Migration complete.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        // We do not close db because it's shared from require('../db'), 
        // but since this is a standalone script execution in our context, 
        // the process will exit.
        // Actually, require('../db') might keep connection open.
        // db.close(); 
        // For standalone run, we want to exit.
        process.exit(0);
    }
}

migrate();
