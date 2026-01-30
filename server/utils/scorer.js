/**
 * Calculates lead score and tags based on rules.
 * @param {Object} lead - The standardized lead object
 * @param {Object} validationResult - Result from validatePhone
 */
const scoreLead = (lead, validationResult) => {
    let score = 0;
    let tags = [];
    let status = 'NEW';

    // Rule 1: Phone Validation (+10 verified, -50 invalid/trash)
    if (validationResult.valid) {
        score += 10; // Verified WhatsApp Number
    } else {
        score -= 50;
        status = 'TRASH';
        tags.push('#InvalidNumber');
    }

    // Rule 2: Source Intent (+15 for GMB)
    const source = lead.source.toLowerCase();
    if (source === 'gmb_call' || source === 'gmb') {
        score += 15;
        tags.push('#GMB');
    } else if (['call', 'whatsapp_inbound'].includes(source)) {
        score += 10;
        tags.push('#HighIntent');
    }

    // Rule 3: Budget/Metadata (+50)
    // Assumes metadata has a 'budget' field or similar
    const budget = lead.metadata?.budget || 0;
    if (budget > 50000) {
        score += 50;
        tags.push('#VIP');
    }

    // Rule 4: Location (Chennai specific)
    if (lead.metadata?.city?.toLowerCase() === 'chennai') {
        tags.push('#Local');
    }

    return { score, tags, status };
};

module.exports = { scoreLead };
