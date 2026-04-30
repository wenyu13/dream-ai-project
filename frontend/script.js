/**
 * 微光循迹 - 全局动态交互引擎
 */

// 1. 弹窗控制 (设为全局，让 HTML 的 onclick 能找到)
window.openModal = function(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
};
window.closeModal = function(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
};

// 2. 鼠标跟随光晕
const glow = document.createElement('div');
glow.style.cssText = "position:fixed; width:400px; height:400px; background:radial-gradient(circle, rgba(45,106,79,0.05) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%);";
document.body.appendChild(glow);
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// 3. 滚动揭幕 (Reveal)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // 如果内部有数字计数器，启动计数
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(c => {
                if(!c.dataset.done) startCounter(c);
            });
        }
    });
}, { threshold: 0.1 });

// 4. 数字跳动逻辑
function startCounter(el) {
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

// 5. AI 聊天逻辑 (联网版)
document.addEventListener('DOMContentLoaded', () => {
    const aiSubmit = document.getElementById('aiAssistantSubmit');
    const aiInput = document.getElementById('aiAssistantInput');
    const aiContent = document.getElementById('aiAssistantContent');

    if (aiSubmit) {
        aiSubmit.onclick = async () => {
            const msg = aiInput.value.trim();
            if (!msg) return;
            
            const userDiv = document.createElement('div');
            userDiv.innerHTML = `<strong>您：</strong>${msg}`;
            userDiv.style.margin = "10px 0";
            aiContent.appendChild(userDiv);
            aiInput.value = '';

            const loading = document.createElement('div');
            loading.innerText = "AI正在思考...";
            aiContent.appendChild(loading);
            aiContent.scrollTop = aiContent.scrollHeight;

            try {
                const res = await window.DreamAI.AI.chat(msg);
                loading.innerHTML = `<strong>微光AI：</strong>${res.reply}`;
            } catch (e) {
                loading.innerText = "连接失败，请刷新。";
            }
            aiContent.scrollTop = aiContent.scrollHeight;
        };
    }

    // 绑定所有的动态观察器
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 3D模型按钮绑定
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = (e) => {
            const name = btn.closest('.portal-card').querySelector('h3').innerText;
            const modelViewer = document.getElementById('modelViewer');
            document.getElementById('modelName').innerText = name;
            let path = name.includes('斯特林') ? './models/stirling.glb' : 
                       name.includes('连杆') ? './models/linkage.glb' : './models/robot.glb';
            if(modelViewer) modelViewer.src = path;
            window.openModal('modelViewerModal');
        };
    });
});
