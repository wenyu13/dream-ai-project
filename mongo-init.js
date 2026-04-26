// MongoDB初始化脚本
// 在容器首次启动时执行

// 切换到目标数据库
db = db.getSiblingDB('dream-ai');

// 创建应用管理员用户
db.createUser({
  user: 'app_admin',
  pwd: 'app_admin_123',
  roles: [
    { role: 'readWrite', db: 'dream-ai' },
    { role: 'dbAdmin', db: 'dream-ai' }
  ]
});

// 创建索引
print('创建用户集合索引...');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ created_at: -1 });

print('创建申请集合索引...');
db.applications.createIndex({ user_id: 1 });
db.applications.createIndex({ status: 1 });
db.applications.createIndex({ type: 1 });
db.applications.createIndex({ created_at: -1 });

print('创建任务集合索引...');
db.tasks.createIndex({ creator_id: 1 });
db.tasks.createIndex({ status: 1 });
db.tasks.createIndex({ type: 1 });
db.tasks.createIndex({ priority: 1 });
db.tasks.createIndex({ participants: 1 });
db.tasks.createIndex({ created_at: -1 });

print('创建任务申请集合索引...');
db.task_applications.createIndex({ task_id: 1 });
db.task_applications.createIndex({ user_id: 1 });
db.task_applications.createIndex({ status: 1 });
db.task_applications.createIndex({ applied_at: -1 });

// 插入初始管理员用户（可选）
print('插入初始管理员用户...');
const adminUserId = new ObjectId();
const hashedPassword = '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'; // "admin123"

try {
  db.users.insertOne({
    _id: adminUserId,
    email: 'admin@dream-ai.org',
    username: 'admin',
    full_name: '系统管理员',
    hashed_password: hashedPassword,
    role: 'admin',
    phone: '+8613800138000',
    avatar: null,
    bio: '系统管理员账户',
    is_active: true,
    is_verified: true,
    reward_points: 0,
    created_at: new Date(),
    updated_at: new Date()
  });
  print('✅ 初始管理员用户创建成功');
} catch (e) {
  print('⚠️  初始管理员用户可能已存在: ' + e.message);
}

// 插入示例数据（开发环境）
if (process.env.NODE_ENV === 'development') {
  print('插入示例数据...');
  
  // 示例教师用户
  const teacherUserId = new ObjectId();
  db.users.insertOne({
    _id: teacherUserId,
    email: 'teacher@example.com',
    username: 'teacher_li',
    full_name: '李老师',
    hashed_password: hashedPassword,
    role: 'teacher',
    phone: '+8613800138001',
    avatar: null,
    bio: '数学教师，10年教学经验',
    is_active: true,
    is_verified: true,
    reward_points: 500,
    created_at: new Date(),
    updated_at: new Date()
  });
  
  // 示例志愿者用户
  const volunteerUserId = new ObjectId();
  db.users.insertOne({
    _id: volunteerUserId,
    email: 'volunteer@example.com',
    username: 'volunteer_wang',
    full_name: '王志愿者',
    hashed_password: hashedPassword,
    role: 'volunteer',
    phone: '+8613800138002',
    avatar: null,
    bio: '大学生志愿者，热爱教育',
    is_active: true,
    is_verified: true,
    reward_points: 200,
    created_at: new Date(),
    updated_at: new Date()
  });
  
  // 示例任务
  db.tasks.insertOne({
    creator_id: teacherUserId.toString(),
    title: '初中数学在线辅导',
    description: '为偏远地区初中生提供数学在线辅导，每周2次，每次1小时。需要志愿者有初中数学教学经验。',
    type: 'tutoring',
    priority: 'high',
    skills_required: ['数学教学', '在线辅导', '初中数学'],
    estimated_hours: 20,
    deadline: new Date('2024-12-31T23:59:59Z'),
    location: '在线',
    is_remote: true,
    max_participants: 3,
    reward_points: 100,
    tags: ['数学', '初中', '在线'],
    attachments: [],
    status: 'published',
    participants: [],
    created_at: new Date(),
    updated_at: new Date()
  });
  
  print('✅ 示例数据插入完成');
}

print('🎉 MongoDB初始化完成！');