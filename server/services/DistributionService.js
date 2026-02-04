const db = require('../db');

class DistributionService {
    /**
     * Assigns a lead to an agent based on organization settings.
     * @param {string|number} leadId - The ID of the lead to assign.
     * @param {string|number} orgId - The organization ID.
     */
    async distributeLead(leadId, orgId) {
        try {
            console.log(`[DISTRIBUTION] Distributing lead ${leadId} for org ${orgId}`);

            // 1. Get Distribution Mode from Settings
            // Assuming settings are key-value pairs in 'settings' table: organization_id, key, value
            // We look for key='distribution_mode'
            const settingsRes = await db.query(
                `SELECT value FROM settings WHERE organization_id = ? AND key = 'distribution_mode'`,
                [orgId]
            );
            const mode = settingsRes.rows.length > 0 ? settingsRes.rows[0].value : 'manual';

            if (mode !== 'round_robin') {
                console.log(`[DISTRIBUTION] Mode is '${mode}', skipping auto-assignment.`);
                return;
            }

            // 2. Find eligible users (Active)
            // Sort by last_assigned_at ASC (NULLs should be first or handled)
            // SQLite sorts NULLs first by default usually, or we can use COALESCE
            const usersRes = await db.query(
                `SELECT id FROM users 
                 WHERE organization_id = ? AND status = 'active' 
                 ORDER BY last_assigned_at ASC 
                 LIMIT 1`,
                [orgId]
            );

            if (usersRes.rows.length === 0) {
                console.log('[DISTRIBUTION] No active users found to assign.');
                return;
            }

            const assignedUser = usersRes.rows[0];
            const userId = assignedUser.id;

            console.log(`[DISTRIBUTION] Assigning to user ${userId}`);

            // 3. Assign Lead
            await db.query(`UPDATE leads SET assigned_to = ? WHERE id = ?`, [userId, leadId]);

            // 4. Update User's last_assigned_at
            await db.query(`UPDATE users SET last_assigned_at = datetime('now') WHERE id = ?`, [userId]);

            // 5. Notify User (TODO)
            // We could emit a socket event or push notification here

            return userId;

        } catch (err) {
            console.error('[DISTRIBUTION] Error:', err);
        }
    }
}

module.exports = new DistributionService();
