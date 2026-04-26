# 筑梦AI支教项目 - 完整开发指南

## 🎯 项目概述

筑梦AI支教是一个连接城乡教育的智慧支教生态系统，通过技术手段解决教育资源不均衡问题。

### 核心功能
- **用户认证系统**：志愿者、教师、学生、管理员多角色管理
- **申请管理系统**：志愿者申请、审核、分配流程
- **任务管理系统**：教学任务发布、申请、完成、评价
- **3D教具库**：数字化教学资源分享平台
- **AI智能助手**：支教咨询和教学辅助

## 🏗️ 技术架构

### 前端技术栈
- **HTML5/CSS3**：响应式页面设计
- **JavaScript (ES6+)**：交互逻辑
- **Google Model Viewer**：3D模型展示
- **Font Awesome**：图标库

### 后端技术栈
- **FastAPI**：高性能Python Web框架
- **MongoDB**：NoSQL数据库
- **Motor**：异步MongoDB驱动
- **JWT**：用户认证令牌
- **Pydantic**：数据验证和序列化

## 📁 项目结构

```
dream-ai-project/
├── frontend/                    # 前端代码
│   ├── index.html              # 主页面
│   ├── style.css               # 样式文件
│   ├── script.js               # 主脚本
│   ├── api.js                  # API工具库
│   ├── auth.js                 # 用户认证模块
│   ├── admin.js                # 管理员页面
│   ├── teacher.js              # 教师页面
│   ├── volunteer.js            # 志愿者页面
│   └── learning.js             # 学生页面
├── backend/                    # 后端代码
│   ├── app/                    # FastAPI应用
│   │   ├── main.py            # 应用入口
│   │   ├── config.py          # 配置管理
│   │   ├── database.py        # 数据库连接
│   │   ├── api/               # API路由
│   │   ├── models/            # 数据模型
│   │   ├── schemas/           # Pydantic模式
│   │   └── utils/             # 工具函数
│   ├── uploads/               # 文件上传目录
│   ├── logs/                  # 日志目录
│   ├── .env                   # 环境变量
│   ├── requirements.txt       # Python依赖
│   ├── start_final.py         # 启动脚本
│   └── run.py                 # 旧启动脚本
├── memory/                    # 项目记忆
├── start_all.bat             # 完整启动脚本
└── README_FINAL.md           # 本文件
```

## 🚀 快速启动

### 方法一：使用启动脚本（推荐）
双击运行 `start_all.bat`，自动启动所有服务。

### 方法二：手动启动

#### 1. 启动后端
```bash
cd backend
"C:\Users\cmcm\AppData\Local\Programs\Python\Python313\python.exe" start_final.py
```

#### 2. 启动前端
```bash
cd frontend
python -m http.server 5500
```

#### 3. 访问应用
- 前端页面：http://localhost:5500
- API文档：http://localhost:8000/docs
- 健康检查：http://localhost:8000/api/health

## 🔧 开发指南

### 前端开发

#### API调用示例
```javascript
// 用户注册
const result = await window.DreamAI.Auth.register({
    email: 'user@example.com',
    username: 'testuser',
    password: 'Test123456',
    role: 'volunteer'
});

// 用户登录
const loginResult = await window.DreamAI.Auth.login('user@example.com', 'Test123456');

// 获取当前用户
const user = await window.DreamAI.Auth.getCurrentUser();

// 创建申请
const application = await window.DreamAI.Applications.createApplication({
    type: 'volunteer',
    title: '数学辅导志愿者申请',
    description: '我有5年数学教学经验...',
    skills: ['数学教学', '在线辅导']
});

// 上传文件
const fileResult = await window.DreamAI.Upload.uploadFile(file, 'image');
```

#### 用户状态管理
```javascript
// 检查登录状态
if (window.AuthManager.isLoggedIn()) {
    const user = window.AuthManager.getUser();
    console.log(`欢迎, ${user.username} (${user.role})`);
}

// 检查权限
if (window.AuthManager.hasRole('admin')) {
    // 管理员功能
}

// 监听用户状态变化
// 用户登录/退出时会自动更新UI
```

### 后端开发

#### 添加新API端点
1. 在 `app/api/` 创建新文件，如 `notifications.py`
2. 定义路由和业务逻辑
3. 在 `app/main.py` 中注册路由

