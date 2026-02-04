const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/mce.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Running Reminders Migration...');

    db.run("ALTER TABLE leads ADD COLUMN reminder_at DATETIME", (err) => {
        if (err && err.message.includes('duplicate column')) {
            console.log('Column reminder_at already exists.');
        } else if (err) {
            console.error('Error adding reminder_at:', err);
        } else {
            console.log('✅ Added reminder_at column.');
        }
    });

    db.run("ALTER TABLE leads ADD COLUMN reminder_note TEXT", (err) => {
        if (err && err.message.includes('duplicate column')) {
            console.log('Column reminder_note already exists.');
        } else if (err) {
            console.error('Error adding reminder_note:', err);
        } else {
            console.log('✅ Added reminder_note column.');
        }
    });
});

db.close();
