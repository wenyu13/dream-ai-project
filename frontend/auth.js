/**
 * 用户认证模块
 * 处理登录、注册、用户状态管理
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        // 检查本地存储的用户信息
        const userData = localStorage.getItem('user_data');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateUI();
            } catch (e) {
                console.error('用户数据解析失败:', e);
                localStorage.removeItem('user_data');
            }
        }
        
        // 绑定事件
        this.bindEvents();
    }
    
    bindEvents() {
        // 登录按钮
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }
        
        // 注册按钮
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showRegisterModal());
        }
        
        // 退出按钮
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }
    
    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <div class="auth-modal-header">
                    <h3>用户登录</h3>
                    <button class="auth-modal-close">&times;</button>
                </div>
                <div class="auth-modal-body">
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginUsername">邮箱/用户名</label>
                            <input type="text" id="loginUsername" required placeholder="请输入邮箱或用户名">
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">密码</label>
                            <input type="password" id="loginPassword" required placeholder="请输入密码">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary auth-modal-close">取消</button>
                            <button type="submit" class="btn-primary">登录</button>
                        </div>
                    </form>
                    <div class="auth-switch">
                        还没有账号？ <a href="javascript:void(0)" class="switch-to-register">立即注册</a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定事件
        modal.querySelector('.auth-modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.switch-to-register').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.showRegisterModal();
        });
        
        modal.querySelector('#loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login(
                document.getElementById('loginUsername').value,
                document.getElementById('loginPassword').value
            ).then(() => {
                document.body.removeChild(modal);
            });
        });
    }
    
    showRegisterModal() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <div class="auth-modal-header">
                    <h3>用户注册</h3>
                    <button class="auth-modal-close">&times;</button>
                </div>
                <div class="auth-modal-body">
                    <form id="registerForm">
                        <div class="form-group">
                            <label for="registerEmail">邮箱</label>
                            <input type="email" id="registerEmail" required placeholder="请输入邮箱">
                        </div>
                        <div class="form-group">
                            <label for="registerUsername">用户名</label>
                            <input type="text" id="registerUsername" required placeholder="请输入用户名">
                        </div>
                        <div class="form-group">
                            <label for="registerPassword">密码</label>
                            <input type="password" id="registerPassword" required placeholder="请输入密码（至少8位）">
                        </div>
                        <div class="form-group">
                            <label for="registerFullName">姓名（可选）</label>
                            <input type="text" id="registerFullName" placeholder="请输入真实姓名">
                        </div>
                        <div class="form-group">
                            <label for="registerRole">注册身份</label>
                            <select id="registerRole" required>
                                <option value="">请选择身份</option>
                                <option value="volunteer">志愿者</option>
                                <option value="teacher">教师</option>
                                <option value="student">学生</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary auth-modal-close">取消</button>
                            <button type="submit" class="btn-primary">注册</button>
                        </div>
                    </form>
                    <div class="auth-switch">
                        已有账号？ <a href="javascript:void(0)" class="switch-to-login">立即登录</a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定事件
        modal.querySelector('.auth-modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.switch-to-login').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.showLoginModal();
        });
        
        modal.querySelector('#registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register({
                email: document.getElementById('registerEmail').value,
                username: document.getElementById('registerUsername').value,
                password: document.getElementById('registerPassword').value,
                full_name: document.getElementById('registerFullName').value || undefined,
                role: document.getElementById('registerRole').value
            }).then(() => {
                document.body.removeChild(modal);
            });
        });
    }
    
    async login(username, password) {
        try {
            const result = await window.DreamAI.Auth.login(username, password);
            
            // 获取用户信息
            const userInfo = await window.DreamAI.Auth.getCurrentUser();
            this.currentUser = userInfo;
            
            // 保存到本地存储
            localStorage.setItem('user_data', JSON.stringify(userInfo));
            
            // 更新UI
            this.updateUI();
            
            // 显示成功消息
            this.showMessage('登录成功！', 'success');
            
            return true;
        } catch (error) {
            this.showMessage(`登录失败: ${error.message}`, 'error');
            return false;
        }
    }
    
    async register(userData) {
        try {
            // 验证密码长度
            if (userData.password.length < 8) {
                throw new Error('密码长度至少8位');
            }
            
            const result = await window.DreamAI.Auth.register(userData);
            
            // 自动登录
            const loginResult = await this.login(userData.email, userData.password);
            
            if (loginResult) {
                this.showMessage('注册成功！已自动登录', 'success');
            }
            
            return true;
        } catch (error) {
            this.showMessage(`注册失败: ${error.message}`, 'error');
            return false;
        }
    }
    
    logout() {
        window.DreamAI.Auth.logout();
        this.currentUser = null;
        localStorage.removeItem('user_data');
        this.updateUI();
        this.showMessage('已退出登录', 'info');
    }
    
    updateUI() {
        const userNav = document.getElementById('userNav');
        const guestNav = document.getElementById('guestNav');
        
        if (this.currentUser) {
            // 显示用户信息
            if (userNav) {
                userNav.style.display = 'flex';
                guestNav.style.display = 'none';
                
                const userName = userNav.querySelector('.user-name');
                const userRole = userNav.querySelector('.user-role');
                const userAvatar = userNav.querySelector('.user-avatar');
                
                if (userName) userName.textContent = this.currentUser.full_name || this.currentUser.username;
                if (userRole) userRole.textContent = window.DreamAI.Utils.getRoleName(this.currentUser.role);
                if (userAvatar) {
                    userAvatar.textContent = (this.currentUser.full_name || this.currentUser.username).charAt(0).toUpperCase();
                }
            }
            
            // 更新页面标题
            document.title = `筑梦AI支教 - ${window.DreamAI.Utils.getRoleName(this.currentUser.role)}工作台`;
        } else {
            // 显示访客界面
            if (userNav && guestNav) {
                userNav.style.display = 'none';
                guestNav.style.display = 'flex';
            }
            
            // 恢复默认标题
            document.title = '筑梦AI支教 - 智慧支教生态系统';
        }
    }
    
    showMessage(message, type = 'info') {
        // 创建消息提示
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // 自动消失
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    isLoggedIn() {
        return !!this.currentUser;
    }
    
    getUser() {
        return this.currentUser;
    }
    
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }
    
    hasAnyRole(roles) {
        return this.currentUser && roles.includes(this.currentUser.role);
    }
}

// 创建全局认证管理器
window.AuthManager = new AuthManager();

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
.auth-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.auth-modal-content {
    background: white;
    border-radius: 20px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.auth-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #eee;
}

.auth-modal-header h3 {
    margin: 0;
    color: var(--primary-green);
    font-size: 1.3rem;
}

.auth-modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.auth-modal-close:hover {
    background: #f5f5f5;
}

.auth-modal-body {
    padding: 24px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
    font-size: 0.9rem;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: var(--primary-green);
}

.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 30px;
}

.btn-primary,
.btn-secondary {
    flex: 1;
    padding: 14px;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary {
    background: var(--primary-green);
    color: white;
}

.btn-primary:hover {
    background: var(--accent-orange);
    transform: translateY(-2px);
}

.btn-secondary {
    background: #f5f5f5;
    color: #666;
}

.btn-secondary:hover {
    background: #e0e0e0;
}

.auth-switch {
    text-align: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    color: #666;
    font-size: 0.9rem;
}

.auth-switch a {
    color: var(--primary-green);
    text-decoration: none;
    font-weight: 600;
}

.auth-switch a:hover {
    text-decoration: underline;
}

/* 用户导航样式 */
.user-nav {
    display: flex;
    align-items: center;
    gap: 15px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--primary-green);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1rem;
}

