const db = require('./db');
const { nurtureQueue } = require('./utils/queue');
const { v4: uuidv4 } = require('uuid');

// Import worker to process jobs IN THIS PROCESS (since MockQueue is in-memory)
// We need to require it so it attaches its event listeners to the SAME queue instance
require('./workers/automation');


async function run() {
    try {
        console.log('=== STARTING WORKFLOW EXECUTION TEST ===');

        const leadId = uuidv4();
        const randPhone = '999' + Math.floor(Math.random() * 10000000);
        await db.query(
            "INSERT INTO leads (id, name, phone, tags) VALUES (?, ?, ?, ?)",
            [leadId, 'Workflow Tester', randPhone, JSON.stringify(['#VIP'])]
        );
        console.log('1. Created Test Lead:', leadId);

        // 2. Create Test Workflow
        const wfId = uuidv4();
        const n1 = uuidv4();
        const n2 = uuidv4();
        const n3 = uuidv4();
        const n4 = uuidv4();

        const nodes = [
            { id: n1, type: 'trigger', position: { x: 0, y: 0 }, data: { label: 'Start' } },
            { id: n2, type: 'message', position: { x: 100, y: 0 }, data: { content: 'Step 1: Welcome' } },
            { id: n3, type: 'delay', position: { x: 200, y: 0 }, data: { wait_time: 1 } }, // 1 Hour delay
            { id: n4, type: 'message', position: { x: 300, y: 0 }, data: { content: 'Step 2: Follow-up' } }
        ];
        const edges = [
            { id: uuidv4(), source: n1, target: n2 }, // Trigger -> Msg 1
            { id: uuidv4(), source: n2, target: n3 }, // Msg 1 -> Delay
            { id: uuidv4(), source: n3, target: n4 }  // Delay -> Msg 2
        ];

        // Insert Workflow manually or via API logic (using manual queries here for speed)
        await db.query('INSERT INTO workflows (id, name, status) VALUES (?, ?, ?)', [wfId, 'Test Flow', 'ACTIVE']);
        for (const n of nodes) {
            await db.query('INSERT INTO workflow_nodes (id, workflow_id, type, position_x, position_y, data_json) VALUES (?, ?, ?, ?, ?, ?)', [n.id, wfId, n.type, 0, 0, JSON.stringify(n.data)]);
        }
        for (const e of edges) {
            await db.query('INSERT INTO workflow_edges (id, workflow_id, source_id, target_id) VALUES (?, ?, ?, ?)', [e.id, wfId, e.source, e.target]);
        }
        console.log('2. Created Test Workflow:', wfId);

        // 3. Trigger Execution via Queue
        console.log('3. Enqueuing Workflow Job...');
        nurtureQueue.add('execute_workflow', {
            type: 'PROCESS_WORKFLOW_EXECUTION',
            workflowId: wfId,
            leadId: leadId
        });

        // 4. Wait for Worker to Pick Up
        console.log('4. Waiting 5s for worker...');
        await new Promise(r => setTimeout(r, 5000));

        // 5. Verify Step 1 Execution
        const msgs = await db.query('SELECT * FROM messages WHERE lead_id = ?', [leadId]);
        console.log('   Messages Sent:', msgs.rows.map(m => m.content));

        if (!msgs.rows.find(m => m.content.includes('Welcome'))) {
            throw new Error('Step 1 Message NOT sent!');
        }

        const executionRes = await db.query('SELECT * FROM workflow_executions WHERE lead_id = ?', [leadId]);
        const execution = executionRes.rows[0];
        console.log('   Execution Status:', execution.status);
        console.log('   Current Node:', execution.current_node_id);
        console.log('   Next Run At:', execution.next_run_at);

        if (execution.status !== 'WAITING') {
            throw new Error('Execution should be WAITING at delay node');
        }
        if (execution.current_node_id !== n4) { // Should be pointing to NEXT node (Msg 2)
            console.warn('   WARNING: Current Node ID is', execution.current_node_id, 'expected', n4);
        }

        console.log('=== SUCCESS: Workflow Started, Executed Step 1, and Paused at Delay ===');

    } catch (e) {
        console.error('FAIL:', e);
    }
}

run();
