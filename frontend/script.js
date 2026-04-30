// ==================== 1. 全局弹窗控制 (确保 HTML 能点动) ====================
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        if(id === 'aiAssistantWindow') modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        if(id === 'aiAssistantWindow') modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// ==================== 2. AI 助手逻辑 ====================
document.addEventListener('DOMContentLoaded', () => {
    const aiSubmit = document.getElementById('aiAssistantSubmit');
    const aiInput = document.getElementById('aiAssistantInput');
    const aiContent = document.getElementById('aiAssistantContent');

    if (aiSubmit) {
        aiSubmit.addEventListener('click', async () => {
            const question = aiInput.value.trim();
            if (!question) return;

            // 显示用户消息
            const userDiv = document.createElement('div');
            userDiv.className = 'ai-message';
            userDiv.style.background = 'rgba(255, 165, 0, 0.1)';
            userDiv.innerHTML = `<strong>您：</strong>${question}`;
            aiContent.appendChild(userDiv);
            aiInput.value = '';

            // 显示思考中
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'ai-message';
            loadingDiv.innerHTML = `<strong>AI助手：</strong>正在思考中...`;
            aiContent.appendChild(loadingDiv);
            aiContent.scrollTop = aiContent.scrollHeight;

            try {
                const data = await window.DreamAI.AI.chat(question);
                loadingDiv.innerHTML = `<strong>AI助手：</strong>${data.reply}`;
            } catch (error) {
                loadingDiv.innerHTML = `<strong>AI助手：</strong>连接失败，请检查网络。`;
            }
            aiContent.scrollTop = aiContent.scrollHeight;
        });
    }

    // 绑定 3D 按钮
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const name = btn.closest('.tool-card').querySelector('h3').innerText;
            const modelViewer = document.getElementById('modelViewer');
            const modelNameEl = document.getElementById('modelName');
            if(modelNameEl) modelNameEl.innerText = name;
            
            let path = '';
            if(name.includes('斯特林')) path = './models/stirling.glb';
            else if(name.includes('连杆')) path = './models/linkage.glb';
            else if(name.includes('机器人')) path = './models/robot.glb';

            if(modelViewer && path) modelViewer.src = path;
            window.openModal('modelViewerModal');
        };
    });
});

// ==================== 3. 动态效果 (Reveal & Counter) ====================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            if (entry.target.classList.contains('counter')) {
                const target = +entry.target.getAttribute('data-target');
                let count = 0;
                const update = () => {
                    count += target / 40;
                    if (count < target) { entry.target.innerText = Math.ceil(count); setTimeout(update, 20); }
                    else entry.target.innerText = target.toLocaleString();
                };
                update();
            }
        }
    });
}, { threshold: 0.1 });

window.addEventListener('load', () => {
    document.querySelectorAll('.reveal, .counter').forEach(el => observer.observe(el));
    
    // 鼠标光晕
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45,106,79,0.08) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%);";
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });
});
