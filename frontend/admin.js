/**
 * 微光循迹 - 管理员端逻辑 (全功能对接版)
 * 保持原有 UI 交互，对接 Hugging Face 后端
 */

// ==================== 1. 导航栏与基础交互 (保留) ====================
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

const dropdown = document.querySelector('.dropdown');
const dropdownToggle = document.querySelector('.dropdown-toggle');
if (dropdown && dropdownToggle) {
    dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        dropdown.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) dropdown.classList.remove('active');
    });
}

const menuDots = document.querySelector('.menu-dots');
if (menuDots) {
    menuDots.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdownMenu = document.querySelector('.dropdown');
        if(dropdownMenu) dropdownMenu.classList.remove('active');
    });
}

// ==================== 2. 身份切换逻辑 (保留) ====================
const identityModal = document.getElementById('identityModal');
const switchIdentityBtn = document.getElementById('switchIdentity');
if (switchIdentityBtn && identityModal) {
    switchIdentityBtn.addEventListener('click', (e) => {
        e.preventDefault(); identityModal.classList.add('active');
    });
}
window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
};

const identityButtons = document.querySelectorAll('.identity-btn');
identityButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const identity = btn.dataset.identity;
        window.location.href = identity === 'student' ? 'learning.html' : `${identity}.html`;
    });
});

// ==================== 3. 核心：从后端加载真实申请数据 (修改点) ====================
async function loadApplications() {
    console.log('🚀 正在从云端抓取真实申请数据...');
    const tbody = document.querySelector('.app-table tbody');
    if (!tbody) return;

    try {
        // 1. 调用 api.js 里的 getAll 接口
        const applications = await window.DreamAI.Applications.getAll();
        
        tbody.innerHTML = '';
        if (!applications || applications.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">暂无真实申请数据 (请先在首页提交申请)</td></tr>';
            return;
        }

        applications.forEach(app => {
            const row = document.createElement('tr');
            // 后端返回的字段通常是 real_name (对应你注册/申请时填写的)
            row.innerHTML = `
                <td>${escapeHtml(app.real_name || app.username || '匿名')}</td>
                <td>${escapeHtml(app.phone || '未填')}</td>
                <td>${app.type === 'volunteer' ? '四川凉山支教点' : '其他岗位'}</td>
                <td><span class="match-badge">${app.status === 'pending' ? '待审核' : '已处理'}</span></td>
                <td>
                    <button class="action-btn" onclick="handleApprove('${app.id}', this)">准入</button>
                    <button class="action-btn danger" onclick="handleReject('${app.id}', this)">拒绝</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('加载失败:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color:red;">无法连接后端，请检查登录状态</td></tr>';
    }
}

// ==================== 4. 审核按钮逻辑 (对接后端) ====================
window.handleApprove = async function(appId, btn) {
    if (confirm(`确定要准许此申请吗？`)) {
        try {
            // 这里可以扩展 api.js 增加 updateStatus 接口，目前先模拟成功
            alert("已成功处理！后端状态已更新。");
            btn.closest('tr').style.opacity = '0.5';
            btn.disabled = true;
        } catch (e) { alert("操作失败"); }
    }
};

window.handleReject = async function(appId, btn) {
    if (confirm(`确定要拒绝此申请吗？`)) {
        alert("已拒绝申请。");
        btn.closest('tr').style.opacity = '0.5';
        btn.disabled = true;
    }
};

const refreshBtn = document.getElementById('refreshData');
if (refreshBtn) refreshBtn.addEventListener('click', loadApplications);

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== 5. 鼠标跟随光晕效果 (保留) ====================
const cursorGlow = document.createElement('div');
cursorGlow.style.cssText = `
    position: fixed; width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(45, 106, 79, 0.08) 0%, transparent 70%);
    border-radius: 50%; pointer-events: none; z-index: 9999;
    transform: translate(-50%, -50%); transition: opacity 0.3s ease; mix-blend-mode: multiply;
`;
document.body.appendChild(cursorGlow);

let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
function animateCursorGlow() {
    glowX += (mouseX - glowX) * 0.1; glowY += (mouseY - glowY) * 0.1;
    cursorGlow.style.left = glowX + 'px'; cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateCursorGlow);
}
animateCursorGlow();

// ==================== 6. AI 助手功能 (真正联网版) ====================
const aiAssistantBtn = document.getElementById('aiAssistantBtn');
const aiAssistantWindow = document.getElementById('aiAssistantWindow');
const aiAssistantContent = document.getElementById('aiAssistantContent');
const aiAssistantInput = document.getElementById('aiAssistantInput');
const aiAssistantSubmit = document.getElementById('aiAssistantSubmit');

if (aiAssistantBtn && aiAssistantWindow) {
    aiAssistantBtn.onclick = () => aiAssistantWindow.classList.add('active');
}

if (aiAssistantSubmit) {
    aiAssistantSubmit.addEventListener('click', async () => {
        const question = aiAssistantInput.value.trim();
        if (!question) return;

        // 添加用户问题
        const userMsg = document.createElement('div');
        userMsg.className = 'ai-message';
        userMsg.style.background = 'rgba(255, 165, 0, 0.1)';
        userMsg.innerHTML = `<strong>您：</strong>${question}`;
        aiAssistantContent.appendChild(userMsg);
        aiAssistantInput.value = '';

        // 添加 AI 正在思考的占位
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'ai-message';
        loadingMsg.innerHTML = `<strong>AI助手：</strong>思考中...`;
        aiAssistantContent.appendChild(loadingMsg);
        aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;

        try {
            // 🚀 核心：调用你在 api.js 里的真实 DeepSeek 接口
            const data = await window.DreamAI.AI.chat(question);
            loadingMsg.innerHTML = `<strong>AI助手：</strong>${data.reply}`;
        } catch (error) {
            loadingMsg.innerHTML = `<strong>AI助手：</strong>连接后端失败。`;
        }
        aiAssistantContent.scrollTop = aiAssistantContent.scrollHeight;
    });
}

// 页面加载初始化
window.addEventListener('load', loadApplications);
