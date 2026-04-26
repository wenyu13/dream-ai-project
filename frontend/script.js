// ==================== Toast通知工具 ====================
const Toast = {
    show(message, type = 'info', duration = 3000) {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // 根据类型设置图标
        let icon = '';
        switch(type) {
            case 'success':
                icon = '✓';
                break;
            case 'error':
                icon = '✕';
                break;
            case 'warning':
                icon = '⚠';
                break;
            default:
                icon = 'ℹ';
        }
        
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;
        
        // 添加到页面
        document.body.appendChild(toast);
        
        // 显示动画
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 400);
        }, duration);
    },
    
    success(message, duration) {
        this.show(message, 'success', duration);
    },
    
    error(message, duration) {
        this.show(message, 'error', duration);
    },
    
    warning(message, duration) {
        this.show(message, 'warning', duration);
    },
    
    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

// ==================== 导航栏滚动变色 (Glass Nav) ====================
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// 滚动揭幕逻辑 (Scroll Reveal)
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
            
            // 显示加载状态
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'ai-message loading';
            loadingMessage.innerHTML = '<strong>AI助手：</strong><span class="loading-dots">正在思考</span>';
            aiAssistantContent.appendChild(loadingMessage);
            
            // 滚动到底部
            aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;
            
            // 模拟AI回复
            setTimeout(() => {
                // 移除加载消息
                loadingMessage.remove();
                
                const aiMessage = document.createElement('div');
                aiMessage.className = 'ai-message';
                
                // 根据问题类型提供不同的回复
                let response = '';
                const questionLower = question.toLowerCase();
                
                if (questionLower.includes('支教') || questionLower.includes('申请')) {
                    response = '关于支教申请，您可以点击页面上的"立即申请"按钮填写申请表。我们通常会在3个工作日内回复您的申请。';
                } else if (questionLower.includes('教具') || questionLower.includes('模型')) {
                    response = '我们提供多种3D教具，包括斯特林发动机、平面四连杆机构和AI巡检机器人。您可以点击"3D互动预览"按钮查看详细模型。';
                } else if (questionLower.includes('时间') || questionLower.includes('什么时候')) {
                    response = '支教项目全年开放申请，具体支教时间会根据学校安排和您的个人情况协商确定。';
                } else if (questionLower.includes('要求') || questionLower.includes('条件')) {
                    response = '支教申请的基本要求：1）在校大学生或应届毕业生；2）热爱教育事业；3）具备一定的专业知识；4）能适应山区生活环境。';
                } else if (questionLower.includes('联系') || questionLower.includes('电话')) {
                    response = '您可以通过以下方式联系我们：电话：400-123-4567；邮箱：contact@dreamai.edu；地址：北京市海淀区中关村大街1号。';
                } else {
                    response = '感谢您的提问！我正在为您处理这个问题。如果您需要更详细的帮助，请提供更多具体信息，或者联系我们的客服团队。';
                }
                
                aiMessage.innerHTML = `<strong>AI助手：</strong>${response}`;
                aiAssistantContent.appendChild(aiMessage);
                
                // 滚动到底部
                aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;
            }, 1500);
            
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

window.addEventListener("scroll", reveal);
reveal();

// 鼠标跟随光晕效果
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
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

// 数字计数动画
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

// 观察计数器元素
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

document.querySelectorAll('.counter').forEach(counter => {
    counterObserver.observe(counter);
});

// 磁性按钮效果
document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
    });
});

// 生成悬浮粒子
function createFloatingParticles(container, count = 10) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 4) + 's';
        container.appendChild(particle);
    }
}

// 为 Hero 区域添加悬浮粒子
const heroSection = document.querySelector('.hero-section');
if (heroSection) {
    createFloatingParticles(heroSection, 15);
}

// 平滑滚动到锚点
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // 如果是#，滚动到页面顶部
        if (href === '#') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }
        
        // 否则滚动到对应的锚点
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 添加页面加载完成后的动画
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// 视差滚动效果
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
}); // 初始化检查

// 身份切换模态窗口功能
const identityModal = document.getElementById('identityModal');
const modalClose = document.getElementById('modalClose');
const switchIdentityLink = document.querySelector('.identity-menu a');

