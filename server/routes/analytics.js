const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/analytics/whatsapp
router.get('/whatsapp', async (req, res) => {
    try {
        const orgId = req.user.organization_id;

        const msgVolume = await db.query(
            `SELECT COUNT(m.id) as count 
             FROM messages m 
             JOIN leads l ON m.lead_id = l.id 
             WHERE m.type = 'whatsapp' AND m.direction = 'outbound' AND l.organization_id = ?`,
            [orgId]
        );

        const stoppedLeads = await db.query(
            "SELECT COUNT(*) as count FROM leads WHERE stopped_automation = 1 AND organization_id = ?",
            [orgId]
        );

        const pendingLeads = await db.query(
            "SELECT COUNT(*) as count FROM leads WHERE status = 'NEW' AND organization_id = ?",
            [orgId]
        );

        const recentStops = await db.query(
            "SELECT name, phone, last_message_sent_at FROM leads WHERE stopped_automation = 1 AND organization_id = ? ORDER BY updated_at DESC LIMIT 5",
            [orgId]
        );

        res.json({
            sent: msgVolume.rows[0].count,
            stopped: stoppedLeads.rows[0].count,
            queue: pendingLeads.rows[0].count,
            recent_stops: recentStops.rows
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// GET /api/analytics/growth - Daily new leads (Last 30 days)
router.get('/growth', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as leads
            FROM leads 
            WHERE created_at > DATE('now', '-30 days') AND organization_id = ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [req.user.organization_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch growth stats' });
    }
});

// GET /api/analytics/funnel - Conversion Funnel
router.get('/funnel', async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM leads WHERE organization_id = ?) as total,
                (SELECT COUNT(*) FROM leads WHERE status IN ('CONTACTED', 'INTERESTED', 'CUSTOMER') AND organization_id = ?) as contacted,
                (SELECT COUNT(*) FROM leads WHERE status IN ('INTERESTED', 'CUSTOMER') AND organization_id = ?) as interested,
                (SELECT COUNT(*) FROM leads WHERE status = 'CUSTOMER' AND organization_id = ?) as customer
        `, [orgId, orgId, orgId, orgId]);

        const idx = stats.rows[0];

        // Format for Recharts Funnel
        const funnelData = [
            { value: idx.total, name: 'Total Leads', fill: '#8884d8' },
            { value: idx.contacted, name: 'Engaged', fill: '#83a6ed' },
            { value: idx.interested, name: 'Interested', fill: '#8dd1e1' },
            { value: idx.customer, name: 'Customers', fill: '#82ca9d' }
        ];
        res.json(funnelData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch funnel stats' });
    }
});

// GET /api/analytics/sentiment
router.get('/sentiment', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                m.sentiment, 
                COUNT(m.id) as count 
            FROM messages m
            JOIN leads l ON m.lead_id = l.id
            WHERE 
                m.direction = 'inbound' 
                AND m.sentiment IS NOT NULL 
                AND m.created_at > DATE('now', '-30 days')
                AND l.organization_id = ?
            GROUP BY m.sentiment
        `, [req.user.organization_id]);

        // Format: { positive: 10, negative: 2, neutral: 5 }
        const data = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 };
        result.rows.forEach(row => {
            if (data[row.sentiment] !== undefined) {
                data[row.sentiment] = row.count;
            }
        });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch sentiment stats' });
    }
});

// GET /api/analytics/heatmap
router.get('/heatmap', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                strftime('%w', m.created_at) as day_of_week,
                strftime('%H', m.created_at) as hour_of_day,
                COUNT(m.id) as value
            FROM messages m
            JOIN leads l ON m.lead_id = l.id
            WHERE m.direction = 'inbound' 
              AND m.created_at > DATE('now', '-30 days')
              AND l.organization_id = ?
            GROUP BY day_of_week, hour_of_day
        `, [req.user.organization_id]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch heatmap stats' });
    }
});

// GET /api/analytics/roi
router.get('/roi', async (req, res) => {
    try {
        const orgId = req.user.organization_id;

        // 1. Calculate Revenue
        const revenueResult = await db.query(`
            SELECT SUM(lead_value) as total_revenue
            FROM leads 
            WHERE status IN ('INTERESTED', 'CUSTOMER') AND organization_id = ?
        `, [orgId]);
        const totalRevenue = revenueResult.rows[0].total_revenue || 0;

        // 2. Calculate Cost (Campaigns)
        const costResult = await db.query(`
            SELECT SUM(spend) as total_cost
            FROM campaigns
            WHERE organization_id = ?
        `, [orgId]);
        let totalCost = costResult.rows[0].total_cost || 0;

        // Fallback: Estimate cost from messages
        if (totalCost === 0) {
            const msgCount = await db.query(`
                SELECT COUNT(m.id) as count 
                FROM messages m
                JOIN leads l ON m.lead_id = l.id
                WHERE m.type='whatsapp' AND m.direction='outbound' AND l.organization_id = ?
            `, [orgId]);
            totalCost = msgCount.rows[0].count * 0.05;
        }

        // 3. Calculate ROI
        let roi = 0;
        if (totalCost > 0) {
            roi = ((totalRevenue - totalCost) / totalCost) * 100;
        }

        res.json({
            revenue: totalRevenue,
            cost: totalCost,
            roi: Math.round(roi * 100) / 100
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch ROI stats' });
    }
});

// GET /api/analytics/ab-test?campaignA=uuid&campaignB=uuid
router.get('/ab-test', async (req, res) => {
    try {
        const { campaignA, campaignB } = req.query;
        const orgId = req.user.organization_id;

        if (!campaignA || !campaignB) {
            return res.status(400).json({ error: 'Please provide campaignA and campaignB IDs' });
        }

        const getStats = async (id) => {
            // Verify ownership first
            const check = await db.query("SELECT id FROM campaigns WHERE id = ? AND organization_id = ?", [id, orgId]);
            if (check.rows.length === 0) return null;

            const stats = await db.query(`
                SELECT 
                    (SELECT COUNT(*) FROM messages WHERE campaign_id = ? AND direction='outbound') as sent,
                    (SELECT COUNT(*) FROM messages WHERE campaign_id = ? AND status='read') as read,
                    (SELECT COUNT(*) FROM messages WHERE campaign_id = ? AND sentiment='POSITIVE') as positive,
                    (SELECT name FROM campaigns WHERE id = ?) as name
            `, [id, id, id, id]);
            return stats.rows[0];
        };

        const statsA = await getStats(campaignA);
        const statsB = await getStats(campaignB);

        if (!statsA || !statsB) return res.status(404).json({ error: 'Campaigns not found or access denied' });

        res.json({
            campaignA: statsA,
            campaignB: statsB
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to compare campaigns' });
    }
});

module.exports = router;
