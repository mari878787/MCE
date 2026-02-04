const db = require('../db').db;

db.all("PRAGMA table_info(leads)", (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    const columns = rows.map(r => r.name);
    console.log('Columns in leads table:', columns);
});
