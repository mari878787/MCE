
async function simulateReply() {
    const payload = {
        phone: '+918072345679', // James Bond
        message: 'Stop contacting me, I want to talk to a human!'
    };

    try {
        console.log('Simulating inbound message...');
        const res = await fetch('http://localhost:5000/api/whatsapp/test/inbound', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Result:', JSON.stringify(data, null, 2));

    } catch (err) {
        console.error('Test Failed:', err);
    }
}

simulateReply();
