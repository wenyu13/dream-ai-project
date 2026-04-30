document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        if(document.getElementById('guestNav')) document.getElementById('guestNav').style.display = 'none';
        if(document.getElementById('userNav')) {
            document.getElementById('userNav').style.display = 'flex';
            document.querySelector('.user-name').textContent = user.username;
        }
    }

    // 登录提交
    document.getElementById('doLogin')?.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        try {
            const res = await window.DreamAI.Auth.login(email, password);
            if (res.access_token) {
                localStorage.setItem('access_token', res.access_token);
                const userInfo = await window.DreamAI.Auth.getCurrentUser();
                localStorage.setItem('user', JSON.stringify(userInfo));
                alert("登录成功！");
                location.reload();
            } else { alert("邮箱或密码错误"); }
        } catch (e) { alert("服务器连接失败"); }
    });

    // 注册提交
    document.getElementById('doRegister')?.addEventListener('click', async () => {
        const userData = {
            email: document.getElementById('regEmail').value,
            username: document.getElementById('regUsername').value,
            password: document.getElementById('regPassword').value,
            real_name: document.getElementById('regRealName').value,
            role: document.getElementById('regRole').value
        };
        try {
            await window.DreamAI.Auth.register(userData);
            alert("注册成功，请登录！");
            location.reload();
        } catch (e) { alert("注册失败，邮箱可能已存在"); }
    });
});

function handleLogout() {
    localStorage.clear();
    location.href = 'index.html';
}
