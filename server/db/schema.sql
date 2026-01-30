CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'sales_rep',
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY, -- We still use UUID strings for IDs
  name TEXT,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  source TEXT,
  status TEXT DEFAULT 'NEW',
  score INTEGER DEFAULT 0,
  tags TEXT, -- JSON String
  tracking_dna TEXT, -- JSON String
  metadata TEXT, -- JSON String
  assigned_to INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_message_sent_at DATETIME,
  stopped_automation INTEGER DEFAULT 0,
  FOREIGN KEY(assigned_to) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  type TEXT,
  direction TEXT,
  content TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(lead_id) REFERENCES leads(id)
);


-- Campaigns (Container)
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    target_filter TEXT DEFAULT 'ALL', -- 'ALL', 'VIP', 'TAG:xyz'
    status TEXT DEFAULT 'DRAFT', -- DRAFT, RUNNING, COMPLETED
    scheduled_at DATETIME, -- For future scheduling
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Steps (The Sequence)
CREATE TABLE IF NOT EXISTS campaign_steps (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    step_order INTEGER NOT NULL, -- 1, 2, 3...
    type TEXT NOT NULL, -- 'WHATSAPP', 'DELAY'
    content TEXT, -- Message body OR Delay in hours (e.g. "24")
    meta TEXT, -- JSON for extra config (images, etc)
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Campaign Audience (State Tracking)
CREATE TABLE IF NOT EXISTS campaign_audience (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    lead_id TEXT NOT NULL,
    current_step INTEGER DEFAULT 1,
    status TEXT DEFAULT 'PENDING', -- PENDING, ACTIVE, COMPLETED, FAILED, WAITING
    next_run_at DATETIME, -- When the next step should trigger (for delays)
    last_run_at DATETIME,
    error_message TEXT,
    FOREIGN KEY(lead_id) REFERENCES leads(id)
);


-- WORKFLOWS (Visual Builder)
CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    name TEXT,
    nodes TEXT, -- JSON
    edges TEXT, -- JSON
    status TEXT DEFAULT 'DRAFT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- WORKFLOW EXECUTIONS (State Tracking for Graph)
CREATE TABLE IF NOT EXISTS workflow_executions (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    lead_id TEXT NOT NULL,
    current_node_id TEXT, -- The Node ID (string) we are currently at (or just finished)
    status TEXT DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, WAITING
    context TEXT, -- JSON bag for variables (e.g. { "form_data": ... })
    next_run_at DATETIME, -- For delays
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(workflow_id) REFERENCES workflows(id),
    FOREIGN KEY(lead_id) REFERENCES leads(id)
);

