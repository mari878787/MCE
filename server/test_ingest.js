

async function testIngest() {
    try {
        const res = await fetch('http://localhost:5000/api/leads/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "James Bond",
                phone: "+918072345679",
                source: "Secret Service",
                status: "VIP"
            })
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text);
    } catch (err) {
        console.error('Request Failed:', err);
    }
}

testIngest();
