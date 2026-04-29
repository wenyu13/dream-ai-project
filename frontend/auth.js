/**
 * 微光循迹 - 用户认证逻辑
 */
document.addEventListener('DOMContentLoaded', () => {
    // 更新导航栏 UI
    function updateNavUI() {
        const user = JSON.parse(localStorage.getItem('user'));
        const guestNav = document.getElementById('guestNav');
        const userNav = document.getElementById('userNav');

        if (user && userNav && guestNav) {
            guestNav.style.display = 'none';
            userNav.style.display = 'flex';
            document.querySelector('.user-name').textContent = user.username;
            document.querySelector('.user-role').textContent = "志愿者伙伴";
        }
    }

    // 注册逻辑
    document.getElementById('doRegister')?.addEventListener('click', async () => {
        const userData = {
            email: document.getElementById('regEmail').value.trim(),
            username: document.getElementById('regUsername').value.trim(),
            password: document.getElementById('regPassword').value.trim(),
            real_name: document.getElementById('regRealName').value.trim(),
            role: document.getElementById('regRole').value
        };

        if (!userData.email || !userData.password) return alert("请填写邮箱和密码");

        try {
            await window.DreamAI.Auth.register(userData);
            alert("🎉 注册成功！资料已存入云端，请登录。");
            closeModal('registerModal');
            openModal('loginModal');
        } catch (e) { alert(e.message); }
    });

    // 登录逻辑
    document.getElementById('doLogin')?.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        try {
            const res = await window.DreamAI.Auth.login(email, password);
            localStorage.setItem('access_token', res.access_token);
            
            const userInfo = await window.DreamAI.Auth.getCurrentUser();
            localStorage.setItem('user', JSON.stringify(userInfo));
            
            alert("欢迎回来，" + userInfo.username);
            window.location.reload(); 
        } catch (e) { alert("登录失败：" + e.message); }
    });

    // 退出逻辑
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    updateNavUI();
});