#### 数据模型定义
```python
# 在 app/models/ 中定义MongoDB模型
# 在 app/schemas/ 中定义Pydantic模式
```

#### 环境配置
修改 `backend/.env` 文件：
```env
# 服务器配置
APP_NAME="筑梦AI支教"
DEBUG=true
PORT=8000

# 数据库配置
MONGODB_URI="mongodb://localhost:27017/dream-ai"

# JWT配置
SECRET_KEY="your-secret-key-change-this"
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS配置
CORS_ORIGINS='["http://localhost:5500","http://127.0.0.1:5500"]'
```

## 📡 API文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户
- `PUT /api/auth/me` - 更新用户信息

### 申请管理
- `GET /api/applications/` - 获取申请列表
- `POST /api/applications/` - 创建申请
- `GET /api/applications/{id}` - 获取单个申请
- `PUT /api/applications/{id}` - 更新申请
- `POST /api/applications/{id}/review` - 审核申请

### 任务管理
- `GET /api/tasks/` - 获取任务列表
- `POST /api/tasks/` - 创建任务
- `GET /api/tasks/{id}` - 获取单个任务
- `POST /api/tasks/{id}/apply` - 申请任务
- `POST /api/tasks/{id}/complete` - 完成任务

### 文件上传
- `POST /api/upload/single` - 上传单个文件
- `POST /api/upload/multiple` - 上传多个文件
- `POST /api/upload/avatar` - 上传头像

## 🗄️ 数据库设计

### 集合结构
1. **users** - 用户信息
2. **applications** - 申请记录
3. **tasks** - 任务信息
4. **task_applications** - 任务申请记录

### 索引优化
- 用户邮箱、用户名唯一索引
- 申请状态、类型索引
- 任务状态、优先级索引
- 创建时间倒序索引

## 🧪 测试

### 后端测试
```bash
cd backend
python -m pytest tests/
```

### API测试
使用浏览器访问：http://localhost:8000/docs
- 测试用户注册
- 测试用户登录
- 测试申请创建
- 测试任务发布

## 🚢 部署

### 开发环境
```bash
# 使用启动脚本
start_all.bat

# 或手动启动
cd backend && python start_final.py
cd frontend && python -m http.server 5500
```

### 生产环境
1. 安装MongoDB数据库
2. 配置生产环境变量
3. 使用Gunicorn部署FastAPI
4. 使用Nginx反向代理
5. 配置SSL证书

## 🔍 故障排除

### 常见问题

#### 1. 后端启动失败
```bash
# 检查Python版本
python --version

# 检查依赖
pip list | findstr fastapi

# 检查端口占用
netstat -ano | findstr :8000
```

#### 2. 前端无法连接后端
```bash
# 检查后端是否运行
curl http://localhost:8000/api/health

# 检查CORS配置
# 确保前端地址在CORS_ORIGINS中
```

#### 3. 数据库连接失败
```bash
# 检查MongoDB服务
mongosh --eval "db.adminCommand('ping')"

# 或使用Docker
docker run -d -p 27017:27017 mongo:latest
```

#### 4. 中文显示乱码
- 确保响应头包含 `charset=utf-8`
- 检查前端页面编码设置
- 验证JSON序列化配置

### 日志查看
- 后端日志：终端输出
- 前端日志：浏览器开发者工具
- 数据库日志：MongoDB日志文件

## 📞 技术支持

### 获取帮助
1. 查看API文档：http://localhost:8000/docs
2. 检查项目记忆：`memory/` 目录
3. 查看错误日志
4. 联系开发团队

### 报告问题
提供以下信息：
1. 错误信息截图
2. 复现步骤
3. 环境信息
4. 期望结果

## 🎉 项目状态

### 已完成
- ✅ 前后端分离架构
- ✅ 用户认证系统
- ✅ 申请管理功能
- ✅ 任务管理功能
- ✅ 文件上传功能
- ✅ 3D模型展示
- ✅ API文档
- ✅ 完整测试环境

### 进行中
- 🔄 数据库优化
- 🔄 前端界面完善
- 🔄 性能测试
- 🔄 安全加固

### 计划中
- 📋 实时聊天功能
- 📋 在线课堂系统
- 📋 移动端适配
- 📋 数据分析面板

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和测试人员！

---

**最后更新**：2026年4月22日  
**项目版本**：v1.0.0  
**状态**：✅ 可运行，功能完整