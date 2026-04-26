// 导航栏滚动变色 (Glass Nav)
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// 下拉菜单点击切换功能
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

// 身份切换菜单
const menuDots = document.querySelector('.menu-dots');
if (menuDots) {
    menuDots.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.remove('active');
    });
}

// 身份切换模态窗口功能
const identityModal = document.getElementById('identityModal');
const modalClose = document.getElementById('modalClose');
const switchIdentityBtn = document.getElementById('switchIdentity');

// 打开模态窗口
if (switchIdentityBtn && identityModal) {
    switchIdentityBtn.addEventListener('click', (e) => {
        e.preventDefault();
        identityModal.classList.add('active');
    });
}

// 关闭模态窗口
if (modalClose && identityModal) {
    modalClose.addEventListener('click', () => {
        identityModal.classList.remove('active');
    });
}

// 点击模态窗口外部关闭
if (identityModal) {
    identityModal.addEventListener('click', (e) => {
        if (e.target === identityModal) {
            identityModal.classList.remove('active');
        }
    });
}

// 身份按钮点击事件
const identityButtons = document.querySelectorAll('.identity-btn');
identityButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const identity = btn.dataset.identity;
        console.log('切换身份为:', identity);
        identityModal.classList.remove('active');
        
        // 根据身份跳转到相应页面
        switch(identity) {
            case 'student':
                window.location.href = 'learning.html';
                break;
            case 'teacher':
                window.location.href = 'teacher.html';
                break;
            case 'volunteer':
                window.location.href = 'volunteer.html';
                break;
            case 'admin':
                window.location.href = 'admin.html';
                break;
        }
    });
});

// AI助手功能
const aiAssistantBtn = document.getElementById('aiAssistantBtn');
const aiAssistantWindow = document.getElementById('aiAssistantWindow');
const aiAssistantClose = document.getElementById('aiAssistantClose');
const aiAssistantInput = document.getElementById('aiAssistantInput');
const aiAssistantSubmit = document.getElementById('aiAssistantSubmit');
const aiAssistantContent = document.getElementById('aiAssistantContent');

// 打开AI助手窗口
if (aiAssistantBtn && aiAssistantWindow) {
    aiAssistantBtn.addEventListener('click', () => {
        aiAssistantWindow.classList.add('active');
    });
}

// AI咨询按钮打开AI助手窗口
const aiConsult = document.getElementById('aiConsult');
if (aiConsult && aiAssistantWindow) {
    aiConsult.addEventListener('click', () => {
        aiAssistantWindow.classList.add('active');
    });
}

// 关闭AI助手窗口
if (aiAssistantClose && aiAssistantWindow) {
    aiAssistantClose.addEventListener('click', () => {
        aiAssistantWindow.classList.remove('active');
    });
}

// 提交问题
if (aiAssistantSubmit && aiAssistantInput && aiAssistantContent) {
    aiAssistantSubmit.addEventListener('click', () => {
        const question = aiAssistantInput.value.trim();
        if (question) {
            // 添加用户问题
            const userMessage = document.createElement('div');
            userMessage.className = 'ai-message';
            userMessage.style.background = 'rgba(255, 165, 0, 0.1)';
            userMessage.style.borderLeft = '3px solid var(--accent-orange)';
            userMessage.style.marginLeft = '20px';
            userMessage.innerHTML = `<strong>您：</strong>${question}`;
            aiAssistantContent.appendChild(userMessage);
            
            // 清空输入框
            aiAssistantInput.value = '';
            
            // 模拟AI回复
            setTimeout(() => {
                const aiMessage = document.createElement('div');
                aiMessage.className = 'ai-message';
                aiMessage.innerHTML = `<strong>AI助手：</strong>感谢您的提问！我正在为您处理这个问题，请稍等片刻...`;
                aiAssistantContent.appendChild(aiMessage);
                
                // 滚动到底部
                aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;
            }, 1000);
            
            // 滚动到底部
            aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;
        }
    });
    
    // 支持回车键提交
    aiAssistantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            aiAssistantSubmit.click();
        }
    });
}

// 漂流瓶模态窗口
const bottleModal = document.getElementById('bottleModal');
const openBottleModal = document.getElementById('openBottleModal');
const closeBottleModal = document.getElementById('closeBottleModal');
const cancelBottle = document.getElementById('cancelBottle');
const submitBottle = document.getElementById('submitBottle');
const bottleContent = document.getElementById('bottleContent');

if (openBottleModal && bottleModal) {
    openBottleModal.addEventListener('click', () => {
        bottleModal.classList.add('active');
    });
}

if (closeBottleModal && bottleModal) {
    closeBottleModal.addEventListener('click', () => {
        bottleModal.classList.remove('active');
    });
}

if (cancelBottle && bottleModal) {
    cancelBottle.addEventListener('click', () => {
        bottleModal.classList.remove('active');
    });
}

if (bottleModal) {
    bottleModal.addEventListener('click', (e) => {
        if (e.target === bottleModal) {
            bottleModal.classList.remove('active');
        }
    });
}

if (submitBottle) {
    submitBottle.addEventListener('click', () => {
        const content = bottleContent.value.trim();
        if (!content) {
            alert('请先写下内容再投递哦');
            return;
        }
        
        const category = document.querySelector('input[name="category"]:checked').value;
        
        // 这里可以对接后端 API
        console.log('投递漂流瓶:', { category, content });
        
        alert('漂流瓶已成功投递！志愿者会尽快给你回复。');
        bottleModal.classList.remove('active');
        bottleContent.value = '';
    });
}

// 聊天功能
const chatContainer = document.getElementById('chatContainer');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

function addMessage(sender, text, isStudent = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isStudent ? 'student' : 'teacher'}`;
    messageDiv.innerHTML = `
        <div class="sender">${sender}</div>
        <div>${text}</div>
    `;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    addMessage('学生(我)', text, true);
    chatInput.value = '';
    
    // 模拟老师回复
    setTimeout(() => {
        addMessage('李老师', '收到你的消息了，老师会尽快回复！');
    }, 1000);
}

if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
}

if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// 任务完成状态
const taskCheckboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
taskCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const taskItem = this.closest('.task-item');
        if (this.checked) {
            taskItem.classList.add('completed');
        } else {
            taskItem.classList.remove('completed');
        }
    });
});

// 下载按钮
const downloadBtns = document.querySelectorAll('.download-btn');
downloadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        alert('资料已开始下载...');
    });
});

// 鼠标跟随光晕效果
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
cursorGlow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(45, 106, 79, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    mix-blend-mode: multiply;
`;
document.body.appendChild(cursorGlow);

let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;

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

// 页面过渡效果
const pageTransition = document.getElementById('pageTransition');
const pageTransitionLinks = document.querySelectorAll('.page-transition');

pageTransitionLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetUrl = link.getAttribute('href');
        
        // 激活过渡效果
        if (pageTransition) {
            pageTransition.classList.add('active');
            
            // 等待过渡完成后跳转
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 600);
        }
    });
});