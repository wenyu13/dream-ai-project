/**
 * 微光循迹 - 全局交互引擎 (最稳健指令版)
 */

// 1. 全局弹窗控制 (确保 HTML 里的 onclick 必能关掉)
window.openModal = function(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
};
window.closeModal = function(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('active');
        const viewer = document.getElementById('modelViewer');
        if (id === 'modelViewerModal' && viewer) viewer.src = ''; // 关闭时清空，防止下次加载冲突
    }
};

// 2. 🚀 3D 加载核心指令 (直接由 HTML 触发，不依赖监听器)
window.loadAndShow3D = function(modelName) {
    const modelViewer = document.getElementById('modelViewer');
    const modelNameDisplay = document.getElementById('modelName');
    
    if (modelNameDisplay) modelNameDisplay.innerText = modelName;

    let path = '';
    // 路径匹配 logic - 使用你上传的全小写文件名
    if(modelName.includes('斯特林')) path = './models/stirling.glb';
    else if(modelName.includes('连杆')) path = './models/linkage.glb';
    else if(modelName.includes('机器人')) path = './models/robot.glb';

    if (modelViewer && path) {
        modelViewer.src = path;
        window.openModal('modelViewerModal');
    }
};

// 3. 数字跳动动画逻辑
function startCounter(el) {
    if (el.dataset.done) return;
    const target = +el.dataset.target;
    let count = 0;
    const update = () => {
        count += target / 40;
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

// 4. 滚动观察器 (用于揭幕和数字)
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
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // AI 助手逻辑 (联网版)
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
            } catch (e) {
                loading.innerText = "连接失败，请重试。";
            }
            content.scrollTop = content.scrollHeight;
        };
    }

    // 鼠标光晕
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition: opacity 0.3s;";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
});
