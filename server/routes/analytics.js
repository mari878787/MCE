const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/analytics/whatsapp
router.get('/whatsapp', async (req, res) => {
    try {
        const msgVolume = await db.query(
            "SELECT COUNT(*) as count FROM messages WHERE type = 'whatsapp' AND direction = 'outbound'"
        );

        const stoppedLeads = await db.query(
            "SELECT COUNT(*) as count FROM leads WHERE stopped_automation = 1"
        );

        const pendingLeads = await db.query(
            "SELECT COUNT(*) as count FROM leads WHERE status = 'NEW'"
        );

        const recentStops = await db.query(
            "SELECT name, phone, last_message_sent_at FROM leads WHERE stopped_automation = 1 ORDER BY updated_at DESC LIMIT 5"
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
            WHERE created_at > DATE('now', '-30 days')
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch growth stats' });
    }
});

// GET /api/analytics/funnel - Conversion Funnel
router.get('/funnel', async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM leads) as total,
                (SELECT COUNT(*) FROM leads WHERE status IN ('CONTACTED', 'INTERESTED', 'CUSTOMER')) as contacted,
                (SELECT COUNT(*) FROM leads WHERE status IN ('INTERESTED', 'CUSTOMER')) as interested,
                (SELECT COUNT(*) FROM leads WHERE status = 'CUSTOMER') as customer
        `);
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
                sentiment, 
                COUNT(*) as count 
            FROM messages 
            WHERE 
                direction = 'inbound' 
                AND sentiment IS NOT NULL 
                AND created_at > DATE('now', '-30 days')
            GROUP BY sentiment
        `);
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
        // SQLite: strftime('%w', created_at) -> 0-6 (Sun-Sat)
        // SQLite: strftime('%H', created_at) -> 00-23
        const result = await db.query(`
            SELECT 
                strftime('%w', created_at) as day_of_week,
                strftime('%H', created_at) as hour_of_day,
                COUNT(*) as value
            FROM messages
            WHERE direction = 'inbound' AND created_at > DATE('now', '-30 days')
            GROUP BY day_of_week, hour_of_day
        `);

        // Return raw rows, frontend will map to grid
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch heatmap stats' });
    }
});

// GET /api/analytics/roi
router.get('/roi', async (req, res) => {
    try {
        // 1. Calculate Revenue: Sum of lead_value for all "INTERESTED" or "CUSTOMER" leads
        // Note: In a real app, we might link revenue to specific campaigns via attribution.
        // For simple ROI, we'll sum value of all leads converted in last 30 days.
        const revenueResult = await db.query(`
            SELECT SUM(lead_value) as total_revenue
            FROM leads 
            WHERE status IN ('INTERESTED', 'CUSTOMER')
        `);
        const totalRevenue = revenueResult.rows[0].total_revenue || 0;

        // 2. Calculate Cost: Sum of 'spend' from all campaigns in last 30 days
        // (Assuming we track spend). If not, we can estimate based on message count * cost per msg.
        // Let's use the new 'spend' column.
        const costResult = await db.query(`
            SELECT SUM(spend) as total_cost
            FROM campaigns
        `);
        let totalCost = costResult.rows[0].total_cost || 0;

        // Fallback: If no manual spend entered, estimate cost
        // Estimate: $0.05 per WhatsApp message
        if (totalCost === 0) {
            const msgCount = await db.query("SELECT COUNT(*) as count FROM messages WHERE type='whatsapp' AND direction='outbound'");
            totalCost = msgCount.rows[0].count * 0.05;
        }

        // 3. Calculate ROI
        // ROI = (Revenue - Cost) / Cost * 100
        let roi = 0;
        if (totalCost > 0) {
            roi = ((totalRevenue - totalCost) / totalCost) * 100;
        }

        res.json({
            revenue: totalRevenue,
            cost: totalCost,
            roi: Math.round(roi * 100) / 100 // Round to 2 decimals
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

        if (!campaignA || !campaignB) {
            // Return list of completed campaigns for selection if IPs not provided
            // Actually, frontend might need list first. Let's handle list in /api/campaigns
            // Here just return error or empty if not provided.
            return res.status(400).json({ error: 'Please provide campaignA and campaignB IDs' });
        }

        const getStats = async (id) => {
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
