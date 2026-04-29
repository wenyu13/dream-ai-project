/**
 * 微光循迹 - 用户认证管理器
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUI();
        }
        this.bindEvents();
    }
    
    bindEvents() {
        // 绑定按钮逻辑
        document.getElementById('doRegister')?.addEventListener('click', () => this.register());
        document.getElementById('doLogin')?.addEventListener('click', () => this.login());
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
    }
    
    async login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            // 1. 获取 Token
            const result = await window.DreamAI.Auth.login(email, password);
            localStorage.setItem('access_token', result.access_token);
            
            // 2. 获取详细资料 (刚才报错的地方)
            const userInfo = await window.DreamAI.Auth.getCurrentUser();
            this.currentUser = userInfo;
            localStorage.setItem('user', JSON.stringify(userInfo));
            
            alert(`登录成功！欢迎回来，${userInfo.username}`);
            window.location.reload(); 
        } catch (error) {
            alert(`登录失败: ${error.message}`);
        }
    }
    
    async register() {
        const userData = {
            username: document.getElementById('regUsername').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            real_name: document.getElementById('regRealName').value,
            role: "volunteer"
        };

        try {
            await window.DreamAI.Auth.register(userData);
            alert("注册成功！即将为您自动登录...");
            // 自动调用上面的登录
            document.getElementById('loginEmail').value = userData.email;
            document.getElementById('loginPassword').value = userData.password;
            this.login();
        } catch (error) {
            alert("注册失败，请检查邮箱是否重复");
        }
    }
    
    logout() {
        window.DreamAI.Auth.logout();
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
        }
    }
}

window.AuthManager = new AuthManager();
