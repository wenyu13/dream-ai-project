/**
 * 微光循迹 - 全局交互引擎 (零冲突修复版)
 * 仅修复逻辑，100% 不触碰 HTML 布局
 */

(function() {
    // ==================== 1. 全局弹窗控制 (强力公开) ====================
    window.openModal = function(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            // 针对 AI 窗口做特殊显示处理
            if(id === 'aiAssistantWindow') {
                modal.style.display = 'flex';
            }
            document.body.style.overflow = 'hidden'; 
        }
    };

    window.closeModal = function(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            if(id === 'aiAssistantWindow') {
                modal.style.display = 'none';
            }
            document.body.style.overflow = 'auto'; 
            
            // 关闭 3D 弹窗时清空路径释放内存
            const viewer = document.getElementById('modelViewer');
            if (id === 'modelViewerModal' && viewer) {
                viewer.src = '';
            }
        }
    };

    // ==================== 2. AI 助手逻辑 (联网版) ====================
    window.handleAIChat = async function() {
        const aiInput = document.getElementById('aiAssistantInput');
        const aiContent = document.getElementById('aiAssistantContent');
        if (!aiInput || !aiContent) return;
        
        const question = aiInput.value.trim();
        if (!question) return;

        // 用户气泡
        const userDiv = document.createElement('div');
        userDiv.style.cssText = "margin: 10px 0; text-align: right; background: rgba(255, 159, 28, 0.1); padding: 10px; border-radius: 10px;";
        userDiv.innerHTML = `<strong>您：</strong>${question}`;
        aiContent.appendChild(userDiv);
        aiInput.value = '';

        // 思考中提示
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = "margin: 10px 0; background: rgba(45, 106, 79, 0.05); padding: 10px; border-radius: 10px;";
        loadingDiv.innerHTML = `<strong>AI助手：</strong>正在思考中...`;
        aiContent.appendChild(loadingDiv);
        aiContent.scrollTop = aiContent.scrollHeight;

        try {
            const data = await window.DreamAI.AI.chat(question);
            loadingDiv.innerHTML = `<strong>AI助手：</strong>${data.reply}`;
        } catch (error) {
            loadingDiv.innerText = "暂时无法连接大脑，请稍后刷新重试。";
        }
        aiContent.scrollTop = aiContent.scrollHeight;
    };

    // ==================== 3. 动态效果 (Reveal & Counter) ====================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(c => {
                    if (!c.dataset.done) {
                        const target = +c.dataset.target;
                        let count = 0;
                        const update = () => {
                            count += target / 50;
                            if (count < target) {
                                c.innerText = Math.ceil(count).toLocaleString();
                                setTimeout(update, 20);
                            } else {
                                c.innerText = target.toLocaleString();
                                c.dataset.done = "true";
                            }
                        };
                        update();
                    }
                });
            }
        });
    }, { threshold: 0.1 });

    // ==================== 4. 初始化与事件绑定 ====================
    window.addEventListener('load', () => {
        // 激活揭幕动画
        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

        // 鼠标跟随光晕
        const glow = document.createElement('div');
        glow.style.cssText = "position:fixed; width:400px; height:400px; background:radial-gradient(circle, rgba(45, 106, 79, 0.05) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition: opacity 0.3s;";
        document.body.appendChild(glow);
        document.addEventListener('mousemove', (e) => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });

        // 3D 预览按钮逻辑 (不破坏布局，直接寻找 class)
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const card = btn.closest('.portal-card') || btn.closest('.tool-card');
                const modelName = card.querySelector('h3').innerText;
                const modelViewer = document.getElementById('modelViewer');
                const modelNameDisplay = document.getElementById('modelName');
                
                if (modelNameDisplay) modelNameDisplay.innerText = modelName;

                let path = '';
                if(modelName.includes('斯特林')) path = './models/stirling.glb';
                else if(modelName.includes('连杆')) path = './models/linkage.glb';
                else if(modelName.includes('机器人')) path = './models/robot.glb';

                if (modelViewer && path) {
                    modelViewer.src = path;
                    window.openModal('modelViewerModal');
                }
            };
        });

        // 强力绑定 AI 提交按钮
        const aiSubmit = document.getElementById('aiAssistantSubmit');
        if (aiSubmit) aiSubmit.onclick = window.handleAIChat;
    });

    // 强力捕捉：如果 HTML 里的 onclick 还没生效，我们在这里再加一层保障
    document.addEventListener('click', function(e) {
        if (e.target.id === 'aiAssistantBtn' || e.target.closest('#aiAssistantBtn')) {
            window.openModal('aiAssistantWindow');
        }
    });

})();
