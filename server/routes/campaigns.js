
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { addJob } = require('../utils/queue');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/campaigns - List all campaigns with basic stats
router.get('/', authMiddleware, async (req, res) => {
    try {
        const sql = `
            SELECT 
                c.*,
                (SELECT COUNT(*) FROM campaign_audience ca WHERE ca.campaign_id = c.id) as total_leads,
                (SELECT COUNT(*) FROM campaign_audience ca WHERE ca.campaign_id = c.id AND ca.status = 'COMPLETED') as completed_leads,
                (SELECT COUNT(*) FROM messages m WHERE m.campaign_id = c.id AND m.direction = 'outbound') as sent_count,
                (SELECT COUNT(*) FROM messages m WHERE m.campaign_id = c.id AND m.status = 'read') as read_count
            FROM campaigns c 
            WHERE c.organization_id = ? 
            ORDER BY c.created_at DESC
        `;
        const result = await db.query(sql, [req.user.organization_id]);

        // Calculate open rates
        const campaigns = result.rows.map(c => ({
            ...c,
            openRate: c.sent_count > 0 ? Math.round((c.read_count / c.sent_count) * 100) + '%' : '0%',
            sent: c.sent_count
        }));

        res.json(campaigns);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
});

// GET /api/campaigns/:id - Get Details (for editing)
router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const campRes = await db.query('SELECT * FROM campaigns WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);
        if (campRes.rows.length === 0) return res.status(404).json({ error: 'Campaign not found' });

        const stepsRes = await db.query('SELECT * FROM campaign_steps WHERE campaign_id = ? ORDER BY step_order ASC', [id]);

        const campaign = campRes.rows[0];
        campaign.steps = stepsRes.rows; // Attach steps

        res.json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch campaign details' });
    }
});

// POST /api/campaigns - Create a new Multi-Step Campaign
router.post('/', authMiddleware, async (req, res) => {
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
            'INSERT INTO campaigns (id, name, target_filter, status, scheduled_at, organization_id) VALUES (?, ?, ?, ?, ?, ?)',
            [campaignId, name, target_filter || 'ALL', 'DRAFT', scheduled_at || null, req.user.organization_id]
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

// PUT /api/campaigns/:id - Update Campaign
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, steps, target_filter, scheduled_at } = req.body;

    if (!name || !steps || steps.length === 0) {
        return res.status(400).json({ error: 'Name and at least one step are required' });
    }

    try {
        await db.query('BEGIN TRANSACTION');

        // 1. Verify Ownership & Status
        const check = await db.query('SELECT * FROM campaigns WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);
        if (check.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Campaign not found' });
        }
        if (check.rows[0].status === 'RUNNING') {
            await db.query('ROLLBACK');
            return res.status(400).json({ error: 'Cannot edit a running campaign' });
        }

        // 2. Update Campaign Details
        await db.query(
            'UPDATE campaigns SET name = ?, target_filter = ?, scheduled_at = ? WHERE id = ?',
            [name, target_filter || 'ALL', scheduled_at || null, id]
        );

        // 3. Replace Steps (Delete all old, Insert new)
        await db.query('DELETE FROM campaign_steps WHERE campaign_id = ?', [id]);

        let order = 1;
        for (const step of steps) {
            const stepId = uuidv4();
            await db.query(
                'INSERT INTO campaign_steps (id, campaign_id, step_order, type, content) VALUES (?, ?, ?, ?, ?)',
                [stepId, id, order++, step.type, step.content]
            );
        }

        await db.query('COMMIT');
        res.json({ success: true, message: 'Campaign updated successfully' });

    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to update campaign' });
    }
});

// DELETE /api/campaigns/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('BEGIN TRANSACTION');

        // 1. Verify Ownership
        const check = await db.query('SELECT * FROM campaigns WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);
        if (check.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // 2. Delete Dependencies
        // Delete Audience
        await db.query('DELETE FROM campaign_audience WHERE campaign_id = ?', [id]);
        // Delete Steps (Explicitly, though Cascade might exist)
        await db.query('DELETE FROM campaign_steps WHERE campaign_id = ?', [id]);
        // Delete Campaign
        await db.query('DELETE FROM campaigns WHERE id = ?', [id]);

        await db.query('COMMIT');
        res.json({ success: true, message: 'Campaign deleted successfully' });

    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to delete campaign' });
    }
});

