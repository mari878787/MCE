const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/quick-responses
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM quick_responses WHERE organization_id = ? ORDER BY created_at DESC',
            [req.user.organization_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// POST /api/quick-responses
router.post('/', async (req, res) => {
    const { title, content, shortcut } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

    const id = uuidv4();
    try {
        await db.query(
            'INSERT INTO quick_responses (id, organization_id, title, content, shortcut) VALUES (?, ?, ?, ?, ?)',
            [id, req.user.organization_id, title, content, shortcut || '']
        );
        res.json({ id, title, content, shortcut });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

// DELETE /api/quick-responses/:id
router.delete('/:id', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM quick_responses WHERE id = ? AND organization_id = ?',
            [req.params.id, req.user.organization_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

module.exports = router;
