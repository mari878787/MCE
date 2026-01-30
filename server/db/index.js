const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'mce.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database at', dbPath);
    }
});

// Helper for Async/Await usage
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        // Determine if it's a SELECT (all) or INSERT/UPDATE (run)
        if (sql.trim().toLowerCase().startsWith('select')) {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve({ rows });
            });
        } else {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ rows: [this], lastID: this.lastID, changes: this.changes });
            });
        }
    });
};

module.exports = { db, query };
