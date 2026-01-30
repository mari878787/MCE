const service = require('./services/whatsapp');
console.log('Type of restart:', typeof service.restart);
console.log('Service keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(service)));
