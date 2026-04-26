from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """用户角色枚举"""
    ADMIN = "admin"
    TEACHER = "teacher"
    VOLUNTEER = "volunteer"
    STUDENT = "student"


class UserBase(BaseModel):
    """用户基础模型"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = None
    role: UserRole = UserRole.VOLUNTEER
    phone: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None


class UserCreate(UserBase):
    """创建用户模型"""
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """更新用户模型"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    password: Optional[str] = None


class UserInDB(UserBase):
    """数据库中的用户模型"""
    id: str
    hashed_password: str
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserResponse(UserBase):
    """用户响应模型"""
    id: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class Token(BaseModel):
    """Token响应模型"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    """Token数据模型"""
    user_id: str
    username: str
    role: UserRole
    exp: Optional[datetime] = None