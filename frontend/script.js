// ==================== 1. 弹窗控制逻辑 ====================
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ==================== 2. 数字跳动核心逻辑 ====================
function startCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000; // 动画持续2秒
    const stepTime = 20;   // 每20毫秒更新一次
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            el.innerText = target.toLocaleString();
            clearInterval(timer);
        } else {
            el.innerText = Math.floor(current).toLocaleString();
        }
    }, stepTime);
}

// ==================== 3. 自动化观察器 (解决白屏与跳动问题) ====================
const observerOptions = {
    threshold: 0.1 // 只要元素露出 10% 就触发
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // 触发揭幕动画
            entry.target.classList.add('active');
            
            // 如果是计数器，且还没跳动过
            if (entry.target.classList.contains('counter') && !entry.target.dataset.done) {
                startCounter(entry.target);
                entry.target.dataset.done = "true";
            }
            
            // 处理包含计数器的容器
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(c => {
                if (!c.dataset.done) {
                    startCounter(c);
                    c.dataset.done = "true";
                }
            });
        }
    });
}, observerOptions);

// ==================== 4. AI 助手功能 (联网版) ====================
const aiSubmit = document.getElementById('aiAssistantSubmit');
const aiInput = document.getElementById('aiAssistantInput');
const aiContent = document.getElementById('aiAssistantContent');

if (aiSubmit) {
    aiSubmit.addEventListener('click', async () => {
        const question = aiInput.value.trim();
        if (!question) return;

        appendMsg('您', question, 'user');
        aiInput.value = '';
        const loadingDiv = appendMsg('AI助手', '正在思考中...', 'ai-loading');

        try {
            const data = await window.DreamAI.AI.chat(question);
            loadingDiv.remove();
            appendMsg('AI助手', data.reply, 'ai');
        } catch (error) {
            loadingDiv.innerText = "连接失败，请检查后端状态。";
        }
    });
}

function appendMsg(sender, text, type) {
    const div = document.createElement('div');
    div.className = `ai-message ${type}`;
    div.innerHTML = `<strong>${sender}：</strong>${text}`;
    if (aiContent) {
        aiContent.appendChild(div);
        aiContent.scrollTop = aiContent.scrollHeight;
    }
    return div;
}

// ==================== 5. 3D 模型预览逻辑 ====================
function initModelViewer() {
    const modelViewer = document.getElementById('modelViewer');
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const name = btn.closest('.tool-card').querySelector('h3').innerText;
            document.getElementById('modelName').innerText = name;
            
            let path = '';
            if(name.includes('斯特林')) path = './models/stirling.glb';
            else if(name.includes('连杆')) path = './models/linkage.glb';
            else if(name.includes('机器人')) path = './models/robot.glb';

            if(modelViewer && path) modelViewer.src = path;
            openModal('modelViewerModal');
        };
    });

    document.getElementById('modelViewerClose')?.addEventListener('click', () => {
        closeModal('modelViewerModal');
        if(modelViewer) modelViewer.src = '';
    });
}

// ==================== 6. 初始化启动 ====================
window.onload = () => {
    console.log("🚀 全功能初始化中...");

    // 绑定导航按钮
    document.getElementById('loginBtn')?.addEventListener('click', () => openModal('loginModal'));
    document.getElementById('registerBtn')?.addEventListener('click', () => openModal('registerModal'));

    initModelViewer();

    // 启动观察器：监视所有带 reveal 类的元素
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    // 启动观察器：监视所有带 counter 类的元素
    document.querySelectorAll('.counter').forEach(el => observer.observe(el));
};
