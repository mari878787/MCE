const db = require('./db');
async function checkMessages() {
    console.log('Checking messages...');
    const res = await db.query("SELECT * FROM messages WHERE direction='outbound'");
    console.log(JSON.stringify(res.rows, null, 2));
}
checkMessages();
