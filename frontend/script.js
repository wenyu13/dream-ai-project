/**
 * 微光循迹 - 全局交互补丁
 */

// 1. 3D 预览核心逻辑
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

// 2. 滚动揭幕与数字跳动
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(c => {
                const target = +c.dataset.target;
                let count = 0;
                const update = () => {
                    count += target / 40;
                    if (count < target) { c.innerText = Math.ceil(count); setTimeout(update, 20); }
                    else c.innerText = target.toLocaleString();
                };
                if (!c.dataset.done) { update(); c.dataset.done = "true"; }
            });
        }
    });
}, { threshold: 0.1 });

// 3. AI 对话 (接入后端)
async function handleAIChat() {
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
    } catch (e) { loading.innerText = "连接失败，请重试。"; }
    content.scrollTop = content.scrollHeight;
}

// 4. 启动绑定
window.addEventListener('load', () => {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    const aiBtn = document.getElementById('aiAssistantSubmit');
    if (aiBtn) aiBtn.onclick = handleAIChat;

    // 鼠标跟随光晕
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition: opacity 0.3s;";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
});
