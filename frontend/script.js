/**
 * 微光循迹 - 全局动态交互引擎 (全量还原版)
 */

// 1. 弹窗控制
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

// 3. 滚动揭幕逻辑
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(c => {
                if(!c.dataset.done) startCounter(c);
            });
        }
    });
}, { threshold: 0.1 });

// 4. 数字计数动画
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

// 5. 初始化与事件绑定
document.addEventListener('DOMContentLoaded', () => {
    // 监听所有揭幕元素
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // AI 助手提交
    const aiSubmit = document.getElementById('aiAssistantSubmit');
    if (aiSubmit) {
        aiSubmit.onclick = async () => {
            const aiInput = document.getElementById('aiAssistantInput');
            const aiContent = document.getElementById('aiAssistantContent');
            const msg = aiInput.value.trim();
            if (!msg) return;

            const userDiv = document.createElement('div');
            userDiv.style.margin = "10px 0";
            userDiv.innerHTML = `<strong>您：</strong>${msg}`;
            aiContent.appendChild(userDiv);
            aiInput.value = '';

            const loading = document.createElement('div');
            loading.innerText = "正在思考...";
            aiContent.appendChild(loading);

            try {
                const res = await window.DreamAI.AI.chat(msg);
                loading.innerHTML = `<strong>微光AI：</strong>${res.reply}`;
            } catch (e) {
                loading.innerText = "连接失败，请稍后刷新重试。";
            }
            aiContent.scrollTop = aiContent.scrollHeight;
        };
    }

    // 3D 模型预览按钮绑定 (这里匹配你 GitHub 里的真实文件名)
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const name = btn.closest('.portal-card').querySelector('h3').innerText;
            const modelViewer = document.getElementById('modelViewer');
            document.getElementById('modelName').innerText = name;
            
            // 🚀 这里精确匹配你的文件名
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
});
