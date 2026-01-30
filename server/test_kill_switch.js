
async function testHook() {
    try {
        const res = await fetch('http://localhost:5000/api/hooks/whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                From: 'whatsapp:+918072345679',
                Body: 'Stop contacting me, I want to talk to a human!',
                ProfileName: 'James Bond'
            })
        });

        console.log('Webhook Status:', res.status);
    } catch (err) {
        console.error('Request Failed:', err);
    }
}

testHook();
