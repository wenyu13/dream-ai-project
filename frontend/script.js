/**
 * 微光循迹 - 全局交互引擎 (逻辑修复版)
 * 100% 保留原有布局，仅修复变量冲突与功能失效
 */

// ==================== 1. 全局弹窗控制函数 ====================
// 必须定义为 window 属性，确保 HTML 中的 onclick 能找到它们
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        // 如果是 AI 窗口，强制修改其 display 属性
        if (id === 'aiAssistantWindow') {
            modal.style.display = 'flex';
        }
        document.body.style.overflow = 'hidden'; 
    }
};

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        if (id === 'aiAssistantWindow') {
            modal.style.display = 'none';
        }
        document.body.style.overflow = 'auto'; 
        // 关闭 3D 弹窗时清空路径释放内存
        const viewer = modal.querySelector('model-viewer');
        if (viewer) viewer.src = '';
    }
};

// ==================== 2. UI 特效逻辑 ====================

// 滚动揭幕
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
window.addEventListener("scroll", reveal);

// 鼠标跟随光晕
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
cursorGlow.style.cssText = `
    position: fixed; width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(45, 106, 79, 0.08) 0%, transparent 70%);
    border-radius: 50%; pointer-events: none; z-index: 9999;
    transform: translate(-50%, -50%); transition: opacity 0.3s ease; mix-blend-mode: multiply;
`;
document.body.appendChild(cursorGlow);

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// 数字计数动画
function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    let start = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString();
        }
    }, 20);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// ==================== 3. 核心功能绑定 ====================

document.addEventListener('DOMContentLoaded', () => {
    // 监听计数器
    document.querySelectorAll('.counter').forEach(c => counterObserver.observe(c));

    // 绑定导航栏登录/注册
    document.getElementById('loginBtn')?.addEventListener('click', () => window.openModal('loginModal'));
    document.getElementById('registerBtn')?.addEventListener('click', () => window.openModal('registerModal'));

    // 绑定立即申请按钮
    document.querySelectorAll('.job-apply-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.openModal('applyModal');
        });
    });

    // 绑定 3D 模型预览
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
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
        });
    });

    // 磁性按钮
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
            btn.style.transform = `translate(${x}px, ${y}px)`;
        });
        btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0, 0)');
    });

    // AI 助手逻辑
    const aiAssistantSubmit = document.getElementById('aiAssistantSubmit');
    const aiAssistantInput = document.getElementById('aiAssistantInput');
    const aiAssistantContent = document.getElementById('aiAssistantContent');

    if (aiAssistantSubmit) {
        aiAssistantSubmit.onclick = async () => {
            const question = aiAssistantInput.value.trim();
            if (!question) return;

            // 用户气泡
            const userDiv = document.createElement('div');
            userDiv.className = 'ai-message';
            userDiv.style.background = 'rgba(255, 165, 0, 0.1)';
            userDiv.innerHTML = `<strong>您：</strong>${question}`;
            aiAssistantContent.appendChild(userDiv);
            aiAssistantInput.value = '';

            // AI 思考中
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'ai-message';
            loadingDiv.innerHTML = `<strong>AI助手：</strong>正在思考中...`;
            aiAssistantContent.appendChild(loadingDiv);
            aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;

            try {
                const data = await window.DreamAI.AI.chat(question);
                loadingDiv.innerHTML = `<strong>AI助手：</strong>${data.reply}`;
            } catch (error) {
                loadingDiv.innerHTML = `<strong>AI助手：</strong>连接失败，请检查后端状态。`;
            }
            aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;
        };
    }

    reveal(); // 初始检查
});

// 添加必要的 Toast 样式补丁 (仅在 JS 中运行一次)
const stylePatch = document.createElement('style');
stylePatch.textContent = `
    .ai-message.ai { background: rgba(45, 106, 79, 0.05); }
    .ai-message.user { background: rgba(255, 165, 0, 0.1); }
`;
document.head.appendChild(stylePatch);
