# Functional Requirements Document
**Project:** MCE Platform
**Date:** 2025-12-28
**Source:** [Product Requirements Document](Product_Requirements_Document.md)

## 1. Lead Ingestion Module

### 1.1 CSV Bulk Import
*   **Input:** The system MUST accept `.csv` files via the `/api/leads/import` endpoint.
*   **Parsing Logic:**
    *   The system MUST attempt to map columns case-insensitively using the following precedence:
        *   **Name:** `name`, `Name`, `Full Name`, `full_name`. Default: 'Unknown'.
        *   **Phone:** `phone`, `Phone`, `Mobile`, `Phone Number`, `phone_number`. **Required**.
        *   **Email:** `email`, `Email`. Default: `null`.
*   **Validation:**
    *   Rows missing a `phone` value MUST be skipped and counted as errors.
*   **Deduplication:**
    *   The system MUST query the database for an existing lead with the same `phone` before insertion.
    *   If a match is found, the new row MUST be skipped (no update performed).
*   **Output:** JSON response containing `imported` count, `skipped` count, and total processed.

### 1.2 Google Sheet Sync
*   **Input:** The system MUST accept a public CSV URL (e.g., Google Sheet published as CSV) via `/api/leads/sync-sheet`.
*   **Polling:**
    *   The system MUST poll the configured URL at intervals (defined in `sheet_poller` service).
*   **Processing:**
    *   Same parsing and deduplication logic as **1.1 CSV Bulk Import**.
*   **Error Handling:**
    *   If the URL is unreachable, the system MUST log the error but continue retrying on the next cycle.

## 2. WhatsApp Communication Module

### 2.1 Connection Management
*   **Initialization:**
    *   The system MUST initialize a Puppeteer instance running `whatsapp-web.js`.
    *   The system MUST emit a `qr` event when authentication is required.
*   **Session Persistence:**
    *   The system MUST save authentication tokens to `.wwebjs_auth` to persist sessions across restarts.
*   **Disconnection:**
    *   On `disconnected` event, the system MUST automatically attempt to re-initialize and generate a new QR code if needed.

### 2.2 Inbound Message Handling (Real-time)
*   **Listener:**
    *   The system MUST listen for the `message` event from the WhatsApp client.
*   **Lead Creation:**
    *   If a message arrives from a number NOT in the database, the system MUST create a new Lead record.
    *   *Source* shall be set to `whatsapp_realtime`.
*   **Message Storage:**
    *   The system MUST save the message content, timestamp, and direction (`inbound`) to the `messages` table.
    *   The system MUST update the lead's `last_message_sent_at` timestamp.

### 2.3 Outbound Message Sending
*   **Input:** API accepts `to` (phone number) and `content` (string).
*   **Number Formatting:**
    *   The system MUST strip `+` and spaces from the input phone number.
    *   The system MUST append `@c.us` if not present.
*   **Execution:**
    *   The system MUST use `client.sendMessage()` to dispatch the text.
*   **Error Handling:**
    *   If the client is not `CONNECTED`, the system MUST return a `WhatsApp not connected` error.
    *   If the number is invalid (not on WhatsApp), the error from the library MUST be propagated.

### 2.4 History Sync
*   **Trigger:** Manual trigger via `/api/whatsapp/sync` or startup routine.
*   **Scope:** The system MUST fetch the most recent 50 active chats.
*   **Logic:**
    *   For each chat, ensure a Lead record exists (create if missing).
    *   Fetch the last 20 messages for that chat.
    *   Insert messages into the database ONLY if they do not already exist (deduplication by `lead_id` + `timestamp` + `content`).

## 3. Campaign Management Module (Expanded)

### 3.1 Campaign Creation
*   **Input:** The system MUST accept a campaign `name`, an ordered list of `steps`, and an optional `target_filter`.
*   **Step definition:** Steps can be of type `WHATSAPP` (with content) or `DELAY` (with duration).
*   **Persistence:**
    *   Campaign details MUST be stored in the `campaigns` table with status 'DRAFT'.
    *   Steps MUST be stored in the `campaign_steps` table, ordered by `step_order`.

### 3.2 Audience Initialization
*   **Trigger:** `/api/campaigns/:id/start` endpoint.
*   **Selection Logic:**
    *   The system MUST select all leads where `stopped_automation` is 0 (False).
    *   (Future) The system SHOULD respect the `target_filter` to refine the selection.
*   **Audience Creation:**
    *   The system MUST create entries in `campaign_audience` for every eligible lead.
    *   Initial status MUST be 'PENDING', and `current_step` MUST be 1.
*   **Execution Start:**
    *   The system MUST update the campaign status to 'RUNNING'.
    *   The system MUST queue a background job (`PROCESS_CAMPAIGN_BATCH`) to begin processing immediately.

### 3.3 Segmentation (Preview)
*   **Persistence:** Segments are stored in the `segments` table with a `criteria_json` field.
*   **Preview:** The system MUST provide a dry-run capability via `/api/segments/preview`.
*   **Logic:**
    *   Supported operators: `contains`, `not_contains` (on Tags), and status checks.
    *   The system MUST iterate through leads and return a count of matches along with a sample of 5 leads.

## 4. Automation & Workflow Module (Expanded)

### 4.1 Visual Workflow Builder Support
*   **Node/Edge Persistence:**
    *   The system MUST store workflow structures as nodes (`workflow_nodes`) and edges (`workflow_edges`) to support a visual React Flow frontend.
    *   Node data (configuration) MUST be stored as a JSON blob.
*   **CRUD:**
    *   The system MUST support full replacement (Delete & Re-insert) of nodes and edges upon saving a workflow to ensure synchronization with the frontend state.

### 4.2 Triggers & Actions (Runtime)
*   **New Lead:**
    *   The system MUST evaluate workflows when a new lead is inserted.
*   **Status Change:**
    *   The system MUST evaluate workflows when a lead's `status` field is updated.

## 5. Analytics & Reporting (Expanded)

### 5.1 Dashboard Statistics (`/api/analytics/whatsapp`)
*   **Sent Messages:** Count of all messages where `type='whatsapp'` and `direction='outbound'`.
*   **Kill Switch Stats:**
    *   **Stopped Count:** Total number of leads with `stopped_automation = 1` (Leads that have replied or manually opted out).
    *   **Recent Stops:** List of the last 5 leads who triggered the kill switch, including their name and timestamp.
*   **Queue Depth:** Count of leads currently in 'NEW' status (pending processing).

## 6. API & Data Access
*   **Leads Endpoint (`GET /api/leads`):**
    *   MUST return a JSON array of all leads.
    *   MUST support pagination (optional).
*   **Messages Endpoint (`GET /api/leads/:id/messages`):**
    *   MUST return all messages associated with the specific Lead ID.
    *   MUST sort messages by `created_at` ascending.

---
*Generated by Antigravity*
