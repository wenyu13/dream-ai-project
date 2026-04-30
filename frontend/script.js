// 弹窗控制逻辑
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
}
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

// 核心：揭幕逻辑（修复白屏）
function reveal() {
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((element) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - 50) {
            element.classList.add("active");
        }
    });
}

// 确保页面加载后强行显示前几个元素
window.addEventListener('load', () => {
    console.log("🚀 正在激活页面内容...");
    reveal(); 
    // 保底：500毫秒后强行把最上面的内容变亮，防止卡死
    setTimeout(() => {
        const firstBatch = document.querySelectorAll('.reveal');
        for(let i=0; i<5; i++) {
            if(firstBatch[i]) firstBatch[i].classList.add('active');
        }
    }, 500);
});

window.addEventListener("scroll", reveal);

// 绑定登录注册（增加空值判断，防止报错）
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginBtn')?.addEventListener('click', () => openModal('loginModal'));
    document.getElementById('registerBtn')?.addEventListener('click', () => openModal('registerModal'));
    
    // AI 助手逻辑
    const aiSubmit = document.getElementById('aiAssistantSubmit');
    if (aiSubmit) {
        aiSubmit.onclick = async () => {
            const input = document.getElementById('aiAssistantInput');
            const content = document.getElementById('aiAssistantContent');
            if (!input || !input.value.trim()) return;
            // ... (这里保留你之前的 AI 聊天逻辑)
        };
    }
});
