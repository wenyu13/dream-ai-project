from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings
import asyncio
from typing import Optional
from .utils.security import get_password_hash
import copy
import uuid
from datetime import datetime

client: Optional[AsyncIOMotorClient] = None
db = None

# 内存模式存储
_mock_stores = {}


# 预置用户账号（用于内存模式）
DEFAULT_USERS = [
    {
        "email": "admin@dreamai.cn",
        "username": "admin",
        "hashed_password": get_password_hash("Admin123456"),
        "full_name": "系统管理员",
        "role": "admin",
        "phone": None,
        "avatar": None,
        "bio": "系统管理员",
        "is_active": True,
        "is_verified": True,
    },
    {
        "email": "volunteer@dreamai.cn",
        "username": "volunteer",
        "hashed_password": get_password_hash("Vol123456"),
        "full_name": "志愿者小王",
        "role": "volunteer",
        "phone": None,
        "avatar": None,
        "bio": "热心公益的支教志愿者",
        "is_active": True,
        "is_verified": True,
    },
    {
        "email": "teacher@dreamai.cn",
        "username": "teacher",
        "hashed_password": get_password_hash("Tea123456"),
        "full_name": "教师张老师",
        "role": "teacher",
        "phone": None,
        "avatar": None,
        "bio": "乡村学校教师",
        "is_active": True,
        "is_verified": True,
    },
    {
        "email": "student@dreamai.cn",
        "username": "student",
        "hashed_password": get_password_hash("Stu123456"),
        "full_name": "学生小李",
        "role": "student",
        "phone": None,
        "avatar": None,
        "bio": "大山里的孩子",
        "is_active": True,
        "is_verified": True,
    },
]


