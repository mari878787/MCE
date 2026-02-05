const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { randomUUID } = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-env';

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.rows && existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create organization for new user
        const orgId = randomUUID();
        const orgName = `${name}'s Organization`;
        await db.query(
            "INSERT INTO organizations (id, name, plan, created_at) VALUES (?, ?, 'free', datetime('now'))",
            [orgId, orgName]
        );

        // Create user
        const userId = randomUUID();
        await db.query(
            "INSERT INTO users (id, name, email, password, role, status, organization_id, created_at) VALUES (?, ?, ?, ?, 'admin', 'active', ?, datetime('now'))",
            [userId, name, email, hashedPassword, orgId]
        );

        res.status(201).json({
            message: 'Account created successfully',
            user: {
                id: userId,
                name,
                email,
                role: 'admin',
                organization_id: orgId
            }
        });

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        // Note: db.query returning rows array differently depending on adapter
        // Assuming db.query returns array of rows directly or a result object
        // Let's check how other routes use it. Usually `const rows = await db.query(...)`
        // But if it's sqlite3 wrapper, it might be `rows` or `result`.
        // Inspecting `leads.js` would confirm. For now assuming standard array return from custom wrapper.

        const result = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                organization_id: user.organization_id // Payload now includes Org ID
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                organization_id: user.organization_id
            }
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/auth/me
const authMiddleware = require('../middleware/authMiddleware');
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const result = await db.query("SELECT id, name, email, role, status, organization_id FROM users WHERE id = ?", [req.user.id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Me Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
