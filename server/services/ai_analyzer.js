/**
 * AI Analyzer Service
 * 
 * Uses heuristic keyword matching to perform "Sentiment Analysis" on inbound messages.
 * In a production environment, this would call OpenAI/Gemini API.
 * 
 * Score:
 *  > 0 : POSITIVE
 *  < 0 : NEGATIVE
 *  = 0 : NEUTRAL
 */

const POSITIVE_KEYWORDS = [
    'interested', 'yes', 'price', 'cost', 'buy', 'purchase',
    'demo', 'book', 'call', 'great', 'thanks', 'good', 'love', 'amazing'
];

const NEGATIVE_KEYWORDS = [
    'stop', 'unsubscribe', 'no', 'remove', 'hate',
    'spam', 'cancel', 'expensive', 'bad', 'wrong', 'fuck', 'shit'
];

class AIAnalyzer {

    /**
     * Analyze text sentiment
     * @param {string} text 
     * @returns {string} 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
     */
    static analyzeSentiment(text) {
        if (!text) return 'NEUTRAL';

        const lowerText = text.toLowerCase();
        let score = 0;

        POSITIVE_KEYWORDS.forEach(word => {
            if (lowerText.includes(word)) score += 1;
        });

        NEGATIVE_KEYWORDS.forEach(word => {
            if (lowerText.includes(word)) score -= 1;
        });

        if (score > 0) return 'POSITIVE';
        if (score < 0) return 'NEGATIVE';
        return 'NEUTRAL';
    }
}

module.exports = AIAnalyzer;
