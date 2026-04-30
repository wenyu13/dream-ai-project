/**
 * 筑梦AI支教项目 - 前端API工具
 * 连接FastAPI后端服务
 */

const API_BASE = 'http://localhost:8000/api';

// 存储token
let accessToken = localStorage.getItem('access_token');

// 更新token
function updateToken(token) {
    accessToken = token;
    if (token) {
        localStorage.setItem('access_token', token);
    } else {
        localStorage.removeItem('access_token');
    }
}

// 通用请求函数
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json; charset=utf-8'
    };
    
    if (accessToken) {
        defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };
    
    try {
        const response = await fetch(url, config);
        
        // 处理响应
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `请求失败: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

// 用户认证API
const AuthAPI = {
    // 用户注册
    async register(userData) {
        return await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    
    // 用户登录
    async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || '登录失败');
        }
        
        const data = await response.json();
        updateToken(data.access_token);
        return data;
    },
    
    // 获取当前用户信息
    async getCurrentUser() {
        return await apiRequest('/auth/me');
    },
    
    // 更新用户信息
    async updateUser(userData) {
        return await apiRequest('/auth/me', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },
    
    // 退出登录
    logout() {
        updateToken(null);
        localStorage.removeItem('user');
    },
    
    // 检查是否已登录
    isLoggedIn() {
        return !!accessToken;
    }
};

// 申请管理API
const ApplicationsAPI = {
    // 获取申请列表
    async getApplications(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await apiRequest(`/applications/?${query}`);
    },
    
    // 创建申请
    async createApplication(applicationData) {
        return await apiRequest('/applications/', {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    },
    
    // 获取单个申请
    async getApplication(id) {
        return await apiRequest(`/applications/${id}`);
    },
    
    // 更新申请
    async updateApplication(id, updateData) {
        return await apiRequest(`/applications/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    },
    
    // 撤回申请
    async withdrawApplication(id) {
        return await apiRequest(`/applications/${id}/withdraw`, {
            method: 'POST'
        });
    }
};

// 任务管理API
const TasksAPI = {
    // 获取任务列表
    async getTasks(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await apiRequest(`/tasks/?${query}`);
    },
    
    // 创建任务
    async createTask(taskData) {
        return await apiRequest('/tasks/', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    },
    
    // 获取单个任务
    async getTask(id) {
        return await apiRequest(`/tasks/${id}`);
    },
    
    // 申请任务
    async applyForTask(id, applicationData) {
        return await apiRequest(`/tasks/${id}/apply`, {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    },
    
    // 完成任务
    async completeTask(id, completionData) {
        return await apiRequest(`/tasks/${id}/complete`, {
            method: 'POST',
            body: JSON.stringify(completionData)
        });
    },
    
    // 获取用户参与的任务
    async getUserTasks(userId) {
        return await apiRequest(`/tasks/user/${userId}/assigned`);
    },
    
    // 获取用户创建的任务
    async getUserCreatedTasks(userId) {
        return await apiRequest(`/tasks/user/${userId}/created`);
    }
};

// 文件上传API
const UploadAPI = {
    // 上传单个文件
    async uploadFile(file, fileType = null) {
        const formData = new FormData();
        formData.append('file', file);
        if (fileType) {
            formData.append('file_type', fileType);
        }
        
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE}/upload/single`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || '文件上传失败');
        }
        
        return await response.json();
    },
    
    // 上传头像
    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE}/upload/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        return await response.json();
    }
};

// 工具函数
const APIUtils = {
    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // 获取用户角色中文名
    getRoleName(role) {
        const roles = {
            'admin': '管理员',
            'teacher': '教师',
            'volunteer': '志愿者',
            'student': '学生'
        };
        return roles[role] || role;
    },
    
    // 获取申请状态中文名
    getApplicationStatusName(status) {
        const statuses = {
            'pending': '待审核',
            'reviewing': '审核中',
            'approved': '已通过',
            'rejected': '已拒绝',
            'withdrawn': '已撤回'
        };
        return statuses[status] || status;
    },
    
    // 获取任务状态中文名
    getTaskStatusName(status) {
        const statuses = {
            'draft': '草稿',
            'published': '已发布',
            'in_progress': '进行中',
            'completed': '已完成',
            'cancelled': '已取消'
        };
        return statuses[status] || status;
    },
    
    // 获取任务优先级中文名
    getTaskPriorityName(priority) {
        const priorities = {
            'low': '低',
            'medium': '中',
            'high': '高',
            'urgent': '紧急'
        };
        return priorities[priority] || priority;
    }
};

// 导出所有API
window.DreamAI = {
    Auth: AuthAPI,
    Applications: ApplicationsAPI,
    Tasks: TasksAPI,
    Upload: UploadAPI,
    Utils: APIUtils,
    
    // 工具函数
    setToken: updateToken,
    getToken: () => accessToken,
    clearToken: () => updateToken(null)
};

console.log('✅ 筑梦AI支教API工具已加载');
