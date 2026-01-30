const fs = require('fs');
const path = require('path');
const { query } = require('./index');

const initDb = async () => {
    try {
        const schemaPath = path.resolve(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon to run multiple statements (SQLite limitation in some drivers)
        const statements = schema.split(';').filter(s => s.trim());

        for (const statement of statements) {
            await query(statement);
        }

        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('DB Init Error:', error);
    }
};

module.exports = initDb;
