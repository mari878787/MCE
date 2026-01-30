const db = require('../db');

/**
 * Assigns a lead to the next available sales rep (Round Robin).
 * Uses a Redis key or DB constraint in production. 
 * For MVP, we pick the rep with the fewest active leads or simple modulo.
 */
const assignLead = async () => {
    try {
        // 1. Get all active sales reps
        const result = await db.query(
            "SELECT id, name FROM users WHERE role = 'sales_rep' AND is_active = true ORDER BY id ASC"
        );

        if (result.rows.length === 0) {
            console.warn('No active sales reps found. Lead unassigned.');
            return null;
        }

        const reps = result.rows;

        // TODO: Implement sophisticated round-robin state (e.g., in Redis).
        // For now, Random assignment as MVP (Replace with true circular logic later)
        const randomIndex = Math.floor(Math.random() * reps.length);
        return reps[randomIndex].id;

    } catch (error) {
        console.error('Router Error:', error);
        return null; // Fail safe
    }
};

module.exports = { assignLead };
