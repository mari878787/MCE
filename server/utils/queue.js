const { EventEmitter } = require('events');
require('dotenv').config();

// MOCK QUEUE for Local Development (No Redis)
class MockQueue extends EventEmitter {
    constructor(name) {
        super();
        this.name = name;
        console.log(`[QUEUE] Initialized MOCK Queue: ${name}`);
        this.handlers = {}; // Initialize handlers storage
    }

    // Override EventEmitter's 'on' method to add logging and custom handler storage
    on(event, handler) {
        console.log(`[QUEUE] Registering handler for event: ${event}`);
        this.handlers[event] = handler; // Store the handler
        // Call the original EventEmitter's 'on' method as well, if desired,
        // but the provided snippet suggests a custom handling mechanism.
        // super.on(event, handler); // Uncomment if you want both custom and standard EventEmitter behavior
        return this; // For chaining
    }

    async add(name, data, opts) {
        console.log(`[QUEUE] Mock Job Added: ${name}`, data);

        // Use the custom handler if registered
        if (this.handlers['job']) {
            console.log(`[QUEUE] Triggering "job" handler for ${name}...`);
            this.handlers['job']({ name, data });
        } else {
            console.log('[QUEUE] No custom handler registered for "job", emitting via EventEmitter...');
            this.emit('job', { name, data });
        }
        return { id: 'mock-' + Date.now() };
    }
}

const nurtureQueue = new MockQueue('nurture-queue');

async function addJob(name, data, delay = 0) {
    return nurtureQueue.add(name, data, { delay });
}

module.exports = { nurtureQueue, addJob, connection: {} };
