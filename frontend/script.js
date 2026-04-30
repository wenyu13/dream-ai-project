/**
 * 微光循迹 - 全局交互引擎 (修复数字跳动与弹窗关闭)
 */

// --- 1. 全局弹窗控制 (确保 HTML onclick 必能关掉) ---
window.openModal = function(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
};
window.closeModal = function(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('active');
        // 关闭 3D 弹窗时清空路径释放内存
        const viewer = document.getElementById('modelViewer');
        if (id === 'modelViewerModal' && viewer) viewer.src = '';
    }
};

// --- 2. 数字跳动动画逻辑 (修复数字不跳动的问题) ---
function startCounter(el) {
    if (el.dataset.done) return; // 防止重复跳动
    const target = +el.dataset.target;
    let count = 0;
    const duration = 2000; // 2秒跑完
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

// --- 3. 核心：观察器 (监听滚动，触发揭幕和数字跳动) ---
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // 元素进入视野，添加 active 类
            entry.target.classList.add('active');
            
            // 如果这个元素本身是 counter，或者内部包含 counter，则启动数字跳动
            if (entry.target.classList.contains('counter')) {
                startCounter(entry.target);
            }
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(c => startCounter(c));
        }
    });
}, { threshold: 0.1 });

// --- 4. 初始化与事件绑定 ---
document.addEventListener('DOMContentLoaded', () => {
    // 监听所有需要“揭幕”效果的元素
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    // 监听所有需要“跳动”的数字
    document.querySelectorAll('.counter').forEach(el => revealObserver.observe(el));

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
            } catch (e) { loading.innerText = "连接失败，请稍后刷新重试。"; }
            content.scrollTop = content.scrollHeight;
        };
    }

    // 3D 预览按钮绑定
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const card = btn.closest('.portal-card') || btn.closest('.tool-card');
            const name = card.querySelector('h3').innerText;
            const modelViewer = document.getElementById('modelViewer');
            const modelNameDisplay = document.getElementById('modelName');
            if (modelNameDisplay) modelNameDisplay.innerText = name;
            
            let path = '';
            if(name.includes('斯特林')) path = './models/stirling.glb';
            else if(name.includes('连杆')) path = './models/linkage.glb';
            else if(name.includes('机器人')) path = './models/robot.glb';

            if(modelViewer && path) {
                modelViewer.src = path;
                window.openModal('modelViewerModal');
            }
        };
    });

    // 鼠标跟随光晕
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition: opacity 0.3s;";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
});
