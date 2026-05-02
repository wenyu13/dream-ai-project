/**
 * 微光循迹 - 全局交互补丁 (极致兼容还原版)
 */

// 1. 全局弹窗控制 (确保 HTML onclick 必能点动)
window.openModal = function(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('active');
        if (id === 'aiAssistantWindow') el.style.right = '0';
        document.body.style.overflow = 'hidden';
    }
};

window.closeModal = function(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('active');
        if (id === 'aiAssistantWindow') el.style.right = '-400px';
        document.body.style.overflow = 'auto';
        const viewer = document.getElementById('modelViewer');
        if (id === 'modelViewerModal' && viewer) viewer.src = '';
    }
};

// 2. 🚀 3D 预览核心指令
window.open3D = function(name) {
    const viewer = document.getElementById('modelViewer');
    const nameEl = document.getElementById('modelName');
    if (nameEl) nameEl.innerText = name;
    
    let path = '';
    if(name.includes('斯特林')) path = './models/stirling.glb';
    else if(name.includes('连杆')) path = './models/linkage.glb';
    else if(name.includes('机器人')) path = './models/robot.glb';

    if (viewer && path) {
        viewer.src = path;
        window.openModal('modelViewerModal');
    }
};

// 3. 数字跳動逻辑
function startCounter(el) {
    if (el.dataset.done) return;
    const target = +el.dataset.target;
    let count = 0;
    const step = target / 40;
    const update = () => {
        count += step;
        if (count < target) {
            el.innerText = Math.ceil(count).toLocaleString();
            setTimeout(update, 20);
        } else {
            el.innerText = target.toLocaleString();
            el.dataset.done = "true";
        }
    };
    update();
}

// 4. 滚动观察器 (Reveal & Counter)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(c => startCounter(c));
        }
    });
}, { threshold: 0.1 });

// 5. 初始化
window.addEventListener('load', () => {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 鼠标光晕特效还原
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition: opacity 0.3s;";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // AI 对话逻辑
    const aiSubmit = document.getElementById('aiAssistantSubmit');
    if (aiSubmit) {
        aiSubmit.onclick = async () => {
            const input = document.getElementById('aiAssistantInput');
            const content = document.getElementById('aiAssistantContent');
            const msg = input.value.trim();
            if (!msg) return;

            content.innerHTML += `<div style="margin:10px 0; text-align:right;"><strong>您：</strong>${msg}</div>`;
            input.value = '';
            const loading = document.createElement('div');
            loading.innerText = "微光AI正在思考...";
            content.appendChild(loading);

            try {
                const res = await window.DreamAI.AI.chat(msg);
                loading.innerHTML = `<strong>微光AI：</strong>${res.reply}`;
            } catch (e) { loading.innerText = "连接失败。"; }
            content.scrollTop = content.scrollHeight;
        };
    }
});
