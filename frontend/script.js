// ==================== 1. 弹窗基础控制 ====================
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        // 如果是AI窗口，确保它是flex显示
        if(id === 'aiAssistantWindow') modal.style.display = 'flex';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        if(id === 'aiAssistantWindow') modal.style.display = 'none';
    }
}

// 绑定背景点击关闭
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('identity-modal')) {
        e.target.classList.remove('active');
    }
});

// ==================== 2. AI 助手功能 (核心修复) ====================
const aiAssistantSubmit = document.getElementById('aiAssistantSubmit');
const aiAssistantInput = document.getElementById('aiAssistantInput');
const aiAssistantContent = document.getElementById('aiAssistantContent');

if (aiAssistantSubmit) {
    aiAssistantSubmit.addEventListener('click', async () => {
        const question = aiAssistantInput.value.trim();
        if (!question) return;

        // 显示用户消息
        const userDiv = document.createElement('div');
        userDiv.className = 'ai-message';
        userDiv.style.background = 'rgba(255, 165, 0, 0.1)';
        userDiv.innerHTML = `<strong>您：</strong>${question}`;
        aiAssistantContent.appendChild(userDiv);
        aiAssistantInput.value = '';

        // 显示思考中
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'ai-message';
        loadingDiv.innerHTML = `<strong>AI助手：</strong>正在思考中...`;
        aiAssistantContent.appendChild(loadingDiv);
        aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;

        try {
            // 调用 api.js 里的真实接口
            const data = await window.DreamAI.AI.chat(question);
            loadingDiv.innerHTML = `<strong>AI助手：</strong>${data.reply}`;
        } catch (error) {
            loadingDiv.innerHTML = `<strong>AI助手：</strong>连接大脑失败，请检查网络。`;
        }
        aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;
    });
}

// ==================== 3. 页面动态效果 ====================
// 滚动揭幕
function reveal() {
    document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) {
            el.classList.add("active");
        }
    });
}
window.addEventListener("scroll", reveal);

// 鼠标光晕
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
cursorGlow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45,106,79,0.08) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%);";
document.body.appendChild(cursorGlow);
document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// ==================== 4. 初始化 ====================
window.addEventListener('load', () => {
    reveal();
    // 绑定AI按钮
    document.getElementById('aiAssistantBtn')?.addEventListener('click', () => openModal('aiAssistantWindow'));
    document.getElementById('aiConsult')?.addEventListener('click', () => openModal('aiAssistantWindow'));
});
