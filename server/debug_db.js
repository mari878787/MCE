const db = require('./db');

const checkDb = async () => {
    try {
        const { rows } = await db.query('SELECT * FROM leads');
        console.log('Total Leads:', rows.length);
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    }
};

checkDb();
