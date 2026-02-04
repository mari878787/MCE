const axios = require('axios');
const db = require('../db');

class FacebookService {
    constructor() {
        this.appId = process.env.FACEBOOK_APP_ID;
        this.appSecret = process.env.FACEBOOK_APP_SECRET;
        this.callbackUrl = process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/api/auth/facebook/callback';
        this.graphUrl = 'https://graph.facebook.com/v18.0';
    }

    getLoginUrl(state) {
        const params = new URLSearchParams({
            client_id: this.appId,
            redirect_uri: this.callbackUrl,
            state: state, // Ideally a random string + org_id encrypted
            scope: 'email,public_profile,pages_show_list,pages_read_engagement,leads_retrieval,pages_manage_ads',
            response_type: 'code'
        });
        return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
    }

    async exchangeCodeForToken(code) {
        try {
            const res = await axios.get(`${this.graphUrl}/oauth/access_token`, {
                params: {
                    client_id: this.appId,
                    client_secret: this.appSecret,
                    redirect_uri: this.callbackUrl,
                    code: code
                }
            });
            return res.data; // { access_token, token_type, ... }
        } catch (error) {
            console.error('FB Token Exchange Error:', error.response?.data || error.message);
            throw new Error('Failed to exchange code');
        }
    }

    async getUserInfo(accessToken) {
        const res = await axios.get(`${this.graphUrl}/me`, {
            params: {
                fields: 'id,name,email',
                access_token: accessToken
            }
        });
        return res.data;
    }

    async getPages(accessToken) {
        // Fetch pages user manages
        const res = await axios.get(`${this.graphUrl}/me/accounts`, {
            params: {
                fields: 'id,name,access_token,category',
                access_token: accessToken
            }
        });
        return res.data.data;
    }

    async getPageLead(leadId, pageAccessToken) {
        try {
            const res = await axios.get(`${this.graphUrl}/${leadId}`, {
                params: {
                    access_token: pageAccessToken
                }
            });
            return res.data;
        } catch (error) {
            console.error('FB Get Lead Error:', error.response?.data || error.message);
            throw error;
        }
    }
    async getPageForms(pageId, pageAccessToken) {
        try {
            const res = await axios.get(`${this.graphUrl}/${pageId}/leadgen_forms`, {
                params: {
                    access_token: pageAccessToken,
                    fields: 'id,name,status,leads_count'
                }
            });
            return res.data.data;
        } catch (error) {
            console.error('FB Get Forms Error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getFormFields(formId, pageAccessToken) {
        try {
            const res = await axios.get(`${this.graphUrl}/${formId}`, {
                params: {
                    access_token: pageAccessToken,
                    fields: 'id,name,questions'
                }
            });
            return res.data;
        } catch (error) {
            console.error('FB Get Form Fields Error:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new FacebookService();
