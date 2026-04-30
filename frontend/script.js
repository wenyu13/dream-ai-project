// ==================== 1. Toast通知工具 ====================
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
        toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => { if (toast.parentNode) document.body.removeChild(toast); }, 400);
        }, duration);
    },
    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    warning(msg) { this.show(msg, 'warning'); },
    info(msg) { this.show(msg, 'info'); }
};

// ==================== 2. 核心：揭幕动画 (修复白屏的关键) ====================
function reveal() {
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((element) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 100; // 露出100px即显示
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add("active");
        }
    });
}
window.addEventListener("scroll", reveal);

// ==================== 3. 3D模型查看器逻辑 ====================
function initModelViewer() {
    const modal = document.getElementById('modelViewerModal');
    const closeBtn = document.getElementById('modelViewerClose');
    const modelViewer = document.getElementById('modelViewer');
    const modelTitle = document.getElementById('modelName');
    
    if (!modal || !modelViewer) return;

    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.portal-card') || btn.closest('.tool-card');
            const modelName = card.querySelector('h3').textContent.trim();
            
            // 🚀 严格匹配你 GitHub 里的文件名
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
                    Toast.warning('未找到对应模型文件');
                    return;
            }
            
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

// ==================== 4. 页面初始化 ====================
window.addEventListener('load', () => {
    console.log("🚀 筑梦AI系统初始化...");
    
    // 初始化3D功能
    initModelViewer();
    
    // 触发一次揭幕逻辑，让首屏内容显示
    reveal();

    // 保底逻辑：如果500ms后首屏还没出来，强制激活首屏
    setTimeout(() => {
        const firstBatch = document.querySelectorAll('.reveal');
        for(let i=0; i<5; i++){
            if(firstBatch[i]) firstBatch[i].classList.add('active');
        }
    }, 500);
});

// ==================== 5. AI助手窗口控制 (保底) ====================
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
};
window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
};
