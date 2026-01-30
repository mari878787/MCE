const http = require('http');

function request(url, options = {}, body = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const opts = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = http.request(opts, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.log('Raw response:', data);
                    resolve(data);
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(body);
        }
        req.end();
    });
}

async function test() {
    try {
        console.log('Testing GET /api/settings...');
        const data1 = await request('http://localhost:5000/api/settings');
        console.log('GET Result:', data1);

        console.log('Testing POST /api/settings...');
        const data2 = await request('http://localhost:5000/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, JSON.stringify({ key: 'auto_reply_enabled', value: 'false' }));
        console.log('POST Result:', data2);

        console.log('Testing GET again...');
        const data3 = await request('http://localhost:5000/api/settings');
        console.log('GET Result:', data3);

        if (data3.auto_reply_enabled === 'false') {
            console.log('SUCCESS: Setting updated.');
        } else {
            console.error('FAILURE: Setting did not update.');
        }

        // RESET
        await request('http://localhost:5000/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, JSON.stringify({ key: 'auto_reply_enabled', value: 'true' }));
        console.log('Reset setting to true.');

    } catch (err) {
        console.error(err);
    }
}

test();
