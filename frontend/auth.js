document.addEventListener('DOMContentLoaded', () => {
    // --- 状态检查：如果登录了，更新导航栏 ---
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        if(document.getElementById('guestNav')) document.getElementById('guestNav').style.display = 'none';
        const userNav = document.getElementById('userNav');
        if(userNav) {
            userNav.style.display = 'flex';
            const nameEl = userNav.querySelector('.user-name');
            if(nameEl) nameEl.textContent = user.username;
        }
    }

    // --- 注册逻辑 ---
    document.getElementById('doRegister')?.addEventListener('click', async () => {
        const userData = {
            email: document.getElementById('regEmail')?.value || document.querySelector('#registerModal input[type="email"]')?.value,
            username: document.getElementById('regUsername')?.value || document.querySelector('#registerModal input[type="text"]')?.value,
            password: document.getElementById('regPassword')?.value || document.querySelector('#registerModal input[type="password"]')?.value,
            role: document.getElementById('regRole')?.value || "volunteer"
        };
        try {
            await window.DreamAI.Auth.register(userData);
            alert("注册成功！信息已存入数据库，请登录。");
            location.reload();
        } catch (e) { alert(e.message); }
    });

    // --- 登录逻辑 ---
    document.getElementById('doLogin')?.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail')?.value || document.querySelector('#loginModal input[type="email"]')?.value;
        const password = document.getElementById('loginPassword')?.value || document.querySelector('#loginModal input[type="password"]')?.value;
        try {
            const res = await window.DreamAI.Auth.login(email, password);
            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('user', JSON.stringify(res.user));
            alert("欢迎回来！");
            location.reload();
        } catch (e) { alert("登录失败：请检查账号密码"); }
    });

    // --- 立即申请逻辑 (对接管理端) ---
    document.getElementById('applySubmit')?.addEventListener('click', async () => {
        const applyData = {
            real_name: document.querySelector('#applyModal input[placeholder*="姓名"]')?.value,
            phone: document.querySelector('#applyModal input[placeholder*="手机"]')?.value,
            description: document.querySelector('#applyModal textarea')?.value,
            type: "volunteer"
        };
        try {
            await window.DreamAI.Applications.create(applyData);
            alert("申请已提交！管理员将在后台看到您的信息。");
            if(typeof closeModal === 'function') closeModal('applyModal');
        } catch (e) { alert("提交失败，请先登录账号"); }
    });
});
