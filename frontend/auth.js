/**
 * 微光循迹 - 用户认证模块
 * 处理登录、注册、用户状态管理
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        // 1. 从本地获取用户信息
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateUI();
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        this.bindEvents();
    }
    
    bindEvents() {
        // 绑定注册提交
        const doRegister = document.getElementById('doRegister');
        if (doRegister) {
            doRegister.addEventListener('click', () => this.handleRegister());
        }

        // 绑定登录提交
        const doLogin = document.getElementById('doLogin');
        if (doLogin) {
            doLogin.addEventListener('click', () => this.handleLogin());
        }
        
        // 退出按钮
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    // 注册逻辑
    async handleRegister() {
        const userData = {
            username: document.getElementById('regUsername').value.trim(),
            email: document.getElementById('regEmail').value.trim(),
            password: document.getElementById('regPassword').value.trim(),
            real_name: document.getElementById('regRealName').value.trim(),
            role: "volunteer" 
        };

        if (!userData.username || !userData.email || !userData.password) {
            alert("请填写必填项（用户名、邮箱、密码）");
            return;
        }

        try {
            const result = await window.DreamAI.Auth.register(userData);
            if (result.id || result.status === "success") {
                alert("🎉 注册成功！资料已同步至云端数据库。请登录。");
                closeModal('registerModal');
                openModal('loginModal');
            } else {
                alert("注册失败: " + (result.detail || "该邮箱可能已被注册"));
            }
        } catch (error) {
            alert("无法连接到后端服务器，请检查后端是否处于 Running 状态");
        }
    }

    // 登录逻辑
    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        try {
            const result = await window.DreamAI.Auth.login(email, password);
            if (result.access_token) {
                localStorage.setItem('access_token', result.access_token);
                localStorage.setItem('user', JSON.stringify(result.user));
                this.currentUser = result.user;
                
                alert("欢迎回来，" + result.user.username);
                closeModal('loginModal');
                this.updateUI();
                window.location.reload(); // 刷新以同步所有页面状态
            } else {
                alert("登录失败：账号或密码错误");
            }
        } catch (error) {
            alert("登录异常，请检查网络");
        }
    }
    
    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        this.currentUser = null;
        alert('已退出登录');
        window.location.href = 'index.html';
    }
    
    updateUI() {
        const userNav = document.getElementById('userNav');
        const guestNav = document.getElementById('guestNav');
        
        if (this.currentUser) {
            if (userNav) userNav.style.display = 'flex';
            if (guestNav) guestNav.style.display = 'none';
            
            const nameEl = document.querySelector('.user-name');
            if (nameEl) nameEl.textContent = this.currentUser.username;
            
            const roleEl = document.querySelector('.user-role');
            if (roleEl) roleEl.textContent = "志愿者伙伴";
        } else {
            if (userNav) userNav.style.display = 'none';
            if (guestNav) guestNav.style.display = 'flex';
        }
    }
}

// 初始化
window.AuthManager = new AuthManager();
console.log('✅ 微光循迹认证模块已就绪');
