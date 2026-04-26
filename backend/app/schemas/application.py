from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ApplicationStatus(str, Enum):
    """申请状态枚举"""
    PENDING = "pending"      # 待审核
    REVIEWING = "reviewing"  # 审核中
    APPROVED = "approved"    # 已通过
    REJECTED = "rejected"    # 已拒绝
    WITHDRAWN = "withdrawn"  # 已撤回


class ApplicationType(str, Enum):
    """申请类型枚举"""
    VOLUNTEER = "volunteer"  # 志愿者申请
    TEACHER = "teacher"      # 教师申请
    PARTNER = "partner"      # 合作伙伴申请


class ApplicationBase(BaseModel):
    """申请基础模型"""
    type: ApplicationType
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20, max_length=2000)
    skills: List[str] = []
    experience_years: Optional[int] = 0
    available_hours: Optional[int] = 0
    preferred_subjects: List[str] = []
    location: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    attachments: List[str] = []  # 附件URL列表


class ApplicationCreate(ApplicationBase):
    """创建申请模型"""
    pass


class ApplicationUpdate(BaseModel):
    """更新申请模型"""
    title: Optional[str] = None
    description: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[int] = None
    available_hours: Optional[int] = None
    preferred_subjects: Optional[List[str]] = None
    location: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    attachments: Optional[List[str]] = None
    status: Optional[ApplicationStatus] = None


class ApplicationResponse(ApplicationBase):
    """申请响应模型"""
    id: str
    user_id: str
    status: ApplicationStatus
    reviewer_id: Optional[str] = None
    review_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class ApplicationReview(BaseModel):
    """申请审核模型"""
    status: ApplicationStatus
    notes: Optional[str] = Field(None, max_length=1000)
    reviewer_id: str


class ApplicationStats(BaseModel):
    """申请统计模型"""
    total: int
    pending: int
    reviewing: int
    approved: int
    rejected: int
    withdrawn: int
    by_type: dict


class ApplicationFilter(BaseModel):
    """申请过滤器模型"""
    status: Optional[ApplicationStatus] = None
    type: Optional[ApplicationType] = None
    user_id: Optional[str] = None
    reviewer_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    search: Optional[str] = None