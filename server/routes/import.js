const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const upload = multer({ dest: 'uploads/' });

// POST /api/leads/import - Bulk Import CSV
router.post('/import', upload.single('file'), (req, res) => {
    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            // Delete temp file
            fs.unlinkSync(filePath);

            console.log(`[IMPORT] Processing ${results.length} rows`);
            let successString = 0;
            let errors = 0;

            for (const row of results) {
                try {
                    // Mapping Logic: Try various common headers
                    const name = row.name || row.Name || row['Full Name'] || row.full_name || 'Unknown';
                    const phone = row.phone || row.Phone || row.Mobile || row['Phone Number'] || row.phone_number || null;
                    const email = row.email || row.Email || null;
                    const source = 'import_csv';

                    if (!phone) {
                        errors++;
                        continue;
                    }

                    // Basic Insert (Or Update if specific dedupe logic existed, keeping simple for now)
                    // Checking existence first
                    const exist = await db.query('SELECT id FROM leads WHERE phone = ?', [phone]);
                    if (exist.rows.length === 0) {
                        const id = uuidv4();
                        await db.query(
                            'INSERT INTO leads (id, name, phone, email, source, status, score, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [id, name, phone, email, source, 'NEW', 10, JSON.stringify(row), new Date().toISOString()]
                        );
                        successString++;
                    } else {
                        // Skip duplicates or update? skipping for safety
                        errors++;
                    }
                } catch (e) {
                    console.error('Row Import Error', e);
                    errors++;
                }
            }

            res.json({
                success: true,
                message: `Processed ${results.length} rows.`,
                stats: { imported: successString, skipped: errors }
            });
        });
});

// POST /api/leads/sync-sheet - Fetch from Google Sheet CSV URL
const sheetPoller = require('../services/sheet_poller');

router.post('/sync-sheet', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        // Save valid URL for auto-poller
        sheetPoller.saveConfig(url);

        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch sheet');

        const text = await response.text();
        const results = [];

        // Simple CSV Parse (Manual or stream)
        const Readable = require('stream').Readable;
        const s = new Readable();
        s.push(text);
        s.push(null);

        s.pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                console.log(`[SHEET SYNC] Fetched ${results.length} rows`);
                let success = 0;
                let errors = 0;

                for (const row of results) {
                    try {
                        const name = row.name || row.Name || row['Full Name'] || row.full_name || 'Unknown';
                        const phone = row.phone || row.Phone || row.Mobile || row['Phone Number'] || row.phone_number || null;
                        const email = row.email || row.Email || null;

                        if (!phone) { errors++; continue; }

                        // Dedupe Check
                        const exist = await db.query('SELECT id FROM leads WHERE phone = ?', [phone]);
                        if (exist.rows.length === 0) {
                            const id = uuidv4();
                            await db.query(
                                'INSERT INTO leads (id, name, phone, email, source, status, score, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                [id, name, phone, email, 'google_sheet', 'NEW', 10, JSON.stringify(row), new Date().toISOString()]
                            );
                            success++;
                        } else {
                            errors++; // Duplicate
                        }
                    } catch (e) { errors++; }
                }

                res.json({
                    success: true,
                    imported: success,
                    total: results.length,
                    columns: results.length > 0 ? Object.keys(results[0]) : []
                });
            });
    } catch (error) {
        console.error('Sheet Sync Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/leads/sync-sheet/config - Get saved config
router.get('/sync-sheet/config', (req, res) => {
    try {
        const config = sheetPoller.getConfig();
        res.json(config || { url: '', last_sync: null });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
