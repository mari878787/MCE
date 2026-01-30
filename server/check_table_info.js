const db = require('./db');

async function check() {
    try {
        const info = await db.query("PRAGMA table_info(users)");
        console.log('Users Table Schema:', info.rows);
    } catch (err) {
        console.error(err);
    }
}

check();
