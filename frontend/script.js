// ==================== 1. 基础 UI 交互 (导航 & 菜单) ====================

// 导航栏滚动变色 (Glass Nav)
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// 下拉菜单点击切换功能 (合并了重复逻辑)
const dropdown = document.querySelector('.dropdown');
const dropdownToggle = document.querySelector('.dropdown-toggle');

if (dropdown && dropdownToggle) {
    dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

// 身份切换菜单按钮 (三点图标)
const menuDots = document.querySelector('.menu-dots');
if (menuDots) {
    menuDots.addEventListener('click', (e) => {
        e.stopPropagation();
        // 这里可以决定是否点击三个点直接打开菜单，或者只是停止冒泡
    });
}

// ==================== 2. 身份切换模态窗口 ====================
const identityModal = document.getElementById('identityModal');
const modalClose = document.getElementById('modalClose');
const switchIdentityBtn = document.getElementById('switchIdentity');

if (switchIdentityBtn && identityModal) {
    switchIdentityBtn.addEventListener('click', (e) => {
        e.preventDefault();
        identityModal.classList.add('active');
    });
}

if (modalClose && identityModal) {
    modalClose.addEventListener('click', () => {
        identityModal.classList.remove('active');
    });
}

// 点击外部关闭
window.addEventListener('click', (e) => {
    if (e.target === identityModal) {
        identityModal.classList.remove('active');
    }
});

// 身份跳转
const identityButtons = document.querySelectorAll('.identity-btn');
identityButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const identity = btn.dataset.identity;
        identityModal.classList.remove('active');
        
        const pageMap = {
            'student': 'learning.html',
            'teacher': 'teacher.html',
            'volunteer': 'volunteer.html',
            'admin': 'admin.html'
        };
        if (pageMap[identity]) window.location.href = pageMap[identity];
    });
});

// ==================== 3. 3D 模型查看器修复 ====================
const modelViewerModal = document.getElementById('modelViewerModal');
const modelViewer = document.getElementById('modelViewer');
const modelViewerClose = document.getElementById('modelViewerClose');
const modelNameDisplay = document.getElementById('modelName');

// 修复文件名映射：确保与你提供的 models/ 文件夹内文件名完全一致
document.querySelectorAll('.tool-card .tool-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('.tool-card');
        const title = card.querySelector('h3').textContent;
        
        let modelFile = '';
        if (title.includes('斯特林')) modelFile = 'stirling.glb';
        else if (title.includes('四连杆')) modelFile = 'linkage.glb';
        else if (title.includes('机器人')) modelFile = 'robot.glb';

        if (modelViewer && modelFile) {
            console.log('正在加载模型:', modelFile);
            modelViewer.src = `./models/${modelFile}`;
            if (modelNameDisplay) modelNameDisplay.textContent = title;
            modelViewerModal.classList.add('active');
        }
    });
});

if (modelViewerClose) {
    modelViewerClose.addEventListener('click', () => {
        modelViewerModal.classList.remove('active');
        modelViewer.src = ''; // 关闭时清空模型释放内存
    });
}

// ==================== 4. AI 助手功能修复 (调用真实 API) ====================
const aiAssistantBtn = document.getElementById('aiAssistantBtn');
const aiAssistantWindow = document.getElementById('aiAssistantWindow');
const aiAssistantClose = document.getElementById('aiAssistantClose');
const aiAssistantInput = document.getElementById('aiAssistantInput');
const aiAssistantSubmit = document.getElementById('aiAssistantSubmit');
const aiAssistantContent = document.getElementById('aiAssistantContent');

// 开关窗口逻辑
if (aiAssistantBtn && aiAssistantWindow) {
    aiAssistantBtn.addEventListener('click', () => aiAssistantWindow.classList.add('active'));
}
const aiConsult = document.getElementById('aiConsult');
if (aiConsult && aiAssistantWindow) {
    aiConsult.addEventListener('click', () => aiAssistantWindow.classList.add('active'));
}
if (aiAssistantClose) {
    aiAssistantClose.addEventListener('click', () => aiAssistantWindow.classList.remove('active'));
}

// 提交提问逻辑
if (aiAssistantSubmit) {
    aiAssistantSubmit.addEventListener('click', async () => {
        const question = aiAssistantInput.value.trim();
        if (!question) return;

        // 显示用户消息
        const userMsg = document.createElement('div');
        userMsg.className = 'ai-message';
        userMsg.style.cssText = 'background: rgba(255, 165, 0, 0.1); border-left: 3px solid var(--accent-orange); margin-left: 20px;';
        userMsg.innerHTML = `<strong>您：</strong>${question}`;
        aiAssistantContent.appendChild(userMsg);
        
        aiAssistantInput.value = '';
        aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;

        // 创建临时等待回复
        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-message loading';
        aiMsg.innerHTML = `<strong>AI助手：</strong><span class="loading-dots">思考中</span>`;
        aiAssistantContent.appendChild(aiMsg);

        try {
            // 调用 api.js 中的真实接口
            if (window.DreamAI && window.DreamAI.AI) {
                const res = await window.DreamAI.AI.chat(question);
                aiMsg.classList.remove('loading');
                aiMsg.innerHTML = `<strong>AI助手：</strong>${res.reply || res.message || '我收到你的消息了。'}`;
            } else {
                throw new Error('API Object missing');
            }
        } catch (error) {
            aiMsg.innerHTML = `<strong>AI助手：</strong>抱歉，我的大脑连接似乎出了点小问题，请稍后再试。`;
            console.error('AI提问出错:', error);
        }
        aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;
    });

    aiAssistantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') aiAssistantSubmit.click();
    });
}

// ==================== 5. 视觉特效 (鼠标光晕 & 页面过渡) ====================

// 鼠标跟随光晕
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
document.body.appendChild(cursorGlow);

let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursorGlow() {
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateCursorGlow);
}
animateCursorGlow();

// 页面平滑过渡
const pageTransition = document.getElementById('pageTransition');
document.querySelectorAll('.page-transition').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetUrl = link.getAttribute('href');
        if (pageTransition) {
            pageTransition.classList.add('active');
            setTimeout(() => window.location.href = targetUrl, 600);
        }
    });
});

console.log("✅ script.js 已优化并修复 Bug");
