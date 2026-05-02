const API_BASE = 'https://cghsdcnklsd-dream-ai-api.hf.space/api';

window.DreamAI = {
    // 1. AI 聊天接口
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
    // 2. 用户认证接口
    Auth: {
        async register(userData) {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.detail || '注册失败'); }
            return await res.json();
        },
        async login(email, password) {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) throw new Error('账号或密码错误');
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
    },
    // 3. 申请管理接口
    Applications: {
        async create(data) {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_BASE}/applications/`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return await res.json();
        },
        async getAll() {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_BASE}/applications/`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await res.json();
        }
    }
};
