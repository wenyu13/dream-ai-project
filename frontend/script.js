/**
 * 微光循迹 - 全局动态交互引擎 (最终兼容版)
 */

// ==================== 1. 全局弹窗控制 (确保 HTML 里的 onclick 能点动) ====================
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }
};

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; 
        
        // 如果是关闭 3D 弹窗，清空模型以释放内存
        const viewer = modal.querySelector('model-viewer');
        if (viewer) {
            viewer.src = '';
        }
    }
};

// ==================== 2. AI 助手功能 (联网版) ====================
window.handleAIChat = async function() {
    const aiInput = document.getElementById('aiAssistantInput');
    const aiContent = document.getElementById('aiAssistantContent');
    if (!aiInput || !aiContent) return;
    
    const question = aiInput.value.trim();
    if (!question) return;

    // 显示用户气泡
    const userDiv = document.createElement('div');
    userDiv.style.margin = "10px 0";
    userDiv.style.textAlign = "right";
    userDiv.innerHTML = `<strong>您：</strong>${question}`;
    aiContent.appendChild(userDiv);
    aiInput.value = '';

    // 显示思考中
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = `<strong>AI助手：</strong>正在思考中...`;
    aiContent.appendChild(loadingDiv);
    aiContent.scrollTop = aiContent.scrollHeight;

    try {
        const data = await window.DreamAI.AI.chat(question);
        loadingDiv.innerHTML = `<strong>AI助手：</strong>${data.reply}`;
    } catch (error) {
        loadingDiv.innerText = "连接失败，请检查后端状态。";
    }
    aiContent.scrollTop = aiContent.scrollHeight;
};

// ==================== 3. 核心动态效果 (Reveal & Counter) ====================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // 处理内部数字跳动
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(c => animateCounter(c));
        }
    });
}, { threshold: 0.1 });

function animateCounter(el) {
    if (el.dataset.done) return;
    const target = +el.dataset.target;
    let count = 0;
    const update = () => {
        const inc = target / 50;
        if (count < target) {
            count += inc;
            el.innerText = Math.ceil(count).toLocaleString();
            setTimeout(update, 20);
        } else {
            el.innerText = target.toLocaleString();
            el.dataset.done = "true";
        }
    };
    update();
}

// ==================== 4. 初始化与事件绑定 ====================
window.addEventListener('load', () => {
    // 监听所有揭幕元素
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // 鼠标跟随光晕
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%);";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // 3D 预览按钮路径匹配 (对应你在 GitHub 上传的真实文件名)
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const card = btn.closest('.portal-card') || btn.closest('.tool-card');
            const modelName = card.querySelector('h3').innerText;
            const modelViewer = document.getElementById('modelViewer');
            const modelNameDisplay = document.getElementById('modelName');
            
            if (modelNameDisplay) modelNameDisplay.innerText = modelName;

            let path = '';
            // 这里对应你文件夹里的全小写文件名
            if (modelName.includes('斯特林')) path = './models/stirling.glb';
            else if (modelName.includes('连杆')) path = './models/linkage.glb';
            else if (modelName.includes('机器人')) path = './models/robot.glb';

            if (modelViewer && path) {
                modelViewer.src = path;
                window.openModal('modelViewerModal');
            }
        };
    });

    // AI 按钮绑定
    const aiSubmit = document.getElementById('aiAssistantSubmit');
    if (aiSubmit) aiSubmit.onclick = window.handleAIChat;
});
