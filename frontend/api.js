const API_BASE = 'https://cghsdcnklsd-dream-ai-api.hf.space/api';

window.DreamAI = {
    AI: {
        async chat(message) {
            const res = await fetch(`${API_BASE}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            return await res.json();
        }
    },
    Auth: {
        async login(email, password) {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return await res.json();
        },
        async register(userData) {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await res.json();
        },
        async getCurrentUser() {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_BASE}/auth/me`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await res.json();
        }
    }
};
