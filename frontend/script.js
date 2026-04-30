// 1. 鼠标跟随光晕
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
cursorGlow.style.cssText = "position:fixed; width:300px; height:300px; background:radial-gradient(circle, rgba(45,106,79,0.08) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%);";
document.body.appendChild(cursorGlow);
document.addEventListener('mousemove', (e) => { cursorGlow.style.left = e.clientX + 'px'; cursorGlow.style.top = e.clientY + 'px'; });

// 2. 滚动揭幕
function reveal() {
    document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) el.classList.add("active");
    });
}
window.addEventListener("scroll", reveal);

// 3. 数字跳动
function animateCounters() {
    document.querySelectorAll('.counter').forEach(c => {
        const target = +c.dataset.target;
        let count = 0;
        const update = () => {
            count += target / 50;
            if (count < target) { c.innerText = Math.ceil(count); setTimeout(update, 20); }
            else c.innerText = target;
        };
        update();
    });
}

// 4. 弹窗控制
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

window.addEventListener('load', () => { reveal(); animateCounters(); });
