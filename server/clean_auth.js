const fs = require('fs');
const path = require('path');

const authPath = path.join(__dirname, '.wwebjs_auth');
const cachePath = path.join(__dirname, '.wwebjs_cache');

if (fs.existsSync(authPath)) {
    console.log('Removing .wwebjs_auth...');
    fs.rmSync(authPath, { recursive: true, force: true });
    console.log('Removed .wwebjs_auth successfully.');
} else {
    console.log('.wwebjs_auth does not exist.');
}

if (fs.existsSync(cachePath)) {
    console.log('Removing .wwebjs_cache...');
    fs.rmSync(cachePath, { recursive: true, force: true });
    console.log('Removed .wwebjs_cache successfully.');
} else {
    console.log('.wwebjs_cache does not exist.');
}
