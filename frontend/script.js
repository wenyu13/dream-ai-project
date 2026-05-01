/**
 * 微光循迹 - 全局交互引擎
 */

// 1. 全局弹窗逻辑 (解决红叉关不掉的问题)
window.openModal = function(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
};
window.closeModal = function(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('active');
        const viewer = document.getElementById('modelViewer');
        if (id === 'modelViewerModal' && viewer) viewer.src = '';
    }
};

// 2. 数字跳动动画 (解决 0 不动的问题)
function startCounter(el) {
    if (el.dataset.done) return;
    const target = +el.dataset.target;
    let count = 0;
    const step = target / 50;
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

// 3. 滚动观察器 (用于揭幕动画和数字触发)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // 如果容器内有数字，触发跳动
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(c => startCounter(c));
        }
    });
}, { threshold: 0.1 });

// 4. 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 监听所有需要浮现的元素
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 鼠标光晕
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%);";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // 3D 预览逻辑 (在不改动你 HTML 的基础上寻找你的按钮)
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const card = btn.closest('.portal-card');
            const name = card.querySelector('h3').innerText;
            const modelViewer = document.getElementById('modelViewer');
            document.getElementById('modelName').innerText = name;
            
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

    // AI 聊天逻辑 (联网版)
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
                loading.innerText = "连接失败，请检查网络。";
            }
            content.scrollTop = content.scrollHeight;
        };
    }
});
