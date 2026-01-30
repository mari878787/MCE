
async function checkAnalytics() {
    try {
        const res = await fetch('http://localhost:5000/api/analytics/whatsapp');
        console.log('Status:', res.status);
        const contentType = res.headers.get('content-type');
        console.log('Content-Type:', contentType);

        if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            console.log('Data:', JSON.stringify(data, null, 2));
        } else {
            const text = await res.text();
            console.log('Received HTML/Text:', text.substring(0, 100));
        }
    } catch (err) {
        console.error('Fetch Failed:', err);
    }
}

checkAnalytics();
