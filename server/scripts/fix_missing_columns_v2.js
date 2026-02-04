const db = require('../db').db;

async function migrate() {
    console.log('--- START MIGRATION ---');

    const run = (sql) => new Promise((resolve, reject) => {
        db.run(sql, (err) => {
            if (err) resolve({ error: err }); // Resolve even on error to continue
            else resolve({ success: true });
        });
    });

    const checkCols = () => new Promise((resolve, reject) => {
        db.all("PRAGMA table_info(leads)", (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(r => r.name));
        });
    });

    try {
        let cols = await checkCols();
        console.log('Initial Columns:', cols);

        if (!cols.includes('reminder_at')) {
            console.log('Adding reminder_at...');
            const res = await run("ALTER TABLE leads ADD COLUMN reminder_at DATETIME;");
            console.log('Result:', res);
        } else {
            console.log('reminder_at already exists.');
        }

        if (!cols.includes('reminder_note')) {
            console.log('Adding reminder_note...');
            const res = await run("ALTER TABLE leads ADD COLUMN reminder_note TEXT;");
            console.log('Result:', res);
        } else {
            console.log('reminder_note already exists.');
        }

        if (!cols.includes('notes')) {
            console.log('Adding notes...');
            const res = await run("ALTER TABLE leads ADD COLUMN notes TEXT;");
            console.log('Result:', res);
        } else {
            console.log('notes already exists.');
        }

        cols = await checkCols();
        console.log('Final Columns:', cols);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit(0);
    }
}

migrate();
