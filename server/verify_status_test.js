const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/whatsapp/status',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('API Response:', data);
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e);
});

req.end();
