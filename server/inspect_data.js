const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'db/mce.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT id, name, phone, source FROM leads", (err, leads) => {
        if (err) console.error(err);
        else {
            console.log('--- LEADS ---');
            console.table(leads);
        }

        db.all("SELECT id, lead_id, content, status, created_at FROM messages ORDER BY created_at DESC LIMIT 5", (err, msgs) => {
            if (err) console.error(err);
            else {
                console.log('--- RECENT MESSAGES ---');
                console.table(msgs);
            }
            db.close();
        });
    });
});
