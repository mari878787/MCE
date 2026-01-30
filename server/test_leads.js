
async function checkLeads() {
    try {
        const res = await fetch('http://localhost:5000/api/leads');
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Leads:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch Failed:', err);
    }
}

checkLeads();
