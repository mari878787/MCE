
async function checkChats() {
    try {
        console.log('Fetching chats...');
        const res = await fetch('http://localhost:5000/api/whatsapp/chats');
        console.log('Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Chats found:', data.length);
            console.log('Example:', JSON.stringify(data[0] || {}, null, 2));
        } else {
            const text = await res.text();
            console.log('Error Body:', text);
        }
    } catch (err) {
        console.error('Fetch Failed:', err);
    }
}

checkChats();
