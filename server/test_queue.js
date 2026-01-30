const { addJob } = require('./utils/queue');

async function test() {
    try {
        console.log('Testing addJob...');
        const job = await addJob('TEST_JOB', { foo: 'bar' });
        console.log('Job Added:', job);
    } catch (e) {
        console.error('Job Failed:', e);
    }
}

test();
