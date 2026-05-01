/**
 * 微光循迹 - 全局交互引擎 (不改变布局修复版)
 */

// ==================== 1. 全局弹窗控制 (确保 HTML onclick 必能关掉) ====================
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        // 如果是AI窗口，确保它是显示状态
        if(id === 'aiAssistantWindow') modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 
    }
};

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        if(id === 'aiAssistantWindow') modal.style.display = 'none';
        document.body.style.overflow = 'auto'; 
        
        // 关闭 3D 弹窗时清空路径释放内存
        const viewer = document.getElementById('modelViewer');
        if (id === 'modelViewerModal' && viewer) {
            viewer.src = '';
        }
    }
};

// ==================== 2. 数字跳动动画逻辑 (修复 0 不跳动) ====================
function startCounter(el) {
    if (el.dataset.done) return;
    const target = +el.dataset.target;
    let count = 0;
    const duration = 2000; 
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

// ==================== 3. 核心：动态揭幕逻辑 (修复白屏) ====================
function reveal() {
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((element) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 100;
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add("active");
            // 如果内部有数字，顺便触发跳动
            const counters = element.querySelectorAll('.counter');
            counters.forEach(c => startCounter(c));
        }
    });
}

// ==================== 4. AI 助手逻辑 (联网版) ====================
window.handleAIChat = async function() {
    const aiInput = document.getElementById('aiAssistantInput');
    const aiContent = document.getElementById('aiAssistantContent');
    if (!aiInput || !aiContent) return;
    
    const question = aiInput.value.trim();
    if (!question) return;

    aiContent.innerHTML += `<div style="margin:10px 0; text-align:right;"><strong>您：</strong>${question}</div>`;
    aiInput.value = '';
    const loadingDiv = document.createElement('div');
    loadingDiv.innerText = "正在思考中...";
    aiContent.appendChild(loadingDiv);

    try {
        const data = await window.DreamAI.AI.chat(question);
        loadingDiv.innerHTML = `<strong>AI助手：</strong>${data.reply}`;
    } catch (error) {
        loadingDiv.innerText = "连接失败，请检查网络。";
    }
    aiContent.scrollTop = aiContent.scrollHeight;
};

// ==================== 5. 3D模型查看器逻辑 (修复路径) ====================
function initModelViewer() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const card = btn.closest('.portal-card') || btn.closest('.tool-card');
            const modelName = card.querySelector('h3').innerText.trim();
            const modelViewer = document.getElementById('modelViewer');
            const modelNameDisplay = document.getElementById('modelName');
            
            if (modelNameDisplay) modelNameDisplay.innerText = modelName;

            let path = '';
            if (modelName.includes('斯特林')) path = './models/stirling.glb';
            else if (modelName.includes('连杆')) path = './models/linkage.glb';
            else if (modelName.includes('机器人')) path = './models/robot.glb';

            if (modelViewer && path) {
                modelViewer.src = path;
                window.openModal('modelViewerModal');
            }
        };
    });
}

// ==================== 6. 初始化与事件绑定 ====================
window.addEventListener('scroll', reveal);

window.addEventListener('load', () => {
    // 强制执行一次揭幕，让首屏内容立刻显示
    reveal();
    
    // 初始化3D
    initModelViewer();

    // 绑定 AI 发送按钮
    const aiSubmit = document.getElementById('aiAssistantSubmit');
    if (aiSubmit) aiSubmit.onclick = window.handleAIChat;

    // 鼠标光晕
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed; width:400px; height:400px; background:radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition: opacity 0.3s;";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
});
