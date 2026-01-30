const { PhoneNumberUtil, PhoneNumberFormat } = require('google-libphonenumber');
const phoneUtil = PhoneNumberUtil.getInstance();

/**
 * Validates and formats a phone number to E.164.
 * Returns { valid: boolean, formatted: string, country: string }
 */
const validatePhone = (phone, defaultRegion = 'IN') => {
    try {
        if (!phone) return { valid: false, error: 'No phone provided' };

        const number = phoneUtil.parseAndKeepRawInput(phone, defaultRegion);
        const isValid = phoneUtil.isValidNumber(number);

        if (!isValid) return { valid: false, error: 'Invalid format' };

        return {
            valid: true,
            formatted: phoneUtil.format(number, PhoneNumberFormat.E164),
            country: phoneUtil.getRegionCodeForNumber(number),
            type: phoneUtil.getNumberType(number) // 1 = MOBILE
        };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};

module.exports = { validatePhone };
