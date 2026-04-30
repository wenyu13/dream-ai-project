<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>微光循迹 - 智慧支教生态系统</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-green: #2d6a4f;
            --accent-orange: #ff9f1c;
            --soft-green: #d8f3dc;
            --text-main: #1b4332;
            --glass: rgba(255, 255, 255, 0.85);
            --bg-light: #f4f7f5;
            --danger-red: #991b1b;
            --card-shadow: 0 10px 30px rgba(45, 106, 79, 0.08);

            --sunrise-gold: #fff7ed;
            --sunrise-amber: #ffedd5;
            --sunrise-text: #451a03;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: "PingFang SC", "Microsoft YaHei", sans-serif; }

        html { scroll-behavior: smooth; }

        body {
            background: var(--bg-light);
            color: var(--text-main);
            overflow-x: hidden;
            line-height: 1.6;
            cursor: default;
        }

        .bg-glow { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
        .firefly {
            position: absolute; width: 4px; height: 4px; background: var(--accent-orange);
            border-radius: 50%; filter: blur(2px); opacity: 0.3; animation: move 20s infinite linear;
        }
        @keyframes move {
            0% { transform: translate(0, 0); opacity: 0; }
            50% { opacity: 0.6; }
            100% { transform: translate(100vw, 100vh); opacity: 0; }
        }

        nav {
            display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 8%;
            background: var(--glass); backdrop-filter: blur(15px); position: sticky; top: 0; z-index: 100;
            border-bottom: 1px solid rgba(45, 106, 79, 0.05);
        }
        .brand { font-size: 1.5rem; font-weight: 800; color: var(--primary-green); letter-spacing: 1px; }
        .nav-links a { text-decoration: none; color: var(--text-main); margin-left: 2rem; font-weight: 500; transition: 0.3s; }
        .nav-links a:hover { color: var(--accent-orange); }

        .hero-section {
            min-height: 85vh; padding: 100px 8%; display: flex; align-items: center; justify-content: center; text-align: center; position: relative;
            background: 
                url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="%23ffedd5" fill-opacity="0.4" d="M0,224L60,202.7C120,181,240,139,360,138.7C480,139,600,181,720,208C840,235,960,245,1080,224C1200,203,1320,149,1380,122.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>'),
                linear-gradient(180deg, var(--sunrise-gold) 0%, #ffffff 100%);
            background-position: bottom; background-repeat: no-repeat; background-size: 100% 400px, 100% 100%; overflow: hidden;
        }

        .hero-content { position: relative; z-index: 1; max-width: 900px; }
        .hero-main-title { font-size: 3.8rem; font-weight: 900; color: var(--sunrise-text); margin-bottom: 25px; line-height: 1.2; }
        .hero-main-title span { color: var(--primary-green); }
        .hero-subtitle { font-size: 1.5rem; font-weight: 500; color: #78350f; margin-bottom: 50px; opacity: 0.8; }
        .hero-btn { display: inline-block; padding: 1.1rem 3.5rem; border-radius: 50px; background: var(--primary-green); color: white; text-decoration: none; font-weight: 700; font-size: 1.2rem; transition: 0.4s; box-shadow: 0 15px 35px rgba(45, 106, 79, 0.2); border: none; cursor: pointer; }
        .hero-btn:hover { background: var(--accent-orange); transform: scale(1.05); }

        .section-header { text-align: center; margin-bottom: 60px; }
        .section-header h2 { font-size: 2.4rem; color: var(--primary-green); margin-bottom: 15px; font-weight: 800; }
        .section-header .line { width: 60px; height: 4px; background: var(--accent-orange); margin: 0 auto; border-radius: 2px; }
        .section-header p { color: #666; margin-top: 20px; font-size: 1.1rem; }

        .container { max-width: 1300px; margin: 0 auto; padding: 100px 5%; }
        .reveal { opacity: 0; transform: translateY(30px); transition: 0.8s all ease; }
        .reveal.active { opacity: 1; transform: translateY(0); }

        .portal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem; }
        .portal-card { background: white; border-radius: 2.5rem; padding: 4rem 2rem; text-align: center; transition: 0.5s; border: 1px solid rgba(45, 106, 79, 0.05); box-shadow: var(--card-shadow); }
        .portal-card:hover { transform: translateY(-15px); border-color: var(--accent-orange); }

        .jobs-section { background: white; border-radius: 4rem 4rem 0 0; }
        .jobs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
        .job-card { background: var(--bg-light); border-radius: 20px; padding: 35px; display: flex; justify-content: space-between; align-items: center; border-left: 6px solid var(--danger-red); transition: 0.4s; }
        .job-card:hover { transform: scale(1.02); }

        .tools-section { background: linear-gradient(180deg, #fff 0%, var(--soft-green) 100%); }
        .tools-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 35px; }
        .tool-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border-radius: 30px; padding: 30px; text-align: center; border: 1px solid white; transition: 0.4s; }

        /* 3D 查看器弹窗样式 - 保持原样 */
        .model-viewer-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(10px); z-index: 20000; justify-content: center; align-items: center; }
        .model-viewer-modal.active { display: flex; }
        .model-viewer-content { background: var(--glass); backdrop-filter: blur(20px); border-radius: 20px; width: 95%; max-width: 1200px; display: flex; flex-direction: column; overflow: hidden; }
        .model-viewer-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; background: linear-gradient(135deg, var(--soft-green) 0%, #fff 100%); }
        model-viewer { width: 100%; height: 500px; display: block; }
        .model-viewer-info { background: var(--sunrise-gold); padding: 20px; border-top: 2px solid var(--soft-green); }

        /* AI 窗口样式 */
        .ai-assistant-window { position: fixed; top: 0; right: -400px; width: 400px; height: 100vh; background: var(--glass); backdrop-filter: blur(20px); box-shadow: -5px 0 30px rgba(0, 0, 0, 0.1); z-index: 1001; transition: 0.4s; display: flex; flex-direction: column; }
        .ai-assistant-window.active { right: 0; }

        footer { text-align: center; padding: 5rem; background: var(--text-main); color: #88bd9e; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="bg-glow"><div class="firefly" style="top: 15%; left: 8%;"></div></div>
    <nav>
        <div class="brand">微光循迹</div>
        <div class="nav-links">
            <a href="#">首页</a><a href="#jobs">寻找岗位</a><a href="#tools">3D教具库</a>
            <div id="guestNav" style="display:inline-block;">
                <button class="hero-btn" onclick="openModal('loginModal')" style="padding: 7px 20px; font-size: 0.9rem; margin-left: 10px;">登录</button>
            </div>
            <div id="userNav" style="display:none; align-items:center; gap:15px; margin-left:20px;">
                <a href="volunteer.html" style="font-weight:bold; color:var(--primary-green);">工作台</a>
                <button onclick="localStorage.clear(); location.reload();" style="border:none; background:none; color:red; cursor:pointer;">退出</button>
            </div>
        </div>
    </nav>

    <section class="hero-section">
        <div class="hero-content">
            <h1 class="hero-main-title">用<span>科技</span>点亮<span>大山</span>的晨曦</h1>
            <p class="hero-subtitle">微光循迹：赋能乡村振兴的数字化志愿服务交互平台</p>
            <a href="#portals" class="hero-btn">开启支教之旅</a>
        </div>
    </section>

    <!-- 这里就是你最完整的内容区块 -->
    <section id="portals" class="container">
        <div class="section-header reveal"><h2>谁在参与微光？</h2><div class="line"></div></div>
        <div class="portal-grid">
            <div class="portal-card reveal"><div class="icon-box" style="margin: 0 auto 2rem;"><svg viewBox="0 0 24 24" width="45"><path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.41,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.59,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" fill="var(--primary-green)"/></svg></div><h3>志愿者入口</h3><a href="volunteer.html" class="hero-btn" style="padding:10px 25px; margin-top:20px; font-size:1rem;">进入</a></div>
            <div class="portal-card reveal"><div class="icon-box" style="margin: 0 auto 2rem;"><svg viewBox="0 0 24 24" width="45"><path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" fill="var(--primary-green)"/></svg></div><h3>教师管理端</h3><a href="teacher.html" class="hero-btn" style="padding:10px 25px; margin-top:20px; font-size:1rem;">进入</a></div>
            <div class="portal-card reveal"><div class="icon-box" style="margin: 0 auto 2rem;"><svg viewBox="0 0 24 24" width="45"><path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" fill="var(--primary-green)"/></svg></div><h3>学生学习端</h3><a href="learning.html" class="hero-btn" style="padding:10px 25px; margin-top:20px; font-size:1rem;">进入</a></div>
        </div>
    </section>

    <section id="stats" class="container" style="background: linear-gradient(135deg, var(--soft-green) 0%, #fff 100%); border-radius: 3rem;">
        <div class="section-header reveal"><h2>成就数据</h2><div class="line"></div></div>
        <div class="portal-grid">
            <div class="reveal" style="text-align:center;"><div class="counter" style="font-size:3rem; font-weight:bold; color:var(--primary-green);" data-target="1520">0</div><p>志愿者参与</p></div>
            <div class="reveal" style="text-align:center;"><div class="counter" style="font-size:3rem; font-weight:bold; color:var(--primary-green);" data-target="86">0</div><p>合作学校</p></div>
            <div class="reveal" style="text-align:center;"><div class="counter" style="font-size:3rem; font-weight:bold; color:var(--primary-green);" data-target="12500">0</div><p>受益学生</p></div>
        </div>
    </section>

    <section id="tools" class="tools-section container">
        <div class="section-header reveal"><h2>数字化教具库</h2><div class="line"></div></div>
        <div class="tools-grid">
            <div class="tool-card reveal"><h3>斯特林发动机</h3><button class="hero-btn tool-btn">3D 预览</button></div>
            <div class="tool-card reveal"><h3>平面四连杆机构</h3><button class="hero-btn tool-btn">3D 预览</button></div>
            <div class="tool-card reveal"><h3>AI 巡检机器人</h3><button class="hero-btn tool-btn">3D 预览</button></div>
        </div>
    </section>

    <!-- 弹窗合集 -->
    <div class="model-viewer-modal" id="loginModal">
        <div class="modal-content" style="max-width:400px; padding:30px;">
            <h3>用户登录</h3><br>
            <input type="email" id="loginEmail" placeholder="邮箱" style="width:100%; padding:10px; margin-bottom:15px; border-radius:10px; border:1px solid #ddd;">
            <input type="password" id="loginPassword" placeholder="密码" style="width:100%; padding:10px; margin-bottom:15px; border-radius:10px; border:1px solid #ddd;">
            <button class="hero-btn" id="doLogin" style="width:100%;">登录</button>
            <button onclick="closeModal('loginModal')" style="width:100%; margin-top:10px; border:none; background:none; cursor:pointer;">取消</button>
        </div>
    </div>

    <div class="model-viewer-modal" id="modelViewerModal">
        <div class="model-viewer-content">
            <div class="model-viewer-header"><h3>3D 模型查看器</h3><button onclick="closeModal('modelViewerModal')" style="background:none; border:none; font-size:2rem; cursor:pointer;">✕</button></div>
            <div class="model-viewer-body">
                <model-viewer id="modelViewer" src="" auto-rotate camera-controls camera-orbit="45deg 75deg auto" min-camera-orbit="auto auto 0.05m" max-camera-orbit="auto auto 50m" field-of-view="auto" exposure="1.2"></model-viewer>
                <div class="model-viewer-info"><p>模型名称：<span id="modelName">-</span></p><p>操作：鼠标拖拽旋转 | 滚轮缩放</p></div>
            </div>
        </div>
    </div>

    <!-- AI 助手 -->
    <div id="aiAssistantBtn" onclick="openModal('aiAssistantWindow')" style="position:fixed; bottom:30px; right:30px; background:var(--primary-green); width:60px; height:60px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:999;"><i class="fas fa-comment-dots" style="color:white; font-size:1.5rem;"></i></div>
    <div class="ai-assistant-window" id="aiAssistantWindow">
        <div style="background:var(--primary-green); color:white; padding:20px; display:flex; justify-content:space-between;"><h3>AI 助手</h3><button onclick="closeModal('aiAssistantWindow')" style="background:none; border:none; color:white; cursor:pointer;">✕</button></div>
        <div id="aiAssistantContent" style="flex:1; padding:20px; overflow-y:auto; background:#f9f9f9;"><div>你好！我是微光AI。</div></div>
        <div style="padding:15px; border-top:1px solid #eee; display:flex; gap:10px;"><input type="text" id="aiAssistantInput" style="flex:1; padding:10px; border:1px solid #ddd; border-radius:10px;" placeholder="问点什么..."><button id="aiAssistantSubmit" style="background:var(--primary-green); color:white; border:none; padding:10px; border-radius:10px; cursor:pointer;">发送</button></div>
    </div>

    <footer><p>© 2026 微光循迹 · 用科技点亮大山的晨曦 </p></footer>

    <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
    <script src="api.js?v=final"></script>
    <script src="auth.js?v=final"></script>
    <script src="script.js?v=final"></script>
</body>
</html>
