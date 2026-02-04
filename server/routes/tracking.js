const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');

// Public Redirect Route (No Auth needed to click)
// GET /api/tracking/t/:id -> Logs view -> Redirects
router.get('/t/:id', async (req, res) => {
    const { id } = req.params;
    const ip = req.ip;
    const userAgent = req.get('User-Agent');

    try {
        // 1. Get Link
        const linkRes = await db.query('SELECT * FROM tracked_links WHERE id = ?', [id]);
        if (linkRes.rows.length === 0) return res.status(404).send('Link not found or expired.');

        const link = linkRes.rows[0];

        // 2. Log View
        await db.query(`UPDATE tracked_links SET views = views + 1 WHERE id = ?`, [id]);
        await db.query(`INSERT INTO link_views (link_id, viewer_ip, user_agent) VALUES (?, ?, ?)`, [id, ip, userAgent]);

        // 3. Trigger Notification (Simple console log for now, could be DB trigger or Socket)
        // Ideally we insert into a 'notifications' table that the user polls
        console.log(`[TRACKING] Link "${link.title}" clicked by ${ip}`);

        // 4. Redirect
        // Ensure protocol exists
        let dest = link.url;
        if (!dest.startsWith('http')) dest = 'https://' + dest;

        res.redirect(dest);

    } catch (e) {
        console.error(e);
        res.status(500).send('Redirect Error');
    }
});

// Protected: Create Link
router.post('/create', authMiddleware, async (req, res) => {
    const { url, title, leadId } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const id = uuidv4().slice(0, 8); // Short ID

    try {
        await db.query(
            `INSERT INTO tracked_links (id, organization_id, lead_id, url, title) VALUES (?, ?, ?, ?, ?)`,
            [id, req.user.organization_id, leadId || null, url, title || 'Shared Link']
        );

        const trackingUrl = `${process.env.PUBLIC_URL || 'http://localhost:5000'}/api/tracking/t/${id}`;
        res.json({ success: true, trackingUrl, id });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create link' });
    }
});

// GET /api/tracking/recent-views?since=TIMESTAMP
router.get('/recent-views', authMiddleware, async (req, res) => {
    const { since } = req.query;
    if (!since) return res.json({ data: [] });

    try {
        // Join with tracked_links to get title
        const sql = `
            SELECT lv.*, tl.title, tl.lead_id 
            FROM link_views lv
            JOIN tracked_links tl ON lv.link_id = tl.id
            WHERE tl.organization_id = ? AND lv.viewed_at > ?
        `;
        const { rows } = await db.query(sql, [req.user.organization_id, since]);
        res.json({ data: rows });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch views' });
    }
});

module.exports = router;
