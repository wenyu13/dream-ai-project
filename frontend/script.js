// ==================== 1. 弹窗控制 ====================
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

// ==================== 2. AI 助手功能 (联网版) ====================
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
    aiContent.appendChild(div);
    aiContent.scrollTop = aiContent.scrollHeight;
    return div;
}

// ==================== 3. 3D 模型预览逻辑 ====================
window.addEventListener('load', () => {
    const modelViewer = document.getElementById('modelViewer');
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = btn.closest('.tool-card').querySelector('h3').innerText;
            document.getElementById('modelName').innerText = name;
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
});
