// ==================== 1. 弹窗控制逻辑 ====================
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 弹窗时禁止背景滚动
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // 关闭时恢复滚动
    }
}

// 绑定导航栏初始按钮
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginBtn')?.addEventListener('click', () => openModal('loginModal'));
    document.getElementById('registerBtn')?.addEventListener('click', () => openModal('registerModal'));
    
    // AI图标按钮点击（如果html中有对应的ID）
    document.getElementById('aiAssistantBtn')?.addEventListener('click', () => {
        const win = document.getElementById('aiAssistantWindow');
        if (win) win.style.display = (win.style.display === 'flex') ? 'none' : 'flex';
    });
});

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

// ==================== 3. 3D 模型预览逻辑 ====================
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

// ==================== 4. 核心：页面动态揭幕逻辑 (修复白屏) ====================
function reveal() {
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((element) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 100; // 露出来100px就开始显示

        if (elementTop < windowHeight - elementVisible) {
            element.classList.add("active");
        }
    });
}

// 监听滚动事件
window.addEventListener("scroll", reveal);

// 页面加载完成后初始化
window.addEventListener('load', () => {
    // 初始化3D功能
    initModelViewer();
    
    // 关键：立即触发一次揭幕检查，让首屏内容直接变出来
    setTimeout(() => {
        reveal();
        // 如果依然不显示，强制给所有reveal加active（保底方案）
        console.log("✅ 动态效果已激活");
    }, 300);
});
