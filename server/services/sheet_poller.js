const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const csv = require('csv-parser');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { Readable } = require('stream');

const CONFIG_PATH = path.resolve(__dirname, '../sheet_config.json');

// Helper to save URL
function saveConfig(url) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ url, last_sync: new Date() }));
}

// Helper to get URL
function getConfig() {
    if (!fs.existsSync(CONFIG_PATH)) return null;
    try {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch { return null; }
}

async function syncNow() {
    const config = getConfig();
    if (!config || !config.url) return;

    console.log('[SHEET POLLER] Starting Sync...', config.url);

    try {
        const response = await fetch(config.url);
        if (!response.ok) throw new Error('Failed to fetch');
        const text = await response.text();

        const results = [];
        const s = new Readable();
        s.push(text);
        s.push(null);

        s.pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    let newLeads = 0;
                    // Default to org 1 for auto-sync if context missing
                    const DEFAULT_ORG = '1';

                    for (const row of results) {
                        try {
                            const name = row.name || row.Name || row['Full Name'] || row.full_name || 'Unknown';
                            const phone = row.phone || row.Phone || row.Mobile || row['Phone Number'] || row.phone_number || null;
                            const email = row.email || row.Email || null;

                            if (!phone) continue;

                            // Check existence within the org (or globally? For now per org)
                            const exist = await db.query('SELECT id FROM leads WHERE phone = ? AND organization_id = ?', [phone, DEFAULT_ORG]);
                            if (exist.rows.length === 0) {
                                const id = uuidv4();
                                await db.query(
                                    'INSERT INTO leads (id, organization_id, name, phone, email, source, status, score, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                    [id, DEFAULT_ORG, name, phone, email, 'google_sheet_auto', 'NEW', 10, JSON.stringify(row), new Date().toISOString()]
                                );
                                newLeads++;
                            }
                        } catch (e) {
                            console.error('[SHEET POLLER] Row Error:', e.message);
                        }
                    }
                    if (newLeads > 0) console.log(`[SHEET POLLER] Imported ${newLeads} new leads.`);
                    saveConfig(config.url); // Update timestamp
                } catch (err) {
                    console.error('[SHEET POLLER] Stream Error:', err);
                }
            });
    } catch (e) {
        console.error('[SHEET POLLER] Error:', e.message);
    }
}

function start() {
    // Run immediately on boot
    syncNow();
    // Run every 1 minute
    setInterval(syncNow, 1 * 60 * 1000);
}

module.exports = { start, saveConfig, syncNow, getConfig };
