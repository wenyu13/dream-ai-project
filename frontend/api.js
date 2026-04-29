/**
 * 微光循迹 - 核心 API 配置文件
 */
const API_BASE = 'https://cghsdcnklsd-dream-ai-api.hf.space/api';

window.DreamAI = {
    // === AI 助手模块 ===
    AI: {
        async chat(message) {
            const response = await fetch(`${API_BASE}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            if (!response.ok) throw new Error('AI 响应异常');
            return await response.json();
        }
    },

    // === 用户认证模块 ===
    Auth: {
        async login(email, password) {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) throw new Error('账号或密码错误');
            return await response.json();
        },

        async register(userData) {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || '注册失败');
            }
            return await response.json();
        },

        async getCurrentUser() {
            const token = localStorage.getItem('access_token');
            if (!token) return null;
            const response = await fetch(`${API_BASE}/auth/me`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('登录已过期');
            return await response.json();
        }
    }
};
console.log('✅ api.js 加载成功');
