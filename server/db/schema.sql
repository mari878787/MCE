-- ORGANIZATIONS (Multi-Tenancy Root)
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free', -- free, pro, enterprise
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT, -- Multi-tenant link
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT, -- Added for Auth
  role TEXT DEFAULT 'sales_rep',
  is_active INTEGER DEFAULT 1,
  avatar_url TEXT,
  preferences TEXT, -- JSON
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  organization_id TEXT, -- Multi-tenant link
  name TEXT,
  phone TEXT NOT NULL, -- Unique per Org constraint handled in logic or composite index
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
  FOREIGN KEY(assigned_to) REFERENCES users(id),
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  type TEXT,
  direction TEXT,
  content TEXT,
  sentiment TEXT, -- Added sentiment
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Added for consistency
  FOREIGN KEY(lead_id) REFERENCES leads(id)
);

-- Settings (Scoped to Org)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT,
    value TEXT,
    organization_id TEXT NOT NULL DEFAULT 'default-org',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (key, organization_id),
    FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

-- Campaigns (Container)
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    name TEXT NOT NULL,
    target_filter TEXT DEFAULT 'ALL',
    status TEXT DEFAULT 'DRAFT',
    scheduled_at DATETIME,
    metadata TEXT,
    spend REAL DEFAULT 0, -- Added spend tracking
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

-- Campaign Steps
CREATE TABLE IF NOT EXISTS campaign_steps (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    type TEXT NOT NULL,
    content TEXT,
    meta TEXT,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Campaign Audience
CREATE TABLE IF NOT EXISTS campaign_audience (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    lead_id TEXT NOT NULL,
    current_step INTEGER DEFAULT 1,
    status TEXT DEFAULT 'PENDING',
    next_run_at DATETIME,
    last_run_at DATETIME,
    error_message TEXT,
    FOREIGN KEY(lead_id) REFERENCES leads(id)
);

-- WORKFLOWS
CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    name TEXT,
    nodes TEXT, -- JSON
    edges TEXT, -- JSON
    status TEXT DEFAULT 'DRAFT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

-- WORKFLOW EXECUTIONS
CREATE TABLE IF NOT EXISTS workflow_executions (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    lead_id TEXT NOT NULL,
    current_node_id TEXT,
    status TEXT DEFAULT 'PENDING',
    context TEXT,
    next_run_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(workflow_id) REFERENCES workflows(id),
    FOREIGN KEY(lead_id) REFERENCES leads(id)
);
