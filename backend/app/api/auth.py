from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional
import re
from bson import ObjectId

from ..database import get_database
from ..schemas.user import (
    UserCreate, UserResponse, Token, UserUpdate, UserRole
)
from ..models.user import UserModel
from ..utils.security import (
    get_password_hash, verify_password, create_access_token,
    generate_email_verification_token, verify_email_token,
    generate_reset_token, verify_reset_token
)
from ..middleware.auth import get_current_user, require_admin
from ..config import settings

router = APIRouter(prefix="/auth", tags=["认证"])


def validate_password(password: str) -> bool:
    """验证密码强度"""
    # 至少8个字符，包含字母和数字
    if len(password) < 8:
        return False
    if not re.search(r"[a-zA-Z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True


def validate_phone(phone: str) -> bool:
    """验证手机号格式"""
    # 简单的手机号验证（中国手机号）
    pattern = r'^1[3-9]\d{9}$'
    return bool(re.match(pattern, phone))


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, background_tasks: BackgroundTasks):
    """用户注册"""
    # 验证密码强度
    if not validate_password(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密码必须至少8个字符，包含字母和数字"
        )
    
    # 验证手机号（如果提供）
    if user_data.phone and not validate_phone(user_data.phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="手机号格式不正确"
        )
    
    db = get_database()
    
    # 检查邮箱是否已存在
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册"
        )
    
    # 检查用户名是否已存在
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已被使用"
        )
    
    # 创建用户
    user_dict = user_data.dict()
    user_dict["hashed_password"] = get_password_hash(user_data.password)
    del user_dict["password"]
    
    user = UserModel(**user_dict)
    
    # 插入数据库
    result = await db.users.insert_one(user.dict())
    
    # 生成邮箱验证令牌
    verification_token = generate_email_verification_token(user_data.email)
    
    # TODO: 发送验证邮件（在实际项目中实现）
    # background_tasks.add_task(send_verification_email, user_data.email, verification_token)
    
    # 返回用户信息
    if result and hasattr(result, 'inserted_id') and result.inserted_id != "mock_id":
        created_user = await db.users.find_one({"_id": result.inserted_id})
    else:
        # 模拟数据库模式
        created_user = user.dict()
        created_user["_id"] = str(result.inserted_id) if result and hasattr(result, 'inserted_id') else "mock_id_" + user_data.username
    
    created_user["id"] = str(created_user["_id"])
    
    return UserResponse(**created_user)


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """用户登录"""
    db = get_database()
    
    # 查找用户（支持邮箱或用户名登录）
    user = await db.users.find_one({
        "$or": [
            {"email": form_data.username},
            {"username": form_data.username}
        ]
    })
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 验证密码
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 检查用户是否激活
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户已被禁用"
        )
    
    # 创建访问令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user["_id"]),
            "username": user["username"],
            "role": user["role"]
        },
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """获取当前用户信息"""
    db = get_database()
    user = await db.users.find_one({"_id": current_user.user_id})
    
    if not user:
        # 尝试用ObjectId查询（兼容MongoDB模式）
        try:
            user = await db.users.find_one({"_id": ObjectId(current_user.user_id)})
        except Exception:
            pass
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    user["id"] = str(user["_id"])
    return UserResponse(**user)


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """更新当前用户信息"""
    db = get_database()
    
    # 验证手机号（如果提供）
    if user_update.phone and not validate_phone(user_update.phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="手机号格式不正确"
        )
    
    # 构建更新数据
    update_data = user_update.dict(exclude_unset=True)
    
    # 如果有密码更新，需要哈希处理
    if "password" in update_data:
        if not validate_password(update_data["password"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="密码必须至少8个字符，包含字母和数字"
            )
        update_data["hashed_password"] = get_password_hash(update_data["password"])
        del update_data["password"]
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.users.update_one(
            {"_id": ObjectId(current_user.user_id)},
            {"$set": update_data}
        )
    
    # 返回更新后的用户信息
    user = await db.users.find_one({"_id": ObjectId(current_user.user_id)})
    user["id"] = str(user["_id"])
    
    return UserResponse(**user)


@router.post("/forgot-password")
async def forgot_password(email: str, background_tasks: BackgroundTasks):
    """忘记密码 - 发送重置邮件"""
    db = get_database()
    user = await db.users.find_one({"email": email})
    
    if user:
        # 生成重置令牌
        reset_token = generate_reset_token(email)
        
        # TODO: 发送重置邮件（在实际项目中实现）
        # background_tasks.add_task(send_reset_email, email, reset_token)
        
        return {"message": "如果邮箱存在，重置链接已发送"}
    
    # 出于安全考虑，即使邮箱不存在也返回成功
    return {"message": "如果邮箱存在，重置链接已发送"}


@router.post("/reset-password")
async def reset_password(token: str, new_password: str):
    """重置密码"""
    # 验证令牌
    email = verify_reset_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效或过期的重置令牌"
        )
    
    # 验证密码强度
    if not validate_password(new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密码必须至少8个字符，包含字母和数字"
        )
    
    db = get_database()
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 更新密码
    hashed_password = get_password_hash(new_password)
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "hashed_password": hashed_password,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "密码重置成功"}


@router.post("/verify-email")
async def verify_email(token: str):
    """验证邮箱"""
    email = verify_email_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效或过期的验证令牌"
        )
    
    db = get_database()
    result = await db.users.update_one(
        {"email": email},
        {"$set": {
            "is_verified": True,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在或邮箱已验证"
        )
    
    return {"message": "邮箱验证成功"}


@router.post("/resend-verification", dependencies=[Depends(get_current_user)])
async def resend_verification(
    email: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """重新发送验证邮件"""
    db = get_database()
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 检查是否已验证
    if user.get("is_verified", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已验证"
        )
    
    # 生成新的验证令牌
    verification_token = generate_email_verification_token(email)
    
    # TODO: 发送验证邮件
    # background_tasks.add_task(send_verification_email, email, verification_token)
    
    return {"message": "验证邮件已发送"}


# 管理员接口
@router.get("/users", dependencies=[Depends(require_admin)])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None
):
    """获取所有用户（管理员）"""
    db = get_database()
    
    query = {}
    if role:
        query["role"] = role
    
    users = await db.users.find(query).skip(skip).limit(limit).to_list(length=limit)
    
    for user in users:
        user["id"] = str(user["_id"])
    
    return users


@router.put("/users/{user_id}/status", dependencies=[Depends(require_admin)])
async def update_user_status(
    user_id: str,
    is_active: bool
):
    """更新用户状态（管理员）"""
    from bson import ObjectId
    
    db = get_database()
    
    try:
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "is_active": is_active,
                "updated_at": datetime.utcnow()
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )
        
        return {"message": f"用户状态已更新为{'激活' if is_active else '禁用'}"}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的用户ID"
        )