// 打开模态窗口
if (switchIdentityLink && identityModal) {
    switchIdentityLink.addEventListener('click', (e) => {
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

// 切换身份按钮点击事件
const switchIdentityBtn = document.getElementById('switchIdentity');
if (switchIdentityBtn && identityModal) {
    switchIdentityBtn.addEventListener('click', (e) => {
        e.preventDefault();
        identityModal.classList.add('active');
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

// 志愿者申请模态窗口功能
const applyModal = document.getElementById('applyModal');
const applyModalClose = document.getElementById('applyModalClose');
const applyBtn = document.getElementById('applyBtn');
const applyCancel = document.getElementById('applyCancel');
const applySubmit = document.getElementById('applySubmit');

// 打开申请模态窗口
if (applyBtn && applyModal) {
    applyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        applyModal.classList.add('active');
    });
}

// 为岗位卡片中的"立即申请"按钮添加点击事件
const jobApplyBtns = document.querySelectorAll('.job-apply-btn');
jobApplyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (applyModal) {
            applyModal.classList.add('active');
        }
    });
});

// 关闭申请模态窗口
if (applyModalClose && applyModal) {
    applyModalClose.addEventListener('click', () => {
        applyModal.classList.remove('active');
    });
}

// 取消按钮
if (applyCancel && applyModal) {
    applyCancel.addEventListener('click', () => {
        applyModal.classList.remove('active');
    });
}

// 点击模态窗口外部关闭
if (applyModal) {
    applyModal.addEventListener('click', (e) => {
        if (e.target === applyModal) {
            applyModal.classList.remove('active');
        }
    });
}

// 提交申请
if (applySubmit) {
    applySubmit.addEventListener('click', () => {
        const realName = document.getElementById('realName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const university = document.getElementById('university').value.trim();
        const major = document.getElementById('major').value.trim();
        const bio = document.getElementById('bio').value.trim();
        
        // 清除之前的错误提示
        clearFormErrors();
        
        let isValid = true;
        
        // 验证姓名
        if (!realName) {
            showError('realName', '请输入您的姓名');
            isValid = false;
        } else if (realName.length < 2) {
            showError('realName', '姓名至少需要2个字符');
            isValid = false;
        }
        
        // 验证电话号码
        if (!phone) {
            showError('phone', '请输入联系电话');
            isValid = false;
        } else if (!/^1[3-9]\d{9}$/.test(phone)) {
            showError('phone', '请输入有效的手机号码');
            isValid = false;
        }
        
        // 验证个人简介
        if (bio && bio.length > 500) {
            showError('bio', '个人简介不能超过500字');
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        console.log('提交申请:', { realName, phone, university, major, bio });
        
        // 保存到localStorage
        const application = {
            id: Date.now(),
            realName,
            phone,
            university,
            major,
            bio,
            submitTime: new Date().toISOString()
        };
        
        const applications = JSON.parse(localStorage.getItem('volunteerApplications') || '[]');
        applications.push(application);
        localStorage.setItem('volunteerApplications', JSON.stringify(applications));
        
        console.log('已保存到localStorage:', applications);
        
        // 显示提交成功消息
        showSuccessMessage('申请已提交！我们会尽快与您联系。');
        
        // 清空表单
        document.getElementById('realName').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('university').value = '';
        document.getElementById('major').value = '';
        document.getElementById('bio').value = '';
        
        // 3秒后关闭模态窗口
        setTimeout(() => {
            applyModal.classList.remove('active');
        }, 3000);
    });
}

// 显示错误提示
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    
    // 移除已有的错误提示
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // 添加错误样式
    field.style.borderColor = 'var(--danger-red)';
    
    // 创建错误消息元素
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.style.color = 'var(--danger-red)';
    errorElement.style.fontSize = '0.85rem';
    errorElement.style.marginTop = '5px';
    errorElement.textContent = message;
    
    formGroup.appendChild(errorElement);
}

// 清除所有错误提示
function clearFormErrors() {
    document.querySelectorAll('.error-message').forEach(error => error.remove());
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
        field.style.borderColor = '';
    });
}

// 显示成功消息
function showSuccessMessage(message) {
    // 移除已有的成功消息
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    // 创建成功消息元素
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.style.position = 'fixed';
    successElement.style.top = '20px';
    successElement.style.right = '20px';
    successElement.style.background = 'var(--primary-green)';
    successElement.style.color = 'white';
    successElement.style.padding = '15px 25px';
    successElement.style.borderRadius = '10px';
    successElement.style.boxShadow = '0 5px 15px rgba(45, 106, 79, 0.3)';
    successElement.style.zIndex = '9999';
    successElement.style.animation = 'slideIn 0.3s ease';
    successElement.textContent = message;
    
    document.body.appendChild(successElement);
    
    // 3秒后移除成功消息
    setTimeout(() => {
        successElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            successElement.remove();
        }, 300);
    }, 3000);
}

