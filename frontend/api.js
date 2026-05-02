/**
 * 微光循迹 - 前端 API 工具 (全功能对接版)
 * 作用：处理与 Hugging Face 后端的通讯
 */

const API_BASE = 'https://cghsdcnklsd-dream-ai-api.hf.space/api';

window.DreamAI = {
    // ==================== 1. AI 助手模块 ====================
    AI: {
        async chat(message) {
            try {
                const response = await fetch(`${API_BASE}/ai/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: message })
                });
                if (!response.ok) throw new Error('AI 响应异常');
                return await response.json();
            } catch (error) {
                console.error('AI API 错误:', error);
                throw error;
            }
        }
    },

    // ==================== 2. 用户认证模块 ====================
    Auth: {
        // 注册新账号
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

        // 登录账号
        async login(email, password) {
            // 注意：FastAPI 登录通常使用 Form Data 格式
            const formData = new URLSearchParams();
            formData.append('username', email); // 后端通常将 email 作为 username
            formData.append('password', password);

            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });
            if (!response.ok) throw new Error('账号或密码错误');
            return await response.json();
        },

        // 🚀 新增：获取当前登录用户的详细信息 (实现“记住登录”的关键)
        async getCurrentUser() {
            const token = localStorage.getItem('access_token');
            if (!token) return null;
            
            const response = await fetch(`${API_BASE}/auth/me`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('登录已失效');
            return await response.json();
        }
    },

    // ==================== 3. 🚀 新增：申请管理模块 (对接管理员的关键) ====================
    Applications: {
        // 志愿者提交申请
        async create(applyData) {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/applications/`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(applyData)
            });
            if (!response.ok) throw new Error('申请提交失败');
            return await response.json();
        },

        // 管理员获取所有人的申请列表
        async getAll() {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/applications/`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('权限不足或未登录');
            return await response.json();
        }
    }
};

console.log("✅ 核心 API 接口已全量加载（含认证、申请与AI）");