async def connect_to_mongo():
    """连接MongoDB数据库"""
    global client, db
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
        # 测试连接
        await asyncio.wait_for(client.admin.command('ping'), timeout=3)
        
        # 获取或创建数据库
        db_name = settings.MONGODB_URI.split('/')[-1].split('?')[0]
        if db_name:
            db = client[db_name]
        else:
            db = client.dream_ai
        
        print(f"✅ MongoDB连接成功 - 数据库: {db.name}")
        
        # 创建索引
        await create_indexes()
        
    except Exception as e:
        print(f"⚠️  MongoDB连接失败: {e}")
        print("⚠️  使用内存模式（仅测试）")
        # 清除旧数据
        _mock_stores.clear()
        
        class MockCollection:
            def __init__(self, name):
                self._name = name
                if name not in _mock_stores:
                    _mock_stores[name] = []
            
            async def find_one(self, filter=None, *args, **kwargs):
                if not filter:
                    return None
                for doc in _mock_stores.get(self._name, []):
                    if self._matches(filter, doc):
                        return copy.deepcopy(doc)
                return None
            
            def _matches(self, filter, doc):
                for k, v in filter.items():
                    if k == "$or":
                        if not v:
                            return False
                        matched_any = False
                        for sub_filter in v:
                            if self._matches(sub_filter, doc):
                                matched_any = True
                                break
                        if not matched_any:
                            return False
                    elif k == "$and":
                        for sub_filter in v:
                            if not self._matches(sub_filter, doc):
                                return False
                    elif k not in doc or doc[k] != v:
                        return False
                return True
            
            async def insert_one(self, document, *args, **kwargs):
                import uuid
                doc = copy.deepcopy(document)
                doc["_id"] = str(uuid.uuid4())
                _mock_stores.setdefault(self._name, []).append(doc)
                class Result:
                    inserted_id = doc["_id"]
                return Result()
            
            async def update_one(self, filter, update, *args, **kwargs):
                docs = _mock_stores.get(self._name, [])
                found = None
                for doc in docs:
                    match = True
                    for k, v in filter.items():
                        if k not in doc or doc[k] != v:
                            match = False
                            break
                    if match:
                        found = doc
                        break
                if found and "$set" in update:
                    found.update(update["$set"])
                class Result:
                    modified_count = 1 if found else 0
                return Result()
            
            async def find(self, filter=None, *args, **kwargs):
                docs = _mock_stores.get(self._name, [])
                if filter:
                    results = []
                    for doc in docs:
                        if self._matches(filter, doc):
                            results.append(copy.deepcopy(doc))
                    return FakeCursor(results)
                return FakeCursor(copy.deepcopy(docs))
            
            async def count_documents(self, filter=None, *args, **kwargs):
                docs = _mock_stores.get(self._name, [])
                if filter:
                    count = 0
                    for doc in docs:
                        if self._matches(filter, doc):
                            count += 1
                    return count
                return len(docs)
            
            async def delete_one(self, filter=None, *args, **kwargs):
                docs = _mock_stores.get(self._name, [])
                before = len(docs)
                if filter:
                    _mock_stores[self._name] = [d for d in docs if not self._matches(filter, d)]
                class Result:
                    deleted_count = before - len(_mock_stores.get(self._name, []))
                return Result()
            
            async def create_index(self, *args, **kwargs): pass
        
        class FakeCursor:
            def __init__(self, items):
                self._items = items
                self._skip_val = 0
                self._limit_val = None
            
            def skip(self, n):
                self._skip_val = n
                return self
            
            def limit(self, n):
                self._limit_val = n
                return self
            
            def sort(self, *args, **kwargs):
                return self
            
            def to_list(self, length=None):
                items = self._items[self._skip_val:]
                if length:
                    items = items[:length]
                return items
            
            def __aiter__(self):
                return self._async_gen()
            
            async def _async_gen(self):
                for item in self._items[self._skip_val:(self._limit_val or len(self._items))]:
                    yield item
        
        class MockDB:
            name = "mock_database"
            def __init__(self):
                self._collections = {}
            
            async def command(self, *args, **kwargs):
                return {"ok": 1}
            
            def __getattr__(self, name):
                if name not in self._collections:
                    self._collections[name] = MockCollection(name)
                return self._collections[name]
        
        db = MockDB()
        
        # 插入预置用户
        from datetime import datetime
        users_store = _mock_stores.setdefault("users", [])
        for user_data in DEFAULT_USERS:
            user = dict(user_data)
            user["_id"] = str(uuid.uuid4())
            user["created_at"] = datetime.utcnow().isoformat()
            user["updated_at"] = datetime.utcnow().isoformat()
            users_store.append(user)
            print(f"  ✅ 预置账号: {user['username']} ({user['role']})")
    
    return db


async def create_indexes():
    """创建数据库索引"""
    if not hasattr(db, 'command') or db.name == "mock_database":
        print("⏩  跳过索引创建（内存模式）")
        return
    try:
        # 用户集合索引
        await db.users.create_index("email", unique=True)
        await db.users.create_index("username", unique=True)
        await db.users.create_index("role")
        await db.users.create_index("created_at")
        
        # 申请集合索引
        await db.applications.create_index("user_id")
        await db.applications.create_index("status")
        await db.applications.create_index("type")
        await db.applications.create_index("created_at")
        
        # 任务集合索引
        await db.tasks.create_index("creator_id")
        await db.tasks.create_index("status")
        await db.tasks.create_index("type")
        await db.tasks.create_index("priority")
        await db.tasks.create_index("participants")
        await db.tasks.create_index("created_at")
        
        # 任务申请集合索引
        await db.task_applications.create_index("task_id")
        await db.task_applications.create_index("user_id")
        await db.task_applications.create_index("status")
        await db.task_applications.create_index("applied_at")
        
        print("✅ 数据库索引创建完成")
    except Exception as e:
        print(f"⚠️  索引创建失败: {e}")


async def close_mongo_connection():
    """关闭MongoDB连接"""
    if client and hasattr(client, 'close'):
        client.close()
        print("✅ MongoDB连接已关闭")


def get_database():
    """获取数据库实例"""
    return db


def get_collection(collection_name):
    """获取集合实例"""
    if db:
        return db[collection_name]
    return None