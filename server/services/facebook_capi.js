const bizSdk = require('facebook-nodejs-business-sdk');
const db = require('../db');

class FacebookCapiService {
    constructor() {
        this.EventRequest = bizSdk.EventRequest;
        this.UserData = bizSdk.UserData;
        this.ServerEvent = bizSdk.ServerEvent;
        this.Content = bizSdk.Content;
        this.CustomData = bizSdk.CustomData;
    }

    async getPixelId(orgId) {
        // Fetch Pixel ID from settings if stored per org, or env var for single tenant
        // For MVP SaaS, we might fallback to ENV, but ideally it's in settings.
        const res = await db.query("SELECT value FROM settings WHERE key = 'fb_pixel_id' AND organization_id = ?", [orgId]);
        if (res.rows.length > 0) return res.rows[0].value;
        return process.env.FACEBOOK_PIXEL_ID;
    }

    async getAccessToken(orgId) {
        // Prefer Page Token if available (as it acts as system user usually), or User Token.
        // Or use a dedicated System User Token in ENV for CAPI if it's the platform's pixel.
        // But usually it's the User's Pixel, so we need their token.
        // We'll use the Page Token we already stored for Lead Ads IF it has permissions. 
        // Otherwise, fallback to ENV (Platform Token).
        const res = await db.query("SELECT value FROM settings WHERE key = 'fb_page_token' AND organization_id = ?", [orgId]);
        if (res.rows.length > 0) return res.rows[0].value;
        return process.env.FACEBOOK_ACCESS_TOKEN; // Fallback
    }

    async sendEvent(eventName, eventData, orgId) {
        try {
            const pixelId = await this.getPixelId(orgId);
            const accessToken = await this.getAccessToken(orgId);

            if (!pixelId || !accessToken) {
                console.log('Skipping CAPI: Missing Pixel ID or Access Token');
                return;
            }

            bizSdk.FacebookAdsApi.init(accessToken);

            const userData = new this.UserData()
                .setEmails([eventData.email])
                .setPhones([eventData.phone])
                .setClientIpAddress(eventData.ip)
                .setClientUserAgent(eventData.userAgent)
                .setFbc(eventData.fbc) // Click ID from cookie
                .setFbp(eventData.fbp); // Browser ID from cookie

            // Hash user data (SHA256) happens automatically in SDK usually?
            // Yes, bizSdk UserData handles normalization and hashing if you pass raw strings.

            const customData = new this.CustomData()
                .setCurrency('USD')
                .setValue(eventData.value || 0.0);

            if (eventData.contentName) {
                const content = new this.Content().setId(eventData.contentId).setQuantity(1);
                customData.setContents([content]);
            }

            const serverEvent = new this.ServerEvent()
                .setEventName(eventName)
                .setEventTime(Math.floor(Date.now() / 1000))
                .setUserData(userData)
                .setCustomData(customData)
                .setEventSourceUrl(eventData.sourceUrl)
                .setActionSource('website');

            const eventsData = [serverEvent];
            const eventRequest = new this.EventRequest(accessToken, pixelId).setEvents(eventsData);

            const response = await eventRequest.execute();
            console.log(`CAPI Event '${eventName}' sent:`, response);
            return response;

        } catch (error) {
            console.error('CAPI Error:', error.response ? error.response.error : error.message);
            // Don't throw, just log. CAPI failure shouldn't break the app flow.
        }
    }
}

module.exports = new FacebookCapiService();
