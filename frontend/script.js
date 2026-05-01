/**
 * 微光循迹 - 全局动态交互引擎 (全量还原 + 3D点击修复版)
 */

// ==================== 1. 全局弹窗控制 ====================
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        // AI 窗口特殊处理
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
        
        // 关闭 3D 弹窗时卸载模型，防止卡顿
        const viewer = document.getElementById('modelViewer');
        if (id === 'modelViewerModal' && viewer) {
            viewer.src = '';
        }
    }
};

// ==================== 2. 数字跳动动画 ====================
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

// ==================== 3. 核心：观察器 (监听滚动触发) ====================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // 触发内部数字跳动
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(c => startCounter(c));
            if (entry.target.classList.contains('counter')) startCounter(entry.target);
        }
    });
}, { threshold: 0.1 });

// ==================== 4. AI 助手逻辑 ====================
window.handleAIChat = async function() {
    const aiInput = document.getElementById('aiAssistantInput');
    const aiContent = document.getElementById('aiAssistantContent');
    if (!aiInput || !aiContent) return;
    
    const question = aiInput.value.trim();
    if (!question) return;

    // 添加用户消息
    const userDiv = document.createElement('div');
    userDiv.style.cssText = "margin: 10px 0; text-align: right; background: rgba(255, 159, 28, 0.1); padding: 10px; border-radius: 10px;";
    userDiv.innerHTML = `<strong>您：</strong>${question}`;
    aiContent.appendChild(userDiv);
    aiInput.value = '';

    // 添加思考提示
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = "margin: 10px 0; background: rgba(45, 106, 79, 0.05); padding: 10px; border-radius: 10px;";
    loadingDiv.innerHTML = `<strong>AI助手：</strong>正在思考中...`;
    aiContent.appendChild(loadingDiv);
    aiContent.scrollTop = aiContent.scrollHeight;

    try {
        const data = await window.DreamAI.AI.chat(question);
        loadingDiv.innerHTML = `<strong>AI助手：</strong>${data.reply}`;
    } catch (error) {
        loadingDiv.innerText = "暂时无法连接大脑，请检查网络。";
    }
    aiContent.scrollTop = aiContent.scrollHeight;
};

// ==================== 5. 初始化与事件绑定 ====================
window.addEventListener('load', () => {
    // 启动滚动揭幕监听
    document.querySelectorAll('.reveal, .counter').forEach(el => revealObserver.observe(el));

    // 鼠标跟随光晕
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed; width:400px; height:400px; background:radial-gradient(circle, rgba(45, 106, 79, 0.06) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition: opacity 0.3s;";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // 🚀 3D 预览按钮点击修复
    document.addEventListener('click', (e) => {
        // 兼容 a 标签和 button 标签
        const btn = e.target.closest('.tool-btn');
        if (btn) {
            e.preventDefault(); // 阻止 # 号跳转
            
            // 向上寻找父级卡片（兼容 tool-card 或 portal-card）
            const card = btn.closest('.tool-card') || btn.closest('.portal-card');
            const modelName = card.querySelector('h3').innerText.trim();
            const modelViewer = document.getElementById('modelViewer');
            const modelNameDisplay = document.getElementById('modelName');
            
            if (modelNameDisplay) modelNameDisplay.innerText = modelName;

            let path = '';
            // 路径匹配 logic
            if(modelName.includes('斯特林')) path = './models/stirling.glb';
            else if(modelName.includes('连杆')) path = './models/linkage.glb';
            else if(modelName.includes('机器人')) path = './models/robot.glb';

            if (modelViewer && path) {
                modelViewer.src = path;
                window.openModal('modelViewerModal');
            }
        }
    });

    // 磁性按钮效果还原
    document.querySelectorAll('.hero-btn, .magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
            btn.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0, 0) scale(1)`;
        });
    });

    // AI 发送绑定
    const aiSubmit = document.getElementById('aiAssistantSubmit');
    if (aiSubmit) aiSubmit.onclick = window.handleAIChat;
});
