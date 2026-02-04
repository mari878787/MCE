const express = require('express');
const router = express.Router();
const facebookService = require('../services/facebook');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// 1. Redirect to Facebook ("Connect" button hits this)
// We need the User's Org ID to associate the connection later via State
router.get('/facebook', authMiddleware, (req, res) => {
    // State stores org_id to restore session context in callback (simplistic approach)
    // Production should sign/encrypt this state to prevent CSRF
    const state = JSON.stringify({ orgId: req.user.organization_id, userId: req.user.id });
    const url = facebookService.getLoginUrl(Buffer.from(state).toString('base64'));
    res.json({ url });
});

// 2. Callback
router.get('/facebook/callback', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/settings?error=facebook_denied`);
    }

    try {
        // Decode State
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        const { orgId, userId } = stateData;

        // Exchange for User Token
        const tokenData = await facebookService.exchangeCodeForToken(code);
        const userAccessToken = tokenData.access_token;

        // Save User Token? Or just fetch Pages immediately?
        // Let's fetch pages immediately and save them as "Integrations"
        // We'll create a table 'integrations' or just start 'pages' table?
        // For MVP, save token in 'settings' (bad practice for multi-page) or return to UI to select page.

        // Better: Redirect to UI with query param 'fb_token', let frontend save it? No, insecure.
        // Best: Save user_access_token in DB (temp) and redirect UI to "Select Page" screen.

        // We'll store:
        // settings table: key='fb_user_token', value=token, org_id
        await db.query(`INSERT INTO settings (organization_id, key, value) 
            VALUES (?, 'fb_user_token', ?) 
            ON CONFLICT(organization_id, key) DO UPDATE SET value=excluded.value`,
            [orgId, userAccessToken]
        ); // Note: SQLite syntax might differ, using upsert pattern manually if needed in existing logic

        // Manual Upsert for SQLite compatibility if ON CONFLICT not supported by setup
        const existing = await db.query("SELECT key FROM settings WHERE key = 'fb_user_token' AND organization_id = ?", [orgId]);
        if (existing.rows.length > 0) {
            await db.query("UPDATE settings SET value = ? WHERE key = 'fb_user_token' AND organization_id = ?", [userAccessToken, orgId]);
        } else {
            await db.query("INSERT INTO settings (key, value, organization_id) VALUES ('fb_user_token', ?, ?)", [userAccessToken, orgId]);
        }

        // Redirect back to Settings Page
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/settings?tab=integrations&fb_connected=true`);

    } catch (err) {
        console.error('FB Callback Error:', err);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/settings?error=facebook_failed`);
    }
});

// 3. List Pages (Frontend calls this to let user pick which page to sync)
router.get('/facebook/pages', authMiddleware, async (req, res) => {
    try {
        // Get User Token from DB
        const tokenRes = await db.query("SELECT value FROM settings WHERE key = 'fb_user_token' AND organization_id = ?", [req.user.organization_id]);
        if (tokenRes.rows.length === 0) return res.status(400).json({ error: 'Facebook not connected' });

        const pages = await facebookService.getPages(tokenRes.rows[0].value);
        res.json(pages);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

// 4. Subscribe Page (Save Page Token & Webhook Subscription)
router.post('/facebook/subscribe', authMiddleware, async (req, res) => {
    const { pageId, pageName, pageAccessToken } = req.body;

    // Save to settings: fb_page_id, fb_page_token
    // In real app, support multiple pages. MVP: Single page.
    try {
        const orgId = req.user.organization_id;

        // Upsert Page ID
        let check = await db.query("SELECT key FROM settings WHERE key='fb_page_id' AND organization_id=?", [orgId]);
        if (check.rows.length) await db.query("UPDATE settings SET value=? WHERE key='fb_page_id' AND organization_id=?", [pageId, orgId]);
        else await db.query("INSERT INTO settings (key, value, organization_id) VALUES ('fb_page_id', ?, ?)", [pageId, orgId]);

        // Upsert Page Name
        check = await db.query("SELECT key FROM settings WHERE key='fb_page_name' AND organization_id=?", [orgId]);
        if (check.rows.length) await db.query("UPDATE settings SET value=? WHERE key='fb_page_name' AND organization_id=?", [pageName, orgId]);
        else await db.query("INSERT INTO settings (key, value, organization_id) VALUES ('fb_page_name', ?, ?)", [pageName, orgId]);

        // Upsert Page Token
        check = await db.query("SELECT key FROM settings WHERE key='fb_page_token' AND organization_id=?", [orgId]);
        if (check.rows.length) await db.query("UPDATE settings SET value=? WHERE key='fb_page_token' AND organization_id=?", [pageAccessToken, orgId]);
        else await db.query("INSERT INTO settings (key, value, organization_id) VALUES ('fb_page_token', ?, ?)", [pageAccessToken, orgId]);

        // TODO: Call Facebook API to subscribe app to page webhooks (subscribed_apps edge)
        // await facebookService.subscribeApp(pageId, pageAccessToken);

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to subscribe page' });
    }
});

// 5. List Lead Forms
router.get('/facebook/forms', authMiddleware, async (req, res) => {
    try {
        const { pageId } = req.query;
        if (!pageId) return res.status(400).json({ error: 'Page ID required' });

        const orgId = req.user.organization_id;
        // Verify User owns/connected this page? For MVP, just check tokens.
        const tokenRes = await db.query("SELECT value FROM settings WHERE key = 'fb_page_token' AND organization_id = ?", [orgId]);
        if (tokenRes.rows.length === 0) return res.status(400).json({ error: 'Facebook Page not connected' });

        const pageAccessToken = tokenRes.rows[0].value;
        const forms = await facebookService.getPageForms(pageId, pageAccessToken);

        res.json(forms);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

// 6. Get Form Fields
router.get('/facebook/form/:formId', authMiddleware, async (req, res) => {
    try {
        const { formId } = req.params;
        const orgId = req.user.organization_id;
        const tokenRes = await db.query("SELECT value FROM settings WHERE key = 'fb_page_token' AND organization_id = ?", [orgId]);
        const pageAccessToken = tokenRes.rows[0].value;

        const formDetails = await facebookService.getFormFields(formId, pageAccessToken);
        res.json(formDetails);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch form fields' });
    }
});

// 7. Save Field Mapping
router.post('/facebook/mapping', authMiddleware, async (req, res) => {
    try {
        const { formId, mapping } = req.body; // mapping: { "field_key": "db_column" }
        const orgId = req.user.organization_id;
        const key = `fb_mapping_${formId}`;

        await db.query(`INSERT INTO settings (organization_id, key, value) 
            VALUES (?, ?, ?) 
            ON CONFLICT(organization_id, key) DO UPDATE SET value=excluded.value`,
            [orgId, key, JSON.stringify(mapping)]
        );

        // Manual Upsert Backup logic if needed (omitted for brevity, relying on SQLite 'ON CONFLICT' or similar logic used previously)
        const existing = await db.query("SELECT key FROM settings WHERE key = ? AND organization_id = ?", [key, orgId]);
        if (existing.rows.length > 0) {
            await db.query("UPDATE settings SET value = ? WHERE key = ? AND organization_id = ?", [JSON.stringify(mapping), key, orgId]);
        } else {
            await db.query("INSERT INTO settings (key, value, organization_id) VALUES (?, ?, ?)", [key, JSON.stringify(mapping), orgId]);
        }

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to save mapping' });
    }
});

module.exports = router;
