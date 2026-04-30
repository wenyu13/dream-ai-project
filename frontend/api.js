/**
 * 筑梦AI支教项目 - 前端API工具 (完整合并版)
 */
const API_BASE = 'https://cghsdcnklsd-dream-ai-api.hf.space/api';

window.DreamAI = {
    // === AI 助手模块 ===
    AI: {
        async chat(message) {
            try {
                const response = await fetch(`${API_BASE}/ai/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ message: message })
                });
                if (!response.ok) throw new Error('网络响应不正常');
                return await response.json();
            } catch (error) {
                console.error('AI API 调用失败:', error);
                throw error;
            }
        }
    },

    // === 原有的用户认证模块 (保留你队友的代码逻辑) ===
    Auth: {
        async login(email, password) {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return await response.json();
        },
        async register(userData) {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await response.json();
        }
    }
};
console.log("✅ 筑梦AI支教API工具(含AI功能)已加载");