.user-details {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: #333;
}

.user-role {
    font-size: 0.8rem;
    color: #666;
}

.logout-btn {
    background: none;
    border: 1px solid #ddd;
    color: #666;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.3s;
}

.logout-btn:hover {
    background: #f5f5f5;
    color: #333;
}

/* Toast消息样式 */
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 1001;
    transform: translateX(120%);
    transition: transform 0.3s ease;
    max-width: 350px;
}

.toast.show {
    transform: translateX(0);
}

.toast-success {
    border-left: 4px solid #10b981;
}

.toast-error {
    border-left: 4px solid #ef4444;
}

.toast-info {
    border-left: 4px solid #3b82f6;
}

.toast-icon {
    font-size: 1.2rem;
    font-weight: bold;
}

.toast-success .toast-icon {
    color: #10b981;
}

.toast-error .toast-icon {
    color: #ef4444;
}

.toast-info .toast-icon {
    color: #3b82f6;
}

.toast-message {
    flex: 1;
    font-size: 0.9rem;
    color: #333;
}

/* 导航栏样式更新 */
.nav-links {
    display: flex;
    align-items: center;
    gap: 20px;
}

.guest-nav {
    display: flex;
    gap: 10px;
}

.login-btn,
.register-btn {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
}

.login-btn {
    background: transparent;
    color: var(--primary-green);
    border: 2px solid var(--primary-green);
}

.login-btn:hover {
    background: var(--primary-green);
    color: white;
}

.register-btn {
    background: var(--primary-green);
    color: white;
    border: 2px solid var(--primary-green);
}

.register-btn:hover {
    background: var(--accent-orange);
    border-color: var(--accent-orange);
}
`;

document.head.appendChild(style);

console.log('✅ 用户认证模块已加载');
