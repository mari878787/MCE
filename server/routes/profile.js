const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');

// Mount this at /api/profile

// GET /api/profile
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, name, email, role, avatar_url, preferences FROM users WHERE id = ?",
            [req.user.id]
        );
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Parse preferences if they exist
        if (user.preferences && typeof user.preferences === 'string') {
            try { user.preferences = JSON.parse(user.preferences); } catch (e) { }
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/profile - Update Details
router.put('/', authMiddleware, async (req, res) => {
    const { name, avatar_url, preferences } = req.body;
    try {
        await db.query(
            "UPDATE users SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url), preferences = COALESCE(?, preferences) WHERE id = ?",
            [name, avatar_url, preferences ? JSON.stringify(preferences) : null, req.user.id]
        );
        res.json({ success: true, message: 'Profile updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/profile/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        // 1. Fetch current password hash
        const result = await db.query("SELECT password FROM users WHERE id = ?", [req.user.id]);
        const user = result.rows[0];

        // 2. Verify current
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) return res.status(401).json({ error: 'Incorrect current password' });

        // 3. Hash new
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Update
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user.id]);

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
