async function runTest() {
    try {
        // 1. Login
        const loginRes = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'demo1@synchro.com', password: 'password' })
        });
        const loginData = await loginRes.json();

        // Handle different possible structures for token
        const token = loginData?.data?.token || loginData?.token;

        if (!token) {
            console.error('Login failed, no token returned:', loginData);
            return;
        }
        console.log('Login successful, got token');

        // 2. Just create a new session
        const createRes = await fetch('http://localhost:3002/api/chat/sessions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: 'Test Session' })
        });
        const createData = await createRes.json();

        if (!createData.success) {
            console.error('Session creation failed:', createData);
            return;
        }
        const sessionId = createData.data.id;
        console.log('Created new session id:', sessionId);

        // 3. Send the message that causes the bug
        console.log('Sending message...');
        const chatRes = await fetch(`http://localhost:3002/api/chat/sessions/${sessionId}/message`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Siapa saja nama customer di dokumen invoice terakhir?' })
        });

        const chatData = await chatRes.json();
        if (!chatRes.ok) {
            console.error('Request failed with status:', chatRes.status);
            console.error('SERVER RESPONSE DATA:', JSON.stringify(chatData, null, 2));
        } else {
            console.log('Success:', chatData);
        }
    } catch (err) {
        console.error('Error string:', err.toString());
    }
}

runTest();
