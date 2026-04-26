"""
简化的认证API，用于测试
"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional
import hashlib
import uuid

from ..schemas.user import UserCreate, UserResponse, Token
from ..utils.security import create_access_token, verify_password, get_password_hash

router = APIRouter(prefix="/auth", tags=["认证"])

# 内存中的用户存储（仅用于测试）
users_db = {}

@router.post("/register-simple", response_model=UserResponse)
async def register_simple(user_data: UserCreate):
    """简化的用户注册（仅用于测试）"""
    
    # 检查用户是否已存在
    for user in users_db.values():
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
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()
    user_dict["is_active"] = True
    user_dict["is_verified"] = False
    user_dict["avatar_url"] = None
    
    # 存储用户
    users_db[user_id] = user_dict
    
    # 返回用户信息（不包含密码）
    response_dict = user_dict.copy()
    del response_dict["hashed_password"]
    
    return UserResponse(**response_dict)

@router.post("/login-simple", response_model=Token)
async def login_simple(form_data: OAuth2PasswordRequestForm = Depends()):
    """简化的用户登录（仅用于测试）"""
    
    print(f"登录尝试: username={form_data.username}, password_length={len(form_data.password)}")
    print(f"当前用户数: {len(users_db)}")
    
    # 查找用户
    user = None
    for user_id, u in users_db.items():
        print(f"检查用户: id={user_id}, email={u.get('email')}, username={u.get('username')}")
        if u.get("email") == form_data.username or u.get("username") == form_data.username:
            user = u
            print(f"找到用户: {user_id}")
            break
    
    if not user:
        print("❌ 用户未找到")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"用户找到: {user.get('email')}, 密码哈希: {user.get('hashed_password')[:30]}...")
    
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

@router.get("/me-simple", response_model=UserResponse)
async def get_current_user_simple(token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/auth/login-simple"))):
    """获取当前用户信息（仅用于测试）"""
    # 这里简化了令牌验证
    # 在实际应用中应该使用完整的JWT验证
    
    # 从令牌中提取用户ID（简化版）
    # 注意：这只是一个示例，实际应用中应该使用完整的JWT解码
    for user_id, user in users_db.items():
        if user_id in token:  # 简化验证
            return UserResponse(**{k: v for k, v in user.items() if k != "hashed_password"})
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证令牌",
        headers={"WWW-Authenticate": "Bearer"},
    )