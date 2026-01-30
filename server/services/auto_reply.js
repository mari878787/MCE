const db = require('../db');

class AutoReplyService {
    /**
     * Check message content against rules and return response if match found.
     * @param {string} messageBody 
     * @returns {string|null} response text or null
     */
    static async checkAndGetReply(messageBody) {
        if (!messageBody) return null;

        try {
            // Fetch active rules
            // In production, cache this.
            const rulesResult = await db.query("SELECT keyword, response, match_type FROM auto_replies WHERE is_active = 1");
            const rules = rulesResult.rows;

            const text = messageBody.toLowerCase().trim();

            for (const rule of rules) {
                const keyword = rule.keyword.toLowerCase();
                let match = false;

                if (rule.match_type === 'exact') {
                    match = text === keyword;
                } else {
                    // contains
                    match = text.includes(keyword);
                }

                if (match) {
                    console.log(`Auto-Reply Matched: "${keyword}" for message "${text}"`);
                    return rule.response;
                }
            }
        } catch (err) {
            console.error('AutoReply Error:', err);
        }
        return null; // No match
    }
}

module.exports = AutoReplyService;
