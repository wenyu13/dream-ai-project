/**
 * 微光循迹 - 用户认证管理器
 * 负责：注册存入数据库、登录持久化、申请信息对接
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    async init() {
        // 1. 检查本地是否已经存有用户信息
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateUI();
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        
        // 2. 绑定页面上的提交按钮
        this.bindEvents();
    }
    
    bindEvents() {
        // 绑定注册提交按钮
        const doRegister = document.getElementById('doRegister');
        if (doRegister) {
            doRegister.addEventListener('click', () => this.handleRegister());
        }

        // 绑定登录提交按钮
        const doLogin = document.getElementById('doLogin');
        if (doLogin) {
            doLogin.addEventListener('click', () => this.handleLogin());
        }
        
        // 绑定退出按钮
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // 🚀 新增：绑定“立即申请”提交逻辑
        const applySubmit = document.getElementById('applySubmit'); // 对应申请弹窗的提交按钮
        if (applySubmit) {
            applySubmit.addEventListener('click', () => this.handleApplication());
        }
    }
    
    // === 核心：注册逻辑 ===
    async handleRegister() {
        // 自动从你的 index.html 弹窗中抓取数据
        const userData = {
            email: document.getElementById('regEmail').value.trim(),
            username: document.getElementById('regUsername').value.trim(),
            password: document.getElementById('regPassword').value.trim(),
            real_name: document.getElementById('regRealName').value.trim(),
            role: document.getElementById('regRole').value
        };

        if (!userData.email || !userData.password) {
            this.showMessage('请填写完整的注册信息', 'error');
            return;
        }

        try {
            // 调用 api.js 里的接口
            const result = await window.DreamAI.Auth.register(userData);
            if (result.id || result.status === "success") {
                this.showMessage('注册成功！正在同步云端数据...', 'success');
                // 注册成功后直接执行登录流程
                await this.performLogin(userData.email, userData.password);
            }
        } catch (error) {
            this.showMessage(`注册失败: ${error.message}`, 'error');
        }
    }
    
    // === 核心：登录逻辑 ===
    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        await this.performLogin(email, password);
    }

    async performLogin(email, password) {
        try {
            // 1. 获取登录 Token
            const result = await window.DreamAI.Auth.login(email, password);
            localStorage.setItem('access_token', result.access_token);
            
            // 2. 立即从后端获取完整用户信息（确保数据准确）
            const userInfo = await window.DreamAI.Auth.getCurrentUser();
            this.currentUser = userInfo;
            
            // 3. 存入本地，下次打开网页不用重复登录
            localStorage.setItem('user', JSON.stringify(userInfo));
            
            this.updateUI();
            this.showMessage(`欢迎回来，${userInfo.username}`, 'success');
            
            // 4. 关闭所有弹窗
            if(window.closeModal) {
                window.closeModal('loginModal');
                window.closeModal('registerModal');
            }
            
            // 延时刷新页面以同步状态
            setTimeout(() => location.reload(), 1000);
        } catch (error) {
            this.showMessage('登录失败：账号或密码错误', 'error');
        }
    }

    // === 核心：申请信息对接管理端 ===
    async handleApplication() {
        if (!this.isLoggedIn()) {
            this.showMessage('请先登录后再提交申请', 'warning');
            window.openModal('loginModal');
            return;
        }

        const applyData = {
            // 这里对应你 index.html 里申请弹窗的输入框
            real_name: document.querySelector('#applyModal input[placeholder*="姓名"]')?.value,
            phone: document.querySelector('#applyModal input[placeholder*="电话"]')?.value,
            description: document.querySelector('#applyModal textarea')?.value,
            type: "volunteer"
        };

        try {
            // 调用 api.js 里新增的申请接口
            await window.DreamAI.Applications.create(applyData);
            this.showMessage('申请已发送至云端管理平台！', 'success');
            if(window.closeModal) window.closeModal('applyModal');
        } catch (error) {
            this.showMessage('提交失败，请检查网络', 'error');
        }
    }
    
    logout() {
        localStorage.clear();
        this.currentUser = null;
        this.updateUI();
        this.showMessage('已安全退出', 'info');
        setTimeout(() => location.href = 'index.html', 500);
    }
    
    updateUI() {
        const userNav = document.getElementById('userNav');
        const guestNav = document.getElementById('guestNav');
        
        if (this.currentUser) {
            if (userNav) userNav.style.display = 'flex';
            if (guestNav) guestNav.style.display = 'none';
            
            const nameEl = document.querySelector('.user-name');
            if (nameEl) nameEl.textContent = this.currentUser.username;
        } else {
            if (userNav) userNav.style.display = 'none';
            if (guestNav) guestNav.style.display = 'flex';
        }
    }
    
    showMessage(message, type = 'info') {
        // 直接使用你 script.js 里定义的精美 Toast
        if (window.Toast) {
            window.Toast.show(message, type);
        } else {
            alert(message);
        }
    }
    
    isLoggedIn() { return !!this.currentUser; }
}

// 创建全局实例
window.AuthManager = new AuthManager();
