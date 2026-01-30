const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/team - List all users
router.get('/', async (req, res) => {
    try {
        const result = await db.query("SELECT id, name, email, role, status FROM users ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

// POST /api/team/assign - Assign lead to user
router.post('/assign', async (req, res) => {
    console.log('Assign Request:', req.body);
    try {
        const { leadId, userId } = req.body;
        if (!leadId) {
            return res.status(400).json({ error: 'Lead ID required' });
        }

        // Update lead
        await db.query("UPDATE leads SET assigned_to = ? WHERE id = ?", [userId, leadId]);

        res.json({ success: true, leadId, userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to assign lead' });
    }
});

module.exports = router;
