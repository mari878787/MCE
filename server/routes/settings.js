const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/settings
router.get('/', async (req, res) => {
    try {
        const result = await db.query("SELECT key, value FROM settings");
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

        // Upsert
        const existing = await db.query("SELECT key FROM settings WHERE key = ?", [key]);
        if (existing.rows.length > 0) {
            await db.query("UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?", [parsedValue, key]);
        } else {
            await db.query("INSERT INTO settings (key, value) VALUES (?, ?)", [key, parsedValue]);
        }

        res.json({ success: true, key, value: parsedValue });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save setting' });
    }
});

module.exports = router;
