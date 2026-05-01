/**
 * 微光循迹 - 全局交互补丁 (完美还原版)
 */

// 1. 全局弹窗控制 (确保 HTML onclick 必能关掉)
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

// 2. 🚀 3D 加载逻辑
window.open3D = function(modelName) {
    const viewer = document.getElementById('modelViewer');
    const nameDisplay = document.getElementById('modelName');
    if (nameDisplay) nameDisplay.innerText = modelName;
    
    let path = '';
    if(modelName.includes('斯特林')) path = './models/stirling.glb';
    else if(modelName.includes('连杆')) path = './models/linkage.glb';
    else if(modelName.includes('机器人')) path = './models/robot.glb';

    if (viewer && path) {
        viewer.src = path;
        window.openModal('modelViewerModal');
    }
};

// 3. 数字跳动动画引擎
function startCounter(el) {
    if (el.dataset.done) return;
    const target = +el.dataset.target;
    let count = 0;
    const duration = 2000; 
    const step = target / (duration / 20);

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

// 4. 滚动观察器 (用于 100% 触发 Reveal 和 数字跳动)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(c => startCounter(c));
            if (entry.target.classList.contains('counter')) startCounter(entry.target);
        }
    });
}, { threshold: 0.1 });

// 5. 初始化与事件绑定
window.addEventListener('load', () => {
    // 监听所有需要浮现和跳动的元素
    document.querySelectorAll('.reveal, .counter').forEach(el => observer.observe(el));

    // 鼠标跟随光晕还原
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed; width:400px; height:400px; background:radial-gradient(circle, rgba(45,106,79,0.05) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition: opacity 0.3s;";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // AI 聊天逻辑 (联网版)
    const aiSubmit = document.getElementById('aiAssistantSubmit');
    if (aiSubmit) {
        aiSubmit.onclick = async () => {
            const input = document.getElementById('aiAssistantInput');
            const content = document.getElementById('aiAssistantContent');
            const msg = input.value.trim();
            if (!msg) return;

            const userDiv = document.createElement('div');
            userDiv.style.cssText = "margin: 10px 0; text-align: right; color: var(--primary-green);";
            userDiv.innerHTML = `<strong>您：</strong>${msg}`;
            content.appendChild(userDiv);
            input.value = '';

            const loading = document.createElement('div');
            loading.innerText = "微光AI正在思考...";
            content.appendChild(loading);

            try {
                const res = await window.DreamAI.AI.chat(msg);
                loading.innerHTML = `<strong>微光AI：</strong>${res.reply}`;
            } catch (e) {
                loading.innerText = "连接失败，请检查网络。";
            }
            content.scrollTop = content.scrollHeight;
        };
    }
});
