/**
 * 微光循迹 - 全局动态交互引擎 (全量还原版)
 */

// ==================== 1. 全局弹窗控制 (确保 HTML onclick 必能关掉) ====================
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        // 如果是AI窗口，确保它是flex显示
        if(id === 'aiAssistantWindow') modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 锁定背景滚动
    }
};

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        if(id === 'aiAssistantWindow') modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 恢复背景滚动
        
        // 如果关闭的是 3D 弹窗，清空路径释放内存
        const viewer = document.getElementById('modelViewer');
        if (id === 'modelViewerModal' && viewer) {
            viewer.src = '';
        }
    }
};

// ==================== 2. 数字跳动动画逻辑 (修复数字不跳动) ====================
function startCounter(el) {
    if (el.dataset.done) return;
    const target = +el.dataset.target;
    let count = 0;
    const duration = 2000; // 2秒完成动画
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

// ==================== 3. 核心：观察器 (监听滚动触发揭幕和数字) ====================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // 触发揭幕动画
            entry.target.classList.add('active');
            
            // 如果元素内包含数字计数器
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(c => startCounter(c));
            
            // 如果元素本身就是计数器
            if (entry.target.classList.contains('counter')) {
                startCounter(entry.target);
            }
        }
    });
}, { threshold: 0.1 });

// ==================== 4. AI 助手功能 (联网版) ====================
window.handleAIChat = async function() {
    const aiInput = document.getElementById('aiAssistantInput');
    const aiContent = document.getElementById('aiAssistantContent');
    if (!aiInput || !aiContent) return;
    
    const question = aiInput.value.trim();
    if (!question) return;

    // 添加用户气泡
    const userDiv = document.createElement('div');
    userDiv.className = 'ai-message user-msg';
    userDiv.style.margin = "10px 0";
    userDiv.style.textAlign = "right";
    userDiv.innerHTML = `<strong>您：</strong>${question}`;
    aiContent.appendChild(userDiv);
    aiInput.value = '';

    // 添加思考中提示
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'ai-message loading-msg';
    loadingDiv.innerHTML = `<strong>AI助手：</strong>正在思考中...`;
    aiContent.appendChild(loadingDiv);
    aiContent.scrollTop = aiContent.scrollHeight;

    try {
        const data = await window.DreamAI.AI.chat(question);
        loadingDiv.innerHTML = `<strong>AI助手：</strong>${data.reply}`;
    } catch (error) {
        loadingDiv.innerText = "连接失败，请稍后刷新重试。";
    }
    aiContent.scrollTop = aiContent.scrollHeight;
};

// ==================== 5. 初始化与事件绑定 ====================
window.addEventListener('load', () => {
    // 1. 启动滚动揭幕监听
    document.querySelectorAll('.reveal, .counter').forEach(el => revealObserver.observe(el));

    // 2. 鼠标跟随光晕
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.style.cssText = `
        position: fixed;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(45, 106, 79, 0.05) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s;
    `;
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // 3. 3D 预览按钮逻辑 (对应全小写文件名)
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const card = btn.closest('.portal-card') || btn.closest('.tool-card');
            const modelName = card.querySelector('h3').innerText;
            const modelViewer = document.getElementById('modelViewer');
            const modelNameDisplay = document.getElementById('modelName');
            
            if (modelNameDisplay) modelNameDisplay.innerText = modelName;

            let path = '';
            if(modelName.includes('斯特林')) path = './models/stirling.glb';
            else if(modelName.includes('连杆')) path = './models/linkage.glb';
            else if(modelName.includes('机器人')) path = './models/robot.glb';

            if (modelViewer && path) {
                modelViewer.src = path;
                window.openModal('modelViewerModal');
            }
        };
    });

    // 4. 磁性按钮效果
    document.querySelectorAll('.hero-btn, .portal-btn').forEach(btn => {
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

    // 5. 绑定 AI 提交按钮
    const aiSubmit = document.getElementById('aiAssistantSubmit');
    if (aiSubmit) aiSubmit.onclick = window.handleAIChat;
    
    // 支持 Enter 发送 AI 消息
    document.getElementById('aiAssistantInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.handleAIChat();
    });
});

console.log("✅ 动态交互引擎(含数字跳动)已就绪");
