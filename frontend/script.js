// ==================== 1. 弹窗控制逻辑 ====================
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
};
window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
};

// ==================== 2. AI 助手功能 (联网版) ====================
document.addEventListener('DOMContentLoaded', () => {
    const aiSubmit = document.getElementById('aiAssistantSubmit');
    const aiInput = document.getElementById('aiAssistantInput');
    const aiContent = document.getElementById('aiAssistantContent');

    if (aiSubmit) {
        aiSubmit.addEventListener('click', async () => {
            const question = aiInput.value.trim();
            if (!question) return;

            const userDiv = document.createElement('div');
            userDiv.style.margin = "10px 0";
            userDiv.innerHTML = `<strong>您：</strong>${question}`;
            aiContent.appendChild(userDiv);
            aiInput.value = '';

            const loadingDiv = document.createElement('div');
            loadingDiv.innerText = "正在思考中...";
            aiContent.appendChild(loadingDiv);

            try {
                const data = await window.DreamAI.AI.chat(question);
                loadingDiv.innerHTML = `<strong>AI助手：</strong>${data.reply}`;
            } catch (error) {
                loadingDiv.innerText = "连接大脑失败，请检查网络。";
            }
            aiContent.scrollTop = aiContent.scrollHeight;
        });
    }

    // 3D 预览按钮逻辑 (修正文件名)
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = btn.closest('.tool-card').querySelector('h3').innerText;
            const modelViewer = document.getElementById('modelViewer');
            const modelNameEl = document.getElementById('modelName');
            if (modelNameEl) modelNameEl.innerText = name;
            
            let path = '';
            if (name.includes('斯特林')) path = './models/stirling.glb';
            else if (name.includes('连杆')) path = './models/linkage.glb';
            else if (name.includes('机器人')) path = './models/robot.glb';

            if (modelViewer && path) {
                modelViewer.src = path;
                window.openModal('modelViewerModal');
            }
        });
    });
});

// ==================== 3. 原有的动态效果还原 ====================
function reveal() {
    document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) el.classList.add("active");
    });
}
window.addEventListener("scroll", reveal);

// 鼠标跟随
window.addEventListener('load', () => {
    reveal();
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45,106,79,0.05) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%);";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });
});
