
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { addJob } = require('../utils/queue');

// GET /api/campaigns - List all campaigns
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM campaigns ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
});

// POST /api/campaigns - Create a new Multi-Step Campaign
router.post('/', async (req, res) => {
    const { name, steps, target_filter, scheduled_at } = req.body;
    // steps = [{ type: 'WHATSAPP', content: 'Hi' }, { type: 'DELAY', content: '24' }]

    if (!name || !steps || steps.length === 0) {
        return res.status(400).json({ error: 'Name and at least one step are required' });
    }

    const campaignId = uuidv4();

    try {
        await db.query('BEGIN TRANSACTION');

        // 1. Create Campaign
        await db.query(
            'INSERT INTO campaigns (id, name, target_filter, status, scheduled_at) VALUES (?, ?, ?, ?, ?)',
            [campaignId, name, target_filter || 'ALL', 'DRAFT', scheduled_at || null]
        );

        // 2. Create Steps
        let order = 1;
        for (const step of steps) {
            const stepId = uuidv4();
            await db.query(
                'INSERT INTO campaign_steps (id, campaign_id, step_order, type, content) VALUES (?, ?, ?, ?, ?)',
                [stepId, campaignId, order++, step.type, step.content]
            );
        }

        await db.query('COMMIT');
        res.json({ id: campaignId, name, status: 'DRAFT', message: 'Campaign created successfully' });

    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
});

// POST /api/campaigns/:id/start - Initialize Audience
router.post('/:id/start', async (req, res) => {
    const { id } = req.params;

    try {
        const campRes = await db.query('SELECT * FROM campaigns WHERE id = ?', [id]);
        if (campRes.rows.length === 0) return res.status(404).json({ error: 'Campaign not found' });

        // Select Leads
        let sql = 'SELECT * FROM leads WHERE stopped_automation = 0';
        const leadsRes = await db.query(sql);
        const leads = leadsRes.rows;

        if (leads.length === 0) return res.status(400).json({ error: 'No eligible leads found' });

        console.log(`[CAMPAIGN] Initializing '${campRes.rows[0].name}' for ${leads.length} leads...`);

        // Insert into Audience Table (Step 1)
        for (const lead of leads) {
            if (!lead.id) {
                console.warn('[CAMPAIGN] Skipping lead with NULL ID:', lead);
                continue;
            }
            const audId = uuidv4();
            await db.query(
                'INSERT INTO campaign_audience (id, campaign_id, lead_id, current_step, status, next_run_at) VALUES (?, ?, ?, ?, ?, ?)',
                [audId, id, lead.id, 1, 'PENDING', new Date().toISOString()] // Run immediately
            );

            // Allow the worker to pick this up via specific CRON or Queue trigger
        }

        await db.query("UPDATE campaigns SET status = 'RUNNING' WHERE id = ?", [id]);

        // Trigger the first batch immediately
        await addJob('nurture-queue', { type: 'PROCESS_CAMPAIGN_BATCH', campaignId: id });

        res.json({ success: true, queued: leads.length });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to start campaign' });
    }
});

// GET /api/campaigns/:id/stats - Get Real-time Detailed Stats
router.get('/:id/stats', async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Audience Overview (Existing Logic)
        const audRes = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed, -- Finished flow
                SUM(CASE WHEN status IN ('PENDING', 'ACTIVE', 'WAITING') THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
                -- "Interested" Leads: Check if Lead Status is currently INTERESTED
                (SELECT COUNT(*) FROM campaign_audience ca 
                 JOIN leads l ON ca.lead_id = l.id 
                 WHERE ca.campaign_id = ? AND l.status = 'INTERESTED') as interested
            FROM campaign_audience 
            WHERE campaign_id = ?
        `, [id, id]);

        const audStats = audRes.rows[0];

        // 2. Message Performance (From 'messages' table linked by campaign_id)
        const msgRes = await db.query(`
            SELECT 
                COUNT(*) as sent,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read
            FROM messages 
            WHERE campaign_id = ? AND direction = 'outbound'
        `, [id]);

        const msgStats = msgRes.rows[0];

        // 3. Replies (Approximation: Inbound msg from any lead in this campaign AFTER campaign creation)
        // More strict: Inbound msg from lead in audience, created after their audience entry?
        // Let's use simple: Inbound msg from audience member > campaign start time.
        const replyRes = await db.query(`
            SELECT COUNT(DISTINCT m.lead_id) as replies
            FROM messages m
            JOIN campaign_audience ca ON m.lead_id = ca.lead_id
            WHERE ca.campaign_id = ? 
            AND m.direction = 'inbound'
            AND m.created_at > (SELECT created_at FROM campaigns WHERE id = ?)
        `, [id, id]);

        const replies = replyRes.rows[0]?.replies || 0;

        res.json({
            audience: {
                total: audStats.total || 0,
                pending: audStats.pending || 0, // Still in flow
                finished: audStats.completed || 0, // Reached end of flow
                failed: audStats.failed || 0
            },
            performance: {
                sent: msgStats.sent || 0,
                delivered: (msgStats.delivered || 0) + (msgStats.read || 0), // Read implies delivered
                read: msgStats.read || 0,
                replies: replies,
                interested: audStats.interested || 0
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch campaign stats' });
    }
});

// ... existing routes ...

// --- SEGMENTS API ---

// GET /api/segments - List all
router.get('/segments', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM segments ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/segments - Create
router.post('/segments', async (req, res) => {
    const { name, criteria } = req.body;
    // criteria example: { type: 'tags', value: 'VIP', operator: 'contains' }

    if (!name || !criteria) return res.status(400).json({ error: 'Missing fields' });

    const id = uuidv4();
    try {
        await db.query(
            'INSERT INTO segments (id, name, criteria_json) VALUES (?, ?, ?)',
            [id, name, JSON.stringify(criteria)]
        );
        res.json({ id, name, success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/segments/:id/check - Test a segment against leads (Preview count)
router.post('/segments/preview', async (req, res) => {
    const { criteria } = req.body;
    try {
        const leadsRes = await db.query('SELECT * FROM leads');
        const leads = leadsRes.rows;

        let matchCount = 0;
        const matches = [];

        // Simple Evaluator (Enhance as needed)
        // Criteria = [ { field: 'tags', operator: 'contains', value: 'VIP' }, ... ]
        // For MVP, assuming criteria is an Array of rules
        const rules = Array.isArray(criteria) ? criteria : [criteria];

        for (const lead of leads) {
            let isMatch = true;
            for (const rule of rules) {
                if (rule.field === 'tags') {
                    // Lead tags is string "tag1, tag2"
                    const leadTags = (lead.tags || '').split(',').map(t => t.trim().toLowerCase());
                    const target = rule.value.toLowerCase();
                    if (rule.operator === 'contains' && !leadTags.includes(target)) isMatch = false;
                    if (rule.operator === 'not_contains' && leadTags.includes(target)) isMatch = false;
                }
                else if (rule.field === 'status') {
                    if (lead.status !== rule.value) isMatch = false;
                }
                // Add more logic here
            }
            if (isMatch) {
                matchCount++;
                if (matches.length < 5) matches.push(lead); // Only return first 5 for preview
            }
        }

        res.json({ count: matchCount, preview: matches });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
