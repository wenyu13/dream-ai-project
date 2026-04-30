// ==================== Toast通知工具 ====================
const Toast = {
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '';
        switch(type) {
            case 'success': icon = '✓'; break;
            case 'error': icon = '✕'; break;
            case 'warning': icon = '⚠'; break;
            default: icon = 'ℹ';
        }
        
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;
        
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) document.body.removeChild(toast);
            }, 400);
        }, duration);
    },
    success(message, duration) { this.show(message, 'success', duration); },
    error(message, duration) { this.show(message, 'error', duration); },
    warning(message, duration) { this.show(message, 'warning', duration); },
    info(message, duration) { this.show(message, 'info', duration); }
};

// ==================== 导航栏逻辑 ====================
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// ==================== 滚动揭幕逻辑 ====================
function reveal() {
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((element) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            element.classList.add("active");
        }
    });
}
window.addEventListener("scroll", reveal);

// ==================== AI助手功能 (联网版) ====================
const aiAssistantBtn = document.getElementById('aiAssistantBtn');
const aiAssistantWindow = document.getElementById('aiAssistantWindow');
const aiAssistantClose = document.getElementById('aiAssistantClose');
const aiAssistantInput = document.getElementById('aiAssistantInput');
const aiAssistantSubmit = document.getElementById('aiAssistantSubmit');
const aiAssistantContent = document.getElementById('aiAssistantContent');

if (aiAssistantBtn && aiAssistantWindow) {
    aiAssistantBtn.addEventListener('click', () => aiAssistantWindow.classList.add('active'));
}

const aiConsult = document.getElementById('aiConsult');
if (aiConsult && aiAssistantWindow) {
    aiConsult.addEventListener('click', () => aiAssistantWindow.classList.add('active'));
}

if (aiAssistantClose && aiAssistantWindow) {
    aiAssistantClose.addEventListener('click', () => aiAssistantWindow.classList.remove('active'));
}

if (aiAssistantSubmit && aiAssistantInput && aiAssistantContent) {
    aiAssistantSubmit.addEventListener('click', async () => {
        const question = aiAssistantInput.value.trim();
        if (question) {
            const userMessage = document.createElement('div');
            userMessage.className = 'ai-message';
            userMessage.style.background = 'rgba(255, 165, 0, 0.1)';
            userMessage.style.borderLeft = '3px solid var(--accent-orange)';
            userMessage.style.marginLeft = '20px';
            userMessage.innerHTML = `<strong>您：</strong>${question}`;
            aiAssistantContent.appendChild(userMessage);
            
            aiAssistantInput.value = '';
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'ai-message loading';
            loadingMessage.innerHTML = '<strong>AI助手：</strong><span class="loading-dots">正在思考中</span>';
            aiAssistantContent.appendChild(loadingMessage);
            aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;
            
            try {
                const data = await window.DreamAI.AI.chat(question);
                loadingMessage.remove();
                const aiMessage = document.createElement('div');
                aiMessage.className = 'ai-message';
                aiMessage.innerHTML = `<strong>AI助手：</strong>${data.reply}`;
                aiAssistantContent.appendChild(aiMessage);
            } catch (error) {
                console.error("AI对话失败:", error);
                loadingMessage.remove();
                const aiMessage = document.createElement('div');
                aiMessage.className = 'ai-message';
                aiMessage.style.color = 'var(--danger-red)';
                aiMessage.innerHTML = `<strong>AI助手：</strong>抱歉，大脑连接失败了，请稍后再试。`;
                aiAssistantContent.appendChild(aiMessage);
            }
            aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;
        }
    });

    aiAssistantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') aiAssistantSubmit.click();
    });
}

// ==================== 鼠标跟随光晕效果 ====================
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
document.body.appendChild(cursorGlow);

let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
});

function animateCursorGlow() {
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateCursorGlow);
}
animateCursorGlow();

// ==================== 数字计数动画 ====================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    updateCounter();
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.dataset.target);
            animateCounter(counter, target);
            counterObserver.unobserve(counter);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(counter => counterObserver.observe(counter));

// ==================== 身份切换逻辑 ====================
const identityModal = document.getElementById('identityModal');
const modalClose = document.getElementById('modalClose');
const switchIdentityLink = document.querySelector('.identity-menu a');
const switchIdentityBtn = document.getElementById('switchIdentity');

if ((switchIdentityLink || switchIdentityBtn) && identityModal) {
    const trigger = switchIdentityLink || switchIdentityBtn;
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        identityModal.classList.add('active');
    });
}

if (modalClose && identityModal) {
    modalClose.addEventListener('click', () => identityModal.classList.remove('active'));
}

document.querySelectorAll('.identity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const identity = btn.dataset.identity;
        identityModal.classList.remove('active');
        window.location.href = identity === 'student' ? 'learning.html' : `${identity}.html`;
    });
});

// ==================== 志愿者申请逻辑 ====================
const applyModal = document.getElementById('applyModal');
const applySubmit = document.getElementById('applySubmit');

if (document.getElementById('applyBtn') && applyModal) {
    document.getElementById('applyBtn').addEventListener('click', (e) => {
        e.preventDefault();
        applyModal.classList.add('active');
    });
}

document.querySelectorAll('.job-apply-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (applyModal) applyModal.classList.add('active');
    });
});

if (applySubmit) {
    applySubmit.addEventListener('click', () => {
        const realName = document.getElementById('realName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        if (!realName || !/^1[3-9]\d{9}$/.test(phone)) {
            Toast.error("请填入正确的姓名和手机号");
            return;
        }
        Toast.success("申请已提交！");
        setTimeout(() => applyModal.classList.remove('active'), 2000);
    });
}

// ... 前面部分保持不变 ...

// ==================== 3D模型查看器核心逻辑 ====================
function initModelViewer() {
    const modal = document.getElementById('modelViewerModal');
    const closeBtn = document.getElementById('modelViewerClose');
    const modelViewer = document.getElementById('modelViewer');
    const modelTitle = document.getElementById('modelName');
    
    if (!modal || !modelViewer) return;

    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.tool-card');
            const modelName = card.querySelector('h3').textContent.trim();
            
            console.log('点击3D预览按钮:', modelName);
            
            // 🚀 这里必须和你 GitHub 文件夹里的文件名一模一样
            let modelPath;
            switch(modelName) {
                case '斯特林发动机':
                    modelPath = './models/stirling.glb'; // 👈 确认是 stirling.glb
                    break;
                case '平面四连杆机构':
                    modelPath = './models/linkage.glb';  // 👈 确认是 linkage.glb
                    break;
                case 'AI 巡检机器人':
                    modelPath = './models/robot.glb';    // 👈 确认是 robot.glb
                    break;
                default:
                    Toast.warning('未找到对应模型文件');
                    return;
            }
            
            console.log('正在加载路径:', modelPath);
            modelViewer.src = modelPath;
            modelTitle.textContent = modelName;
            modal.classList.add('active');
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            modelViewer.src = ''; 
        });
    }
}

// 确保在页面加载时启动
window.addEventListener('load', () => {
    initModelViewer();
    // 如果有 reveal 动画逻辑也在这里调用
    if (typeof reveal === 'function') reveal();
});
