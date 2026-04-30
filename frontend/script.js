// 使用自执行函数包裹，防止变量冲突
(function() {
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
        error(msg) { this.show(msg, 'error'); }
    };

    // ==================== 2. 页面揭幕与动画逻辑 ====================
    function reveal() {
        const reveals = document.querySelectorAll(".reveal");
        reveals.forEach((element) => {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - 100) {
                element.classList.add("active");
            }
        });
    }

    // 数字跳动
    function animateCounter(el) {
        if (el.dataset.done) return;
        const target = +el.dataset.target;
        let count = 0;
        const update = () => {
            const inc = target / 40;
            if (count < target) {
                count += inc;
                el.innerText = Math.ceil(count).toLocaleString();
                setTimeout(update, 20);
            } else {
                el.innerText = target.toLocaleString();
                el.dataset.done = "true";
            }
        };
        update();
    }

    // ==================== 3. AI助手功能 (联网版) ====================
    async function handleAIChat() {
        const aiInput = document.getElementById('aiAssistantInput');
        const aiContent = document.getElementById('aiAssistantContent');
        const question = aiInput.value.trim();
        if (!question) return;

        const userDiv = document.createElement('div');
        userDiv.style.margin = "10px 0";
        userDiv.innerHTML = `<strong>您：</strong>${question}`;
        aiContent.appendChild(userDiv);
        aiInput.value = '';

        const loadingDiv = document.createElement('div');
        loadingDiv.innerHTML = `<strong>AI助手：</strong>正在思考中...`;
        aiContent.appendChild(loadingDiv);
        aiContent.scrollTop = aiContent.scrollHeight;

        try {
            const data = await window.DreamAI.AI.chat(question);
            loadingDiv.innerHTML = `<strong>AI助手：</strong>${data.reply}`;
        } catch (error) {
            loadingDiv.innerHTML = `<strong>AI助手：</strong>连接失败，请稍后刷新重试。`;
        }
        aiContent.scrollTop = aiContent.scrollHeight;
    }

    // ==================== 4. 初始化与事件绑定 ====================
    window.addEventListener('load', () => {
        reveal();
        
        // 绑定滚动
        window.addEventListener("scroll", reveal);

        // 观察数字统计
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('.counter');
                    counters.forEach(c => animateCounter(c));
                }
            });
        }, { threshold: 0.5 });
        const stats = document.getElementById('stats');
        if (stats) counterObserver.observe(stats);

        // 鼠标光晕
        const glow = document.createElement('div');
        glow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45,106,79,0.05) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%);";
        document.body.appendChild(glow);
        document.addEventListener('mousemove', (e) => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });

        // 3D预览路径修复 (对应你的 models 文件夹)
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.portal-card') || btn.closest('.tool-card');
                const modelName = card.querySelector('h3').innerText;
                const modelViewer = document.getElementById('modelViewer');
                document.getElementById('modelName').innerText = modelName;

                let path = '';
                if(modelName.includes('斯特林')) path = './models/stirling.glb';
                else if(modelName.includes('连杆')) path = './models/linkage.glb';
                else if(modelName.includes('机器人')) path = './models/robot.glb';

                if(modelViewer && path) {
                    modelViewer.src = path;
                    window.openModal('modelViewerModal');
                }
            });
        });

        const aiBtn = document.getElementById('aiAssistantSubmit');
        if(aiBtn) aiBtn.onclick = handleAIChat;
    });

    // 弹窗控制
    window.openModal = function(id) {
        const m = document.getElementById(id);
        if (m) m.classList.add('active');
    };
    window.closeModal = function(id) {
        const m = document.getElementById(id);
        if (m) m.classList.remove('active');
    };
})();
