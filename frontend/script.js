/**
 * 微光循迹 - 全局逻辑修复脚本
 * 100% 保留原有布局，仅修复变量冲突与弹窗失效
 */

// ==================== 1. 全局弹窗控制 (确保 HTML onclick 必能点动) ====================
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        // 特殊处理 AI 窗口，因为 HTML 里写了 display:none
        if (id === 'aiAssistantWindow') {
            modal.style.display = 'flex';
        }
        document.body.style.overflow = 'hidden'; // 弹窗时禁止背景滚动
    }
};

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        if (id === 'aiAssistantWindow') {
            modal.style.display = 'none';
        }
        document.body.style.overflow = 'auto'; // 恢复滚动
        
        // 关闭 3D 预览时清空模型，释放内存
        const viewer = modal.querySelector('model-viewer');
        if (viewer) viewer.src = '';
    }
};

// ==================== 2. AI 助手逻辑 (接入 DeepSeek) ====================
window.handleAIChat = async function() {
    const aiInput = document.getElementById('aiAssistantInput');
    const aiContent = document.getElementById('aiAssistantContent');
    if (!aiInput || !aiContent) return;
    
    const question = aiInput.value.trim();
    if (!question) return;

    // 显示用户消息
    const userDiv = document.createElement('div');
    userDiv.className = 'ai-message';
    userDiv.style.background = 'rgba(255, 165, 0, 0.1)';
    userDiv.style.marginLeft = '20px';
    userDiv.innerHTML = `<strong>您：</strong>${question}`;
    aiContent.appendChild(userDiv);
    aiInput.value = '';

    // 显示思考状态
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'ai-message loading';
    loadingDiv.innerHTML = '<strong>AI助手：</strong>正在思考中...';
    aiContent.appendChild(loadingDiv);
    aiContent.scrollTop = aiContent.scrollHeight;

    try {
        // 调用 api.js 中的后端接口
        const data = await window.DreamAI.AI.chat(question);
        loadingDiv.innerHTML = `<strong>AI助手：</strong>${data.reply}`;
    } catch (error) {
        loadingDiv.innerHTML = `<strong>AI助手：</strong>抱歉，大脑连接失败，请检查网络。`;
    }
    aiContent.scrollTop = aiContent.scrollHeight;
};

// ==================== 3. 动态交互引擎 (Reveal & Counter) ====================

// 滚动揭幕逻辑
function reveal() {
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((element) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) {
            element.classList.add("active");
        }
    });
}

// 观察器：处理数字跳动
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            let start = 0;
            const step = target / 50;
            const timer = setInterval(() => {
                start += step;
                if (start >= target) {
                    el.textContent = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    el.textContent = Math.floor(start).toLocaleString();
                }
            }, 20);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

// ==================== 4. 初始化绑定 ====================

window.addEventListener('load', () => {
    // 1. 初始化揭幕
    reveal();
    window.addEventListener("scroll", reveal);

    // 2. 绑定数字统计
    document.querySelectorAll('.counter').forEach(c => counterObserver.observe(c));

    // 3. 绑定 3D 模型预览
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const card = btn.closest('.tool-card');
            const modelName = card.querySelector('h3').textContent.trim();
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

    // 4. 绑定 AI 提交
    const aiSubmit = document.getElementById('aiAssistantSubmit');
    if (aiSubmit) aiSubmit.onclick = window.handleAIChat;

    // 5. 鼠标光晕效果
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45, 106, 79, 0.08) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition: opacity 0.3s ease; mix-blend-mode: multiply;";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
});

console.log("✅ 脚本已修复：逻辑已注入，布局未改动");
