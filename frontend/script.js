/**
 * 微光循迹 - 全局交互引擎 (修复数字跳动 & 弹窗关闭)
 */

// 1. 全局弹窗控制 (确保 HTML onclick 必能关掉)
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

// 2. 数字跳动动画逻辑 (解决你跳不动的问题)
function startCounter(el) {
    if (el.dataset.done) return;
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

// 3. 滚动揭幕与观察器
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // 触发揭幕动画
            entry.target.classList.add('active');
            // 如果滚动到统计区，触发数字跳动
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(c => startCounter(c));
        }
    });
}, { threshold: 0.1 });

// 4. 初始化与事件绑定
window.addEventListener('load', () => {
    // 监听所有 reveal 元素
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 鼠标跟随光晕
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition: opacity 0.3s;";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });

    // 3D 预览按钮路径匹配
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

    // AI 聊天逻辑
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
            } catch (e) { loading.innerText = "连接失败，请检查网络。"; }
            content.scrollTop = content.scrollHeight;
        };
    }
});
