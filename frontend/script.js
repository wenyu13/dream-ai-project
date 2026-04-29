// ==================== 1. 弹窗控制 (解决取消不了的问题) ====================
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

// 绑定导航栏初始按钮
document.getElementById('loginBtn')?.addEventListener('click', () => openModal('loginModal'));
document.getElementById('registerBtn')?.addEventListener('click', () => openModal('registerModal'));
document.getElementById('switchIdentity')?.addEventListener('click', () => openModal('identityModal'));

// 点击背景关闭弹窗
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('identity-modal')) {
        e.target.classList.remove('active');
    }
});

// ==================== 2. AI 助手功能 (联网版) ====================
const aiAssistantSubmit = document.getElementById('aiAssistantSubmit');
const aiAssistantInput = document.getElementById('aiAssistantInput');
const aiAssistantContent = document.getElementById('aiAssistantContent');

if (aiAssistantSubmit) {
    aiAssistantSubmit.addEventListener('click', async () => {
        const question = aiAssistantInput.value.trim();
        if (!question) return;

        // 添加用户消息
        appendChatMessage('您', question, 'user');
        aiAssistantInput.value = '';

        // 显示思考中
        const loadingDiv = appendChatMessage('AI助手', '正在思考中...', 'ai-loading');

        try {
            const data = await window.DreamAI.AI.chat(question);
            loadingDiv.remove();
            appendChatMessage('AI助手', data.reply, 'ai');
        } catch (error) {
            loadingDiv.innerText = "抱歉，大脑连接出了一点小问题。";
        }
    });
}

function appendChatMessage(sender, text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-message ${type}`;
    msgDiv.innerHTML = `<strong>${sender}：</strong>${text}`;
    aiAssistantContent.appendChild(msgDiv);
    aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;
    return msgDiv;
}

// ==================== 3. 3D 模型预览逻辑 ====================
function initModelViewer() {
    const modal = document.getElementById('modelViewerModal');
    const modelViewer = document.getElementById('modelViewer');
    const modelNameEl = document.getElementById('modelName');

    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = btn.closest('.tool-card').querySelector('h3').innerText;
            modelNameEl.innerText = name;
            
            let path = '';
            if(name.includes('斯特林')) path = './models/stirling.glb';
            if(name.includes('连杆')) path = './models/linkage.glb';
            if(name.includes('机器人')) path = './models/robot.glb';

            if(modelViewer) modelViewer.src = path;
            openModal('modelViewerModal');
        });
    });

    document.getElementById('modelViewerClose')?.addEventListener('click', () => {
        closeModal('modelViewerModal');
        if(modelViewer) modelViewer.src = '';
    });
}

// ==================== 4. 其他 UI 效果 ====================
window.addEventListener('load', () => {
    initModelViewer();
    // 自动触发一次揭幕效果
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach(el => el.classList.add("active"));
});

// 简单的导航栏滚动效果
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
});

console.log('✅ UI 交互模块已加载');
