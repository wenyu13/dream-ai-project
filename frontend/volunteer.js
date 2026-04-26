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

// 认领漂流瓶功能
const replyModal = document.getElementById('replyModal');
const closeReplyModal = document.getElementById('closeReplyModal');
const cancelReply = document.getElementById('cancelReply');
const submitReply = document.getElementById('submitReply');
const bottleContent = document.getElementById('bottleContent');
const replyText = document.getElementById('replyText');
const claimBtns = document.querySelectorAll('.claim-btn');

claimBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const content = btn.closest('tr').querySelector('td:nth-child(2)').textContent;
        bottleContent.textContent = `"${content}"`;
        replyModal.classList.add('active');
    });
});

if (closeReplyModal) {
    closeReplyModal.addEventListener('click', () => {
        replyModal.classList.remove('active');
    });
}

if (cancelReply) {
    cancelReply.addEventListener('click', () => {
        replyModal.classList.remove('active');
    });
}

if (replyModal) {
    replyModal.addEventListener('click', (e) => {
        if (e.target === replyModal) {
            replyModal.classList.remove('active');
        }
    });
}

if (submitReply) {
    submitReply.addEventListener('click', () => {
        const content = replyText.value.trim();
        if (!content) {
            alert('请先写下回复内容');
            return;
        }
        
        // 这里可以对接后端 API
        console.log('发送回信:', content);
        
        alert('回信已寄出，勋章进度+1！');
        replyModal.classList.remove('active');
        replyText.value = '';
        
        // 更新勋章显示
        updateMedals();
    });
}

function updateMedals() {
    const medals = document.querySelectorAll('.medal');
    medals.forEach((medal, index) => {
        if (index < 2) {
            medal.classList.remove('inactive');
            medal.classList.add('active');
        }
    });
    
    const medalCount = document.querySelector('.medal-count');
    if (medalCount) {
        medalCount.textContent = '已点亮 2 枚数字勋章';
    }
}

// 参与捐赠按钮
const donateBtn = document.querySelector('.donate-btn');
if (donateBtn) {
    donateBtn.addEventListener('click', () => {
        alert('感谢您的爱心！捐赠功能开发中...');
    });
}

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