// 添加CSS动画
const scriptStyles = document.createElement('style');
scriptStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(scriptStyles);

// 实时表单验证
function setupRealTimeValidation() {
    const realNameInput = document.getElementById('realName');
    const phoneInput = document.getElementById('phone');
    const bioTextarea = document.getElementById('bio');
    
    if (realNameInput) {
        realNameInput.addEventListener('blur', () => {
            const value = realNameInput.value.trim();
            if (value && value.length < 2) {
                showError('realName', '姓名至少需要2个字符');
            } else if (value) {
                clearError('realName');
            }
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('blur', () => {
            const value = phoneInput.value.trim();
            if (value && !/^1[3-9]\d{9}$/.test(value)) {
                showError('phone', '请输入有效的手机号码');
            } else if (value) {
                clearError('phone');
            }
        });
    }
    
    if (bioTextarea) {
        bioTextarea.addEventListener('input', () => {
            const value = bioTextarea.value.trim();
            if (value.length > 500) {
                showError('bio', `已输入${value.length}/500字，超出限制`);
            } else if (value) {
                clearError('bio');
            }
        });
    }
}

// 清除单个字段的错误提示
function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const formGroup = field.closest('.form-group');
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    field.style.borderColor = '';
}

// 页面加载完成后设置实时验证
window.addEventListener('load', () => {
    setupRealTimeValidation();
    initModelViewer();
});

// ==================== 3D模型查看器 ====================
function initModelViewer() {
    const modal = document.getElementById('modelViewerModal');
    const closeBtn = document.getElementById('modelViewerClose');
    const modelViewer = document.getElementById('modelViewer');
    const modelTitle = document.getElementById('modelName');
    
    if (!modal || !modelViewer) {
        console.error('3D模型查看器初始化失败：找不到必要的元素');
        return;
    }
    
    console.log('3D模型查看器初始化成功');
    
    // 打开3D查看器
    function openModelViewer(modelPath, modelName) {
        console.log('打开3D查看器:', modelName, modelPath);
        
        // 设置模型路径
        modelViewer.src = modelPath;
        modelTitle.textContent = modelName;
        
        console.log('模型路径已设置:', modelViewer.src);
        
        // 显示模态窗口
        modal.classList.add('active');
        
        // 监听模型加载事件（只监听一次）
        const onLoadHandler = () => {
            console.log('模型加载成功');
            Toast.success(`模型"${modelName}"加载成功！`);
            modelViewer.removeEventListener('load', onLoadHandler);
        };
        
        // 监听模型加载错误事件（只监听一次）
        const onErrorHandler = (error) => {
            console.error('模型加载失败:', error);
            console.error('错误详情:', error.detail);
            Toast.error('模型加载失败，请检查文件路径！');
            modelViewer.removeEventListener('error', onErrorHandler);
        };
        
        modelViewer.addEventListener('load', onLoadHandler);
        modelViewer.addEventListener('error', onErrorHandler);
        
        // 添加超时检查
        setTimeout(() => {
            if (!modelViewer.model || !modelViewer.modelIsVisible) {
                console.warn('模型加载超时或未正确显示');
                Toast.warning('模型加载可能有问题，请检查控制台');
            }
        }, 5000);
    }
    
    // 关闭3D查看器
    function closeModelViewer() {
        console.log('关闭3D查看器');
        modal.classList.remove('active');
        
        // 清空模型路径
        setTimeout(() => {
            modelViewer.src = '';
        }, 300);
    }
    
    // 关闭按钮事件
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModelViewer);
    }
    
    // 点击外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModelViewer();
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModelViewer();
        }
    });
    
    // 为3D预览按钮添加点击事件
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.tool-card');
            const modelName = card.querySelector('h3').textContent.trim();
            console.log('点击3D预览按钮:', modelName);
            
            // 根据模型名称选择对应的glb文件
            let modelPath;
            switch(modelName) {
                case '斯特林发动机':
                    modelPath = './models/stirling-engine.glb';
                    break;
                case '平面四连杆机构':
                    modelPath = './models/four-bar-linkage.glb';
                    break;
                case 'AI 巡检机器人':
                    modelPath = './models/ai-robot.glb';
                    break;
                default:
                    Toast.warning('未找到对应的模型文件！');
                    return;
            }
            
            openModelViewer(modelPath, modelName);
        });
    });
    
    console.log('3D模型查看器初始化完成');
}