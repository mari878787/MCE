const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const whatsappService = require('../services/whatsapp');

class WorkflowEngine {
    constructor() {
        this.context = {};
    }

    // MAIN ENTRY POINT
    async process(workflowId, leadId, existingExecutionId = null) {
        console.log(`[ENGINE] Processing Workflow ${workflowId} for Lead ${leadId}`);

        let execution;
        let nodes = [];
        let edges = [];

        // 1. Load Workflow Definition
        const wfRes = await db.query('SELECT * FROM workflows WHERE id = ?', [workflowId]);
        if (wfRes.rows.length === 0) throw new Error('Workflow not found');

        const nodesRes = await db.query('SELECT * FROM workflow_nodes WHERE workflow_id = ?', [workflowId]);
        const edgesRes = await db.query('SELECT * FROM workflow_edges WHERE workflow_id = ?', [workflowId]);

        nodes = nodesRes.rows.map(n => ({ ...n, data: JSON.parse(n.data_json) }));
        edges = edgesRes.rows;

        // 2. Get or Create Execution State
        if (existingExecutionId) {
            const execRes = await db.query('SELECT * FROM workflow_executions WHERE id = ?', [existingExecutionId]);
            if (execRes.rows.length === 0) throw new Error('Execution not found');
            execution = execRes.rows[0];
        } else {
            // Start Fresh
            const startNode = nodes.find(n => n.type === 'trigger');
            if (!startNode) throw new Error('No Trigger Node found');

            const id = uuidv4();
            await db.query(
                `INSERT INTO workflow_executions (id, workflow_id, lead_id, current_node_id, status, context) VALUES (?, ?, ?, ?, ?, ?)`,
                [id, workflowId, leadId, startNode.id, 'PENDING', '{}']
            );
            execution = { id, current_node_id: startNode.id, context: '{}' };
        }

        // 3. EXECUTION LOOP
        // We execute nodes until we hit a DELAY or END
        let currentNodeId = execution.current_node_id;
        let status = 'PENDING';

        // Limit loop to prevent infinite loops in bad graphs
        let stepsProcessed = 0;
        const MAX_STEPS = 50;

        while (status === 'PENDING' && stepsProcessed < MAX_STEPS) {
            stepsProcessed++;
            const currentNode = nodes.find(n => n.id === currentNodeId);

            if (!currentNode) {
                console.log(`[ENGINE] Node ${currentNodeId} not found, ending execution.`);
                await this.completeExecution(execution.id);
                return;
            }

            console.log(`[ENGINE] Executing Node: ${currentNode.type} (${currentNode.id})`);

            // EXECUTE NODE LOGIC
            const result = await this.executeNodeLogic(currentNode, leadId);

            // INDEPENDENT NEXT NODE CHECK (Common for all)
            const nextNodeId = this.findNextNode(currentNodeId, result.outcome, edges);

            // Check for DELAY (Suspend execution)
            if (result.action === 'WAIT') {
                console.log(`[ENGINE] Suspending for Delay: ${result.delayHours} hours`);
                // IMPORTANT: We skip to nextNodeId for the RESUME state
                if (!nextNodeId) {
                    console.log('[Engine] Delay node has no output. Ending workflow.');
                    await this.completeExecution(execution.id);
                    return;
                }

                await db.query(
                    `UPDATE workflow_executions SET status = 'WAITING', next_run_at = datetime('now', '+${result.delayHours} hours'), current_node_id = ? WHERE id = ?`,
                    [nextNodeId, execution.id]
                );
                return; // STOP processing (will resume at nextNodeId)
            }

            if (nextNodeId) {
                // Move to next node immediately
                await db.query(`UPDATE workflow_executions SET current_node_id = ? WHERE id = ?`, [nextNodeId, execution.id]);
                currentNodeId = nextNodeId;
            } else {
                // End of path
                console.log('[ENGINE] End of flow reached.');
                await this.completeExecution(execution.id);
                return;
            }

            // Artificial delay between steps to prevent race conditions/spam
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    async executeNodeLogic(node, leadId) {
        // Fetch fresh lead data
        const leadRes = await db.query('SELECT * FROM leads WHERE id = ?', [leadId]);
        const lead = leadRes.rows[0];

        switch (node.type) {
            case 'trigger':
                // Just creating the execution, essentially a pass-through
                return { outcome: 'default' };

            case 'message':
                if (lead && lead.phone) {
                    let content = node.data.content || '';
                    content = content.replace('{{name}}', lead.name || 'Friend');
                    await whatsappService.sendMessage(lead.phone, content);

                    // Log message
                    await db.query(
                        "INSERT INTO messages (id, lead_id, type, direction, content, timestamp) VALUES (?, ?, ?, ?, ?, datetime('now'))",
                        [uuidv4(), lead.id, 'whatsapp', 'outbound', content]
                    );
                }
                return { outcome: 'default' };

            case 'delay':
                const hours = parseInt(node.data.wait_time) || 1;
                return { action: 'WAIT', delayHours: hours };

            case 'condition':
                // Evaluate Condition
                const type = node.data.conditionType || 'tag';
                const value = node.data.conditionValue || '';
                let passed = false;

                if (type === 'tag') {
                    const tags = JSON.parse(lead.tags || '[]');
                    // Simple substring match or exact match depending on implementation
                    passed = tags.some(t => t.includes(value));
                } else if (type === 'status') {
                    passed = lead.status === value;
                }

                console.log(`[ENGINE] Condition '${type}' check for '${value}': ${passed}`);
                return { outcome: passed ? 'yes' : 'no' };

            default:
                return { outcome: 'default' };
        }
    }

    findNextNode(currentNodeId, outcome, edges) {
        // Filter edges starting from current node
        const potentialEdges = edges.filter(e => e.source_id === currentNodeId);

        if (potentialEdges.length === 0) return null;

        // If specific outcome (yes/no), look for handle match
        if (outcome === 'yes' || outcome === 'no') {
            const match = potentialEdges.find(e => e.source_handle === outcome);
            return match ? match.target_id : null;
        }

        // Default path (first edge found)
        return potentialEdges[0].target_id;
    }

    async completeExecution(id) {
        await db.query("UPDATE workflow_executions SET status = 'COMPLETED' WHERE id = ?", [id]);
    }

    // CHECK FOR AUTO-TRIGGERS
    async checkTriggers(eventId, eventData) {
        console.log(`[ENGINE] Checking triggers for event: ${eventId}`, eventData);

        if (eventId === 'TAG_ADDED') {
            const { leadId, tag } = eventData;
            const normalize = s => s.trim().toLowerCase();
            const tagToCheck = normalize(tag);

            // Find workflows that start with a Trigger Node for this tag
            // We have to query via raw SQL or load all workflows. 
            // Querying JSON in SQLite is tricky, so let's try a LIKE query for simplicity or JSON_EXTRACT if available.
            // Using LIKE for broader compatibility:
            // "triggerType":"tag_added" AND "triggerValue":"#VIP"

            // NOTE: This simple LIKE might be fragile if JSON spacing varies, but usually consistent in node.
            // Better: Select ALL trigger nodes, parse, and filter.

            const nodesRes = await db.query(`SELECT * FROM workflow_nodes WHERE type = 'trigger'`);

            for (const node of nodesRes.rows) {
                const data = JSON.parse(node.data_json);
                if (data.triggerType === 'tag_added' && normalize(data.triggerValue) === tagToCheck) {
                    console.log(`[ENGINE] Trigger Match! Workflow ${node.workflow_id} for Tag ${tag}`);

                    // Enqueue Job
                    const { nurtureQueue } = require('../utils/queue'); // Lazy require to avoid circular dep if needed?
                    // Actually, better to call `process` directly? 
                    // No, use Queue for async reliability.

                    // We need to import queue at top or pass it in.
                    // Since specific import is tricky inside class method if not global.
                    // Let's assume queue is available or require it here.
                    const queueModule = require('../utils/queue');

                    await queueModule.nurtureQueue.add('execute_workflow', {
                        type: 'PROCESS_WORKFLOW_EXECUTION',
                        workflowId: node.workflow_id,
                        leadId: leadId
                    });
                }
            }
        }
    }
}

module.exports = new WorkflowEngine();
