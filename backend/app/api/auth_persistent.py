"""
持久化的认证API，使用文件存储用户数据
"""

import os
import json
import uuid
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional

from ..schemas.user import UserCreate, UserResponse, Token
from ..utils.security import create_access_token, verify_password, get_password_hash

router = APIRouter(prefix="/auth", tags=["认证"])

# 用户数据文件路径
USERS_FILE = "users_data.json"

def load_users():
    """从文件加载用户数据"""
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_users(users):
    """保存用户数据到文件"""
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=2, default=str)

@router.post("/register-persistent", response_model=UserResponse)
async def register_persistent(user_data: UserCreate):
    """持久化的用户注册"""
    
    # 加载现有用户
    users_db = load_users()
    
    # 检查用户是否已存在
    for user_id, user in users_db.items():
        if user["email"] == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被注册"
            )
        if user["username"] == user_data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已被使用"
            )
    
    # 创建用户
    user_id = str(uuid.uuid4())
    user_dict = user_data.dict()
    user_dict["hashed_password"] = get_password_hash(user_data.password)
    del user_dict["password"]
    
    # 添加额外字段
    user_dict["id"] = user_id
    user_dict["created_at"] = datetime.utcnow().isoformat()
    user_dict["updated_at"] = datetime.utcnow().isoformat()
    user_dict["is_active"] = True
    user_dict["is_verified"] = False
    user_dict["avatar"] = None
    
    # 存储用户
    users_db[user_id] = user_dict
    save_users(users_db)
    
    print(f"✅ 用户注册成功: {user_data.email} (ID: {user_id})")
    print(f"📁 用户数据已保存到: {USERS_FILE}")
    
    # 返回用户信息（不包含密码）
    response_dict = user_dict.copy()
    del response_dict["hashed_password"]
    
    return UserResponse(**response_dict)

@router.post("/login-persistent", response_model=Token)
async def login_persistent(form_data: OAuth2PasswordRequestForm = Depends()):
    """持久化的用户登录"""
    
    print(f"🔑 登录尝试: username={form_data.username}")
    
    # 加载用户数据
    users_db = load_users()
    print(f"📊 加载用户数: {len(users_db)}")
    
    # 查找用户
    user = None
    for user_id, u in users_db.items():
        if u.get("email") == form_data.username or u.get("username") == form_data.username:
            user = u
            print(f"✅ 找到用户: {user_id}")
            break
    
    if not user:
        print("❌ 用户未找到")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 验证密码
    if not verify_password(form_data.password, user["hashed_password"]):
        print("❌ 密码验证失败")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print("✅ 密码验证成功")
    
    # 创建访问令牌
    access_token_expires = timedelta(minutes=10080)  # 7天
    access_token = create_access_token(
        data={"sub": user["id"], "email": user["email"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=int(access_token_expires.total_seconds())
    )

@router.get("/users-list")
async def list_users():
    """列出所有用户（仅用于测试）"""
    users_db = load_users()
    
    # 移除密码哈希
    safe_users = {}
    for user_id, user in users_db.items():
        safe_user = user.copy()
        if "hashed_password" in safe_user:
            del safe_user["hashed_password"]
        safe_users[user_id] = safe_user
    
    return {
        "count": len(safe_users),
        "users": safe_users
    }