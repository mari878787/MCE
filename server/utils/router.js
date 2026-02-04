const db = require('../db');

/**
 * Assigns a lead to the next available sales rep (Round Robin).
 * Uses a Redis key or DB constraint in production. 
 * For MVP, we pick the rep with the fewest active leads or simple modulo.
 */
const assignLead = async (orgId = 1) => {
    try {
        // 1. Get Settings (Optional: Check if distribution is enabled)
        // For now, we enforce Round Robin for all

        // 2. Find Next Available Rep
        // Sort by last_assigned_at ASC (Oldest first)
        // Filter by Status = 'active' (and organization)
        const result = await db.query(
            "SELECT id, name FROM users WHERE organization_id = ? AND status = 'active' ORDER BY last_assigned_at ASC LIMIT 1",
            [orgId]
        );

        if (result.rows.length === 0) {
            console.warn(`[ROUTER] No active users found in Org ${orgId}. Lead unassigned.`);
            return null;
        }

        const selectedUser = result.rows[0];
        console.log(`[ROUTER] Assigning lead to ${selectedUser.name} (${selectedUser.id})`);

        // 3. Update User's Timestamp
        await db.query(
            "UPDATE users SET last_assigned_at = datetime('now') WHERE id = ?",
            [selectedUser.id]
        );

        return selectedUser.id;

    } catch (error) {
        console.error('Router Error:', error);
        return null; // Fail safe
    }
};

module.exports = { assignLead };