// POST /api/campaigns/:id/start - Initialize Audience
router.post('/:id/start', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const campRes = await db.query('SELECT * FROM campaigns WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);
        if (campRes.rows.length === 0) return res.status(404).json({ error: 'Campaign not found' });

        const campaign = campRes.rows[0];
        const target = campaign.target_filter || 'ALL';
        console.log(`[CAMPAIGN] Starting '${campaign.name}' with target: ${target}`);

        // Select Leads based on Target
        let sql = 'SELECT * FROM leads WHERE stopped_automation = 0 AND organization_id = ?';
        let params = [req.user.organization_id];

        if (target.startsWith('TAG:')) {
            const tag = target.replace('TAG:', '').trim();
            // Using LIKE for simple tag matching (assuming tags are stored as comma-separated string or similar)
            sql += ' AND tags LIKE ?';
            params.push(`%${tag}%`);
        } else if (target.startsWith('STATUS:')) {
            const status = target.replace('STATUS:', '').trim();
            sql += ' AND status = ?';
            params.push(status);
        }

        const leadsRes = await db.query(sql, params);
        const leads = leadsRes.rows;

        if (leads.length === 0) return res.status(400).json({ error: 'No eligible leads found for this target' });

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
        res.status(500).json({ error: 'Failed to start campaign: ' + err.message });
    }
});

// POST /api/campaigns/:id/pause
router.post('/:id/pause', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("UPDATE campaigns SET status = 'PAUSED' WHERE id = ? AND organization_id = ?", [id, req.user.organization_id]);
        res.json({ success: true, message: 'Campaign paused' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to pause campaign' });
    }
});

// POST /api/campaigns/:id/resume
router.post('/:id/resume', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("UPDATE campaigns SET status = 'RUNNING' WHERE id = ? AND organization_id = ?", [id, req.user.organization_id]);
        res.json({ success: true, message: 'Campaign resumed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to resume campaign' });
    }
});

// POST /api/campaigns/:id/duplicate
router.post('/:id/duplicate', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('BEGIN TRANSACTION');

        // 1. Get Original
        const campRes = await db.query('SELECT * FROM campaigns WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);
        if (campRes.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Campaign not found' });
        }
        const original = campRes.rows[0];

        // 2. Create New Campaign
        const newId = uuidv4();
        await db.query(
            'INSERT INTO campaigns (id, name, target_filter, status, scheduled_at, organization_id) VALUES (?, ?, ?, ?, ?, ?)',
            [newId, `${original.name} (Copy)`, original.target_filter, 'DRAFT', null, req.user.organization_id]
        );

        // 3. Copy Steps
        const stepsRes = await db.query('SELECT * FROM campaign_steps WHERE campaign_id = ? ORDER BY step_order ASC', [id]);
        for (const step of stepsRes.rows) {
            const stepId = uuidv4();
            await db.query(
                'INSERT INTO campaign_steps (id, campaign_id, step_order, type, content) VALUES (?, ?, ?, ?, ?)',
                [stepId, newId, step.step_order, step.type, step.content]
            );
        }

        await db.query('COMMIT');
        res.json({ success: true, message: 'Campaign duplicated', newId });

    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to duplicate campaign' });
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

        // 4. Step Breakdown
        const stepsRes = await db.query('SELECT * FROM campaign_steps WHERE campaign_id = ? ORDER BY step_order ASC', [id]);
        const steps = stepsRes.rows;

        // Get audience distribution
        const distRes = await db.query('SELECT current_step, count(*) as count FROM campaign_audience WHERE campaign_id = ? GROUP BY current_step', [id]);
        const distribution = {};
        distRes.rows.forEach(r => distribution[r.current_step] = r.count);

        // Calculate flow stats
        const stepsWithStats = steps.map(step => {
            // Users currently AT this step
            const weightingHere = distribution[step.step_order] || 0;

            // Users who have PASSED this step (are at a higher step OR completed)
            // Note: COMPLETED users might keep current_step as last_step + 1 or similar. 
            // Let's assume passed = sum(distribution where step > this_step) + completed (if not handled by step logic)
            // Simpler: total active audience - (sum of users at previous steps) ??
            // Let's just iterate:
            let passed = 0;
            Object.keys(distribution).forEach(s => {
                if (parseInt(s) > step.step_order) passed += distribution[s];
            });
            // Add COMPLETED count if their current_step wasn't incremented beyond max (depends on worker logic)
            // Worker implementation: "UPDATE ... status='COMPLETED'" but doesn't blindly increment current_step beyond bounds?
            // Actually worker does: `if (currentStepIndex >= steps.length) ... status='COMPLETED'`
            // So completed users usually have current_step = steps.length + 1.

            return {
                ...step,
                waiting: weightingHere,
                completed: passed
            };
        });

        res.json({
            audience: {
                total: audStats.total || 0,
                pending: audStats.pending || 0,
                finished: audStats.completed || 0,
                failed: audStats.failed || 0
            },
            performance: {
                sent: msgStats.sent || 0,
                delivered: (msgStats.delivered || 0) + (msgStats.read || 0),
                read: msgStats.read || 0,
                replies: replies,
                interested: audStats.interested || 0
            },
            steps: stepsWithStats
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
