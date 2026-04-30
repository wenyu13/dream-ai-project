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

// ==================== 2. 数字跳动动画 (修复数据不跳动问题) ====================
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // 速度越小跳得越快

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 15);
            } else {
                counter.innerText = target.toLocaleString(); // 最终显示带千分位的数字
            }
        };
        updateCount();
    });
}

// ==================== 3. 页面动态揭幕逻辑 ====================
function reveal() {
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((element) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 100;

        if (elementTop < windowHeight - elementVisible) {
            element.classList.add("active");
            // 如果这个元素里包含数字计数器，且还没动过，就触发数字动画
            if (element.querySelector('.counter') && !element.classList.contains('counted')) {
                animateCounters();
                element.classList.add('counted');
            }
        }
    });
}

window.addEventListener("scroll", reveal);

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
            console.error("AI对话失败:", error);
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
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = btn.closest('.tool-card').querySelector('h3').innerText;
            const modelNameEl = document.getElementById('modelName');
            if (modelNameEl) modelNameEl.innerText = name;
            
            let path = '';
            if(name.includes('斯特林')) path = './models/stirling.glb';
            else if(name.includes('连杆')) path = './models/linkage.glb';
            else if(name.includes('机器人')) path = './models/robot.glb';

            if(modelViewer && path) modelViewer.src = path;
            openModal('modelViewerModal');
        });
    });

    document.getElementById('modelViewerClose')?.addEventListener('click', () => {
        closeModal('modelViewerModal');
        if(modelViewer) modelViewer.src = '';
    });
}

// ==================== 6. 初始化 ====================
window.addEventListener('load', () => {
    // 绑定导航按钮
    document.getElementById('loginBtn')?.addEventListener('click', () => openModal('loginModal'));
    document.getElementById('registerBtn')?.addEventListener('click', () => openModal('registerModal'));

    initModelViewer();
    
    // 立即执行一次 reveal
    setTimeout(() => {
        reveal();
        // 如果首屏没出来，强制激活首屏
        document.querySelectorAll('.reveal').forEach((el, i) => {
            if(i < 5) el.classList.add('active');
        });
    }, 300);
});
