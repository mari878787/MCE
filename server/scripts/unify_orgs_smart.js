const db = require('../db');

async function fixOrgsSmart() {
    try {
        console.log('Fixing Organizations (Smart Merge)...');

        const users = await db.query("SELECT * FROM users LIMIT 1");
        const correctOrgId = users.rows[0].organization_id;
        console.log(`Target Org ID: ${correctOrgId}`);

        // 1. Get ALL leads
        const allLeads = await db.query("SELECT id, phone, organization_id FROM leads");
        console.log(`Processing ${allLeads.rows.length} leads...`);

        // 2. Identify Phones we already have in the Target Org
        const targetOrgPhones = new Set();
        const leadsInTarget = allLeads.rows.filter(l => l.organization_id === correctOrgId);
        leadsInTarget.forEach(l => targetOrgPhones.add(l.phone));

        let upgraded = 0;
        let deleted = 0;

        for (const lead of allLeads.rows) {
            // If lead is ALREADY in correct org, skip
            if (lead.organization_id === correctOrgId) continue;

            // If this phone already exists in target org (collision)
            if (targetOrgPhones.has(lead.phone)) {
                // DELETE this duplicate (it's the 'wrong' one from the void)
                // In a real app we might merge, but for now delete
                await db.query("DELETE FROM leads WHERE id = ?", [lead.id]);
                deleted++;
            } else {
                // Safe to move
                await db.query("UPDATE leads SET organization_id = ? WHERE id = ?", [correctOrgId, lead.id]);
                targetOrgPhones.add(lead.phone); // Add to set so we don't collide with next one
                upgraded++;
            }
        }

        console.log(`Done. Moved ${upgraded} leads. Deleted ${deleted} duplicates.`);

    } catch (e) {
        console.error(e);
    }
}

fixOrgsSmart();
