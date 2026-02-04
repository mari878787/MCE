const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/team - List all users
router.get('/', async (req, res) => {
    try {
        const result = await db.query("SELECT id, name, email, role, status FROM users WHERE organization_id = ? ORDER BY name ASC", [req.user.organization_id]);
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

// POST /api/team/bulk-assign
router.post('/bulk-assign', async (req, res) => {
    const { leadIds, userId } = req.body;
    if (!leadIds || !Array.isArray(leadIds) || !userId) {
        return res.status(400).json({ error: 'leadIds array and userId required' });
    }

    try {
        // 1. Verify User (Agent) in Org
        const userCheck = await db.query('SELECT id FROM users WHERE id = ? AND organization_id = ?', [userId, req.user.organization_id]);
        if (userCheck.rows.length === 0) return res.status(404).json({ error: 'User not found in organization' });

        // 2. Assign Leads (scoped to Org)
        const placeholders = leadIds.map(() => '?').join(',');
        const sql = `UPDATE leads SET assigned_to = ? WHERE id IN (${placeholders}) AND organization_id = ?`;

        await db.query(sql, [userId, ...leadIds, req.user.organization_id]);

        res.json({ success: true, count: leadIds.length });
    } catch (err) {
        console.error('Bulk Assign Error:', err);
        res.status(500).json({ error: 'Failed to bulk assign' });
    }
});

module.exports = router;
