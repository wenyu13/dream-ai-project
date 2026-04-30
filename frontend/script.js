/**
 * 微光循迹 - 核心交互脚本 (完整还原版)
 */

// 1. 弹窗控制
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
};
window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
};

// 2. 滚动揭幕逻辑
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // 如果内部有计数器，触发计数
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(c => animateCounter(c));
        }
    });
}, { threshold: 0.1 });

// 3. 数字跳动动画
function animateCounter(el) {
    if (el.dataset.done) return;
    const target = +el.dataset.target;
    let count = 0;
    const update = () => {
        count += target / 50;
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

// 4. AI 助手功能
document.addEventListener('DOMContentLoaded', () => {
    const aiSubmit = document.getElementById('aiAssistantSubmit');
    const aiInput = document.getElementById('aiAssistantInput');
    const aiContent = document.getElementById('aiAssistantContent');

    if (aiSubmit) {
        aiSubmit.addEventListener('click', async () => {
            const question = aiInput.value.trim();
            if (!question) return;

            const userDiv = document.createElement('div');
            userDiv.style.margin = "10px 0";
            userDiv.innerHTML = `<strong>您：</strong>${question}`;
            aiContent.appendChild(userDiv);
            aiInput.value = '';

            const loadingDiv = document.createElement('div');
            loadingDiv.innerHTML = `<strong>AI助手：</strong>正在思考中...`;
            aiContent.appendChild(loadingDiv);
            aiContent.scrollTop = aiContent.scrollHeight;

            try {
                const data = await window.DreamAI.AI.chat(question);
                loadingDiv.innerHTML = `<strong>AI助手：</strong>${data.reply}`;
            } catch (error) {
                loadingDiv.innerHTML = `<strong>AI助手：</strong>连接失败，请检查网络。`;
            }
            aiContent.scrollTop = aiContent.scrollHeight;
        });
    }

    // 初始化观察器
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 鼠标光晕
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed; width:400px; height:400px; background:radial-gradient(circle, rgba(45,106,79,0.05) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%);";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
    
    // 3D模型预览按钮绑定
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
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
