const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// GET /api/workflows
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM workflows WHERE organization_id = ? ORDER BY created_at DESC', [req.user.organization_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/workflows/:id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const wf = await db.query('SELECT * FROM workflows WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);
        if (wf.rows.length === 0) return res.status(404).json({ error: 'Not found' });

        const nodes = await db.query('SELECT * FROM workflow_nodes WHERE workflow_id = ?', [id]);
        const edges = await db.query('SELECT * FROM workflow_edges WHERE workflow_id = ?', [id]);

        res.json({
            ...wf.rows[0],
            nodes: nodes.rows.map(n => ({
                id: n.id,
                type: n.type,
                position: { x: n.position_x, y: n.position_y },
                data: JSON.parse(n.data_json)
            })),
            edges: edges.rows.map(e => ({
                id: e.id,
                source: e.source_id,
                target: e.target_id,
                sourceHandle: e.source_handle,
                targetHandle: e.target_handle
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/workflows - Create/Update
router.post('/', async (req, res) => {
    const { id, name, nodes, edges } = req.body;
    // If ID exists, generic update. If new, create.

    const wfId = id || uuidv4();

    try {
        // Upsert Workflow
        const existing = await db.query('SELECT id FROM workflows WHERE id = ? AND organization_id = ?', [wfId, req.user.organization_id]);
        if (existing.rows.length > 0) {
            await db.query('UPDATE workflows SET name = ? WHERE id = ? AND organization_id = ?', [name, wfId, req.user.organization_id]);
            // Clear old nodes/edges to replace (simple sync)
            await db.query('DELETE FROM workflow_nodes WHERE workflow_id = ?', [wfId]);
            await db.query('DELETE FROM workflow_edges WHERE workflow_id = ?', [wfId]);
        } else {
            await db.query('INSERT INTO workflows (id, name, status, organization_id) VALUES (?, ?, ?, ?)', [wfId, name, 'ACTIVE', req.user.organization_id]);
        }

        // Insert Nodes
        for (const node of nodes) {
            await db.query(
                'INSERT INTO workflow_nodes (id, workflow_id, type, position_x, position_y, data_json) VALUES (?, ?, ?, ?, ?, ?)',
                [node.id, wfId, node.type || 'default', node.position.x, node.position.y, JSON.stringify(node.data)]
            );
        }

        // Insert Edges
        for (const edge of edges) {
            await db.query(
                'INSERT INTO workflow_edges (id, workflow_id, source_id, target_id, source_handle, target_handle) VALUES (?, ?, ?, ?, ?, ?)',
                [edge.id, wfId, edge.source, edge.target, edge.sourceHandle || null, edge.targetHandle || null]
            );
        }

        res.json({ id: wfId, success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/workflows/:id - Update Metadata (Name, Status)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;
    try {
        await db.query(`
            UPDATE workflows 
            SET 
                name = COALESCE(?, name), 
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND organization_id = ?`,
            [name, status, id, req.user.organization_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/workflows/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Check ownership first
        const check = await db.query('SELECT id FROM workflows WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);
        if (check.rows.length === 0) return res.status(404).json({ error: 'Not found' });

        await db.query('BEGIN TRANSACTION');
        await db.query('DELETE FROM workflow_edges WHERE workflow_id = ?', [id]);
        await db.query('DELETE FROM workflow_nodes WHERE workflow_id = ?', [id]);
        await db.query('DELETE FROM workflows WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);
        await db.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
