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
