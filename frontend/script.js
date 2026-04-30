/**
 * 微光循迹 - 全局交互引擎
 */

// 1. 全局弹窗控制
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

// 2. 鼠标跟随光晕
const glow = document.createElement('div');
glow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition: opacity 0.3s;";
document.body.appendChild(glow);
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// 3. 数字跳动逻辑
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

// 4. 滚动揭幕监听
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
            loading.innerText = "正在思考...";
            content.appendChild(loading);

            try {
                const res = await window.DreamAI.AI.chat(msg);
                loading.innerHTML = `<strong>微光AI：</strong>${res.reply}`;
            } catch (e) { loading.innerText = "连接失败。"; }
            content.scrollTop = content.scrollHeight;
        };
    }

    // 3D 预览绑定
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const name = btn.closest('.portal-card') || btn.closest('.tool-card');
            const modelName = name.querySelector('h3').innerText;
            const modelViewer = document.getElementById('modelViewer');
            document.getElementById('modelName').innerText = modelName;
            
            let path = '';
            if(modelName.includes('斯特林')) path = './models/stirling.glb';
            else if(modelName.includes('连杆')) path = './models/linkage.glb';
            else if(modelName.includes('机器人')) path = './models/robot.glb';

            if(modelViewer && path) {
                modelViewer.src = path;
                window.openModal('modelViewerModal');
            }
        };
    });
});
