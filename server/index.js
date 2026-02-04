require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initDb = require('./db/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database

// Initialize Database
initDb();

// Initialize Background Workers
require('./workers/automation'); // Loading this later to assume DB is ready

app.use(cors());
app.use(express.json());

const whatsappService = require('./services/whatsapp');
const sheetPoller = require('./services/sheet_poller');

// Start Services
// whatsappService.initialize(); // Auto-initialized in constructor
sheetPoller.start();
// Routes
const ingestRoutes = require('./routes/ingest');
const leadRoutes = require('./routes/leads');
const messageRoutes = require('./routes/messages');
const webhookRoutes = require('./routes/webhooks');
const analyticsRoutes = require('./routes/analytics');
const whatsappRoutes = require('./routes/whatsapp');
const campaignRoutes = require('./routes/campaigns');
const workflowRoutes = require('./routes/workflows');

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/leads', ingestRoutes);
app.use('/api/leads', require('./routes/import')); // New Import Route
app.use('/api/leads', leadRoutes); // Note: /api/leads base is shared, check logic inside files
app.use('/api/leads', messageRoutes); // Note: /api/leads base is shared

app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/hooks', webhookRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/team', require('./routes/team'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/quick-responses', require('./routes/quick_responses'));
app.use('/api/tracking', require('./routes/tracking'));
// Integrations
app.use('/api/auth', require('./routes/facebook_auth')); // Adds /api/auth/facebook methods
app.use('/api/hooks', require('./routes/webhooks_facebook')); // Adds /api/hooks/facebook methods

// Global Error Handlers to prevent server crash from Puppeteer
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  // Keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  // Keep server running
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (0.0.0.0)`);
});
