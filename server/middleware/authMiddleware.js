const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-env';

const db = require('../db');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        if (!token) {
            return res.status(401).json({ error: 'Invalid token format' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        // Refresh User Data from DB to ensure Org ID is up to date
        const userRes = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
        if (userRes.rows.length === 0) {
            return res.status(401).json({ error: 'User no longer exists' });
        }

        req.user = userRes.rows[0]; // Use fresh data
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
