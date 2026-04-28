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
                document.body.removeChild(toast);
            }, 400);
        }, duration);
    },
    success(message, duration) { this.show(message, 'success', duration); },
    error(message, duration) { this.show(message, 'error', duration); },
    warning(message, duration) { this.show(message, 'warning', duration); },
    info(message, duration) { this.show(message, 'info', duration); }
};

// ==================== 导航栏滚动变色 ====================
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// 滚动揭幕逻辑
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
            loadingMessage.innerHTML = '<strong>AI助手：</strong><span class="loading-dots">正在思考中...</span>';
            aiAssistantContent.appendChild(loadingMessage);
            aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;
            
            try {
                // 🚀 调用 api.js 中的联网接口
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
                aiMessage.innerHTML = `<strong>AI助手：</strong>抱歉，大脑连接出了一点小问题，请稍后再试。`;
                aiAssistantContent.appendChild(aiMessage);
            }
            aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;
        }
    });
    
    aiAssistantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') aiAssistantSubmit.click();
    });
}

// ==================== 其他 UI 特效 ====================
window.addEventListener("scroll", reveal);
reveal();

// 鼠标跟随光晕
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
document.body.appendChild(cursorGlow);
let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
function animateCursorGlow() {
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateCursorGlow);
}
animateCursorGlow();

// 数字计数器
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

// 磁性按钮
document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0, 0)');
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        e.preventDefault();
        const target = href === '#' ? document.body : document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// 身份切换
const identityModal = document.getElementById('identityModal');
const switchIdentityLink = document.querySelector('.identity-menu a');
if (switchIdentityLink && identityModal) {
    switchIdentityLink.addEventListener('click', (e) => {
        e.preventDefault();
        identityModal.classList.add('active');
    });
}
document.querySelectorAll('.identity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const identity = btn.dataset.identity;
        window.location.href = identity === 'student' ? 'learning.html' : `${identity}.html`;
    });
});

// ==================== 志愿者申请 ====================
const applyModal = document.getElementById('applyModal');
const applyBtn = document.getElementById('applyBtn');
if (applyBtn && applyModal) {
    applyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        applyModal.classList.add('active');
    });
}
// 为卡片中的"立即申请"添加事件
document.querySelectorAll('.job-apply-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (applyModal) applyModal.classList.add('active');
    });
});

// 提交申请
const applySubmit = document.getElementById('applySubmit');
if (applySubmit) {
    applySubmit.addEventListener('click', () => {
        const data = {
            realName: document.getElementById('realName').value,
            phone: document.getElementById('phone').value
        };
        // 目前存入本地，建议后续接入后端接口
        localStorage.setItem('lastApplication', JSON.stringify(data));
        showSuccessMessage('申请已提交！');
        setTimeout(() => applyModal.classList.remove('active'), 2000);
    });
}

function showSuccessMessage(message) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:20px;right:20px;background:#2d6a4f;color:white;padding:15px;border-radius:10px;z-index:9999;';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

// ==================== 3D模型查看器 (核心修改点) ====================
function initModelViewer() {
    const modal = document.getElementById('modelViewerModal');
    const closeBtn = document.getElementById('modelViewerClose');
    const modelViewer = document.getElementById('modelViewer');
    const modelTitle = document.getElementById('modelName');
    
    if (!modal || !modelViewer) return;

    function openModelViewer(modelPath, modelName) {
        modelViewer.src = modelPath;
        modelTitle.textContent = modelName;
        modal.classList.add('active');
        
        Toast.info(`正在加载"${modelName}"模型...`);
        
        modelViewer.addEventListener('load', () => Toast.success('模型加载成功！'), {once: true});
        modelViewer.addEventListener('error', () => Toast.error('加载失败，请重试'), {once: true});
    }

    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modelName = btn.closest('.tool-card').querySelector('h3').textContent.trim();
            
            // 🚀 这里修改为你在 GitHub 上传的真实文件名
            let modelPath;
            switch(modelName) {
                case '斯特林发动机':
                    modelPath = './models/stirling.glb';
                    break;
                case '平面四连杆机构':
                    modelPath = './models/linkage.glb';
                    break;
                case 'AI 巡检机器人':
                    modelPath = './models/robot.glb';
                    break;
                default:
                    return;
            }
            openModelViewer(modelPath, modelName);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            modelViewer.src = ''; 
        });
    }
}

window.addEventListener('load', () => {
    initModelViewer();
});
