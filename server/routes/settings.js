const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/settings
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            "SELECT key, value FROM settings WHERE organization_id = ?",
            [req.user.organization_id]
        );
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// POST /api/settings
router.post('/', async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ error: 'Key and Value required' });
        }

        const parsedValue = String(value); // Ensure string
        const orgId = req.user.organization_id;

        // Upsert (SQLite syntax compatible with Postgres ON CONFLICT mostly, but here using manual check for compatibility)
        const existing = await db.query(
            "SELECT key FROM settings WHERE key = ? AND organization_id = ?",
            [key, orgId]
        );

        if (existing.rows.length > 0) {
            await db.query(
                "UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ? AND organization_id = ?",
                [parsedValue, key, orgId]
            );
        } else {
            await db.query(
                "INSERT INTO settings (key, value, organization_id) VALUES (?, ?, ?)",
                [key, parsedValue, orgId]
            );
        }

        res.json({ success: true, key, value: parsedValue });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save setting' });
    }
});

module.exports = router;
