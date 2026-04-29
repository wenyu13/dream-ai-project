/**
 * 微光循迹 - 核心 API 配置文件 (全功能补全版)
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
            return await response.json();
        }
    },

    // === 用户认证模块 ===
    Auth: {
        // 登录
        async login(email, password) {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) throw new Error('账号或密码错误');
            return await response.json();
        },

        // 注册
        async register(userData) {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await response.json();
        },

        // 🚀 补全这个缺失的函数：获取当前用户信息
        async getCurrentUser() {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('身份验证过期');
            return await response.json();
        },

        // 退出
        logout() {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
        }
    },

    // === 工具模块 ===
    Utils: {
        getRoleName(role) {
            const roles = {
                'admin': '管理员',
                'teacher': '支教老师',
                'volunteer': '志愿者',
                'student': '学生'
            };
            return roles[role] || '用户';
        }
    }
};

console.log('✅ 核心 API 已补全：getCurrentUser 已就绪');
