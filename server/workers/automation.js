const db = require('../db');
const { nurtureQueue } = require('../utils/queue');
const { v4: uuidv4 } = require('uuid');
const whatsappService = require('../services/whatsapp');
const workflowEngine = require('../lib/WorkflowEngine');

console.log('[WORKER] Initializing Automation Brain (Local Mode)...');

// Sends using the Real WhatsApp Web Client
async function sendWhatsApp(phone, template, params) {
    try {
        let message = '';
        if (template === 'standard_welcome') {
            message = `Hi ${params.name}, thanks for reaching out! How can we help you today?`;
        } else if (template === 'vip_welcome') {
            message = `Hello ${params.name}! We noticed your inquiry. A senior consultant will call you shortly.`;
        } else {
            message = `[${template}] Hello ${params.name}`;
        }

        console.log(`[WHATSAPP] Sending to ${phone}: ${message}`);
        await whatsappService.sendMessage(phone, message);
        return message;
    } catch (error) {
        console.error(`[WHATSAPP FAIL] Could not send to ${phone}`, error);
        throw error;
    }
}

// ------------------------------------------------------------------
// WORKER LOGIC
// ------------------------------------------------------------------

const processJob = async (jobData) => {
    const { leadId, stage, type, campaignId, workflowId, executionId } = jobData;
    console.log(`[WORKER] Processing Job:`, jobData.type || jobData);

    try {
        // --- A. WORKFLOW PROCESSING ---
        if (type === 'PROCESS_WORKFLOW_EXECUTION') {
            await workflowEngine.process(workflowId, leadId, executionId);
            return;
        }

        // --- B. WORKFLOW BATCH POLLING (Scheduled) ---
        if (type === 'POLL_WORKFLOWS') {
            const now = new Date().toISOString();
            // Find WAITING executions that are due
            const dueRes = await db.query(
                "SELECT * FROM workflow_executions WHERE status = 'WAITING' AND next_run_at <= ?",
                [now]
            );

            if (dueRes.rows.length > 0) {
                console.log(`[WORKER] Resuming ${dueRes.rows.length} workflow executions...`);
                for (const row of dueRes.rows) {
                    await workflowEngine.process(row.workflow_id, row.lead_id, row.id);
                }
            }
            return;
        }

        // --------------------------------------------------------------
        // 1. CAMPAIGN BATCH PROCESSING (Legacy)
        // --------------------------------------------------------------
        if (type === 'PROCESS_CAMPAIGN_BATCH') {
            const stepsRes = await db.query('SELECT * FROM campaign_steps WHERE campaign_id = ? ORDER BY step_order ASC', [campaignId]);
            const steps = stepsRes.rows;

            if (steps.length === 0) return;

            const now = new Date().toISOString();
            const dueRes = await db.query(
                "SELECT * FROM campaign_audience WHERE campaign_id = ? AND status != 'COMPLETED' AND status != 'FAILED' AND next_run_at <= ?",
                [campaignId, now]
            );
            const dueLeads = dueRes.rows;

            console.log(`[CAMPAIGN WORKER] Processing ${dueLeads.length} leads for Campaign ${campaignId}`);

            for (const item of dueLeads) {
                const currentStepIndex = item.current_step - 1;
                if (currentStepIndex >= steps.length) {
                    await db.query("UPDATE campaign_audience SET status = 'COMPLETED' WHERE id = ?", [item.id]);
                    continue;
                }

                const step = steps[currentStepIndex];
                const leadRes = await db.query('SELECT * FROM leads WHERE id = ?', [item.lead_id]);
                const lead = leadRes.rows[0];

                if (!lead || lead.stopped_automation) {
                    await db.query("UPDATE campaign_audience SET status = 'FAILED' WHERE id = ?", [item.id]);
                    continue;
                }

                try {
                    if (step.type === 'WHATSAPP') {
                        let content = step.content.replace('{{name}}', lead.name || 'Friend');
                        console.log(`[STEP ${step.step_order}] Sending to ${lead.phone}`);
                        await whatsappService.sendMessage(lead.phone, content);

                        await db.query(
                            "INSERT INTO messages (id, lead_id, type, direction, content, timestamp) VALUES (?, ?, ?, ?, ?, datetime('now'))",
                            [uuidv4(), lead.id, 'whatsapp', 'outbound', content]
                        );

                        const nextStep = item.current_step + 1;
                        await db.query(
                            "UPDATE campaign_audience SET current_step = ?, next_run_at = datetime('now') WHERE id = ?",
                            [nextStep, item.id]
                        );
                        await new Promise(r => setTimeout(r, 2000));

                    } else if (step.type === 'DELAY') {
                        const hours = parseInt(step.content) || 0;
                        console.log(`[STEP ${step.step_order}] Waiting ${hours} hours for ${lead.phone}`);

                        await db.query(
                            `UPDATE campaign_audience SET current_step = ?, next_run_at = datetime('now', '+${hours} hours') WHERE id = ?`,
                            [item.current_step + 1, item.id]
                        );
                    }
                } catch (err) {
                    console.error(`[CAMPAIGN FAIL] Lead ${lead.phone}: ${err.message}`);
                    await db.query("UPDATE campaign_audience SET status = 'FAILED', error_message = ? WHERE id = ?", [err.message, item.id]);
                }
            }
            return;
        }

        // --------------------------------------------------------------
        // 2. NURTURE DRIPS (Legacy logic)
        // --------------------------------------------------------------
        // Only fetch lead if we have a leadId
        if (!leadId) return;

        const res = await db.query('SELECT * FROM leads WHERE id = ?', [leadId]);
        if (res.rows.length === 0) return;
        const lead = res.rows[0];

        if (lead.stopped_automation || lead.status === 'REPLIED') {
            console.log(`[KILL SWITCH] Automation stopped for ${lead.name}.`);
            return;
        }

        if (stage === 'IMMEDIATE_WELCOME') {
            const isVIP = JSON.parse(lead.tags || '[]').includes('#VIP');
            const template = isVIP ? 'vip_welcome' : 'standard_welcome';
            const content = await sendWhatsApp(lead.phone, template, { name: lead.name });
            const msgId = uuidv4();
            await db.query(
                "INSERT INTO messages (id, lead_id, type, direction, content, timestamp) VALUES (?, ?, ?, ?, ?, datetime('now'))",
                [msgId, leadId, 'whatsapp', 'outbound', content]
            );
            await db.query("UPDATE leads SET status = 'CONTACTED', last_message_sent_at = datetime('now') WHERE id = ?", [leadId]);
        }

    } catch (err) {
        console.error(`[WORKER FAILED] ${err.message}`);
    }
};

// LISTEN TO MOCK QUEUE EVENTS
if (nurtureQueue.on) {
    nurtureQueue.on('job', async (job) => {
        console.log('[MOCK WORKER] Received job:', job.name);
        await processJob(job.data);
    });
} else {
    // Fallback if queue is weird
    console.warn('[WORKER] Queue does not support events?');
}

module.exports = {};
