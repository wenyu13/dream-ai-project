/**
 * 微光循迹 - 核心交互脚本 (简单稳健版)
 */

// 1. 全局弹窗控制 (确保 HTML 里的 onclick 绝对有效)
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }
};

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; 
        
        // 如果关闭的是 3D 弹窗，清空路径防止声音或模型残留
        const viewer = document.getElementById('modelViewer');
        if (id === 'modelViewerModal' && viewer) {
            viewer.src = '';
        }
    }
};

// 2. 3D 预览按钮逻辑 (对应你文件夹里的全小写文件名)
document.addEventListener('click', function(e) {
    // 检查点击的是不是 3D 预览按钮
    if (e.target.classList.contains('tool-btn')) {
        e.preventDefault();
        const card = e.target.closest('.portal-card') || e.target.closest('.tool-card');
        const modelName = card.querySelector('h3').innerText;
        const modelViewer = document.getElementById('modelViewer');
        const modelNameDisplay = document.getElementById('modelName');
        
        if (modelNameDisplay) modelNameDisplay.innerText = modelName;

        let path = '';
        if (modelName.includes('斯特林')) path = './models/stirling.glb';
        else if (modelName.includes('连杆')) path = './models/linkage.glb';
        else if (modelName.includes('机器人')) path = './models/robot.glb';

        if (modelViewer && path) {
            modelViewer.src = path;
            window.openModal('modelViewerModal');
        }
    }
});

// 3. AI 助手功能 (联网版)
window.handleAIChat = async function() {
    const aiInput = document.getElementById('aiAssistantInput');
    const aiContent = document.getElementById('aiAssistantContent');
    const question = aiInput.value.trim();
    if (!question) return;

    aiContent.innerHTML += `<div style="margin:10px 0; text-align:right;"><strong>您：</strong>${question}</div>`;
    aiInput.value = '';
    const loadingDiv = document.createElement('div');
    loadingDiv.innerText = "微光AI正在思考...";
    aiContent.appendChild(loadingDiv);

    try {
        const data = await window.DreamAI.AI.chat(question);
        loadingDiv.innerHTML = `<strong>微光AI：</strong>${data.reply}`;
    } catch (error) {
        loadingDiv.innerText = "连接失败，请稍后刷新重试。";
    }
    aiContent.scrollTop = aiContent.scrollHeight;
};

// 4. 滚动揭幕与鼠标特效
function reveal() {
    document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) el.classList.add("active");
    });
}

window.addEventListener("scroll", reveal);
window.addEventListener('load', () => {
    reveal();
    const aiSubmit = document.getElementById('aiAssistantSubmit');
    if (aiSubmit) aiSubmit.onclick = window.handleAIChat;

    // 鼠标光晕
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%);";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (ev) => {
        glow.style.left = ev.clientX + 'px';
        glow.style.top = ev.clientY + 'px';
    });
});
