from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from pydantic import BaseModel, Field
from enum import Enum


class ApplicationStatus(str, Enum):
    """申请状态枚举"""
    PENDING = "pending"
    REVIEWING = "reviewing"
    APPROVED = "approved"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ApplicationType(str, Enum):
    """申请类型枚举"""
    VOLUNTEER = "volunteer"
    TEACHER = "teacher"
    PARTNER = "partner"


class ApplicationModel(BaseModel):
    """申请MongoDB模型"""
    user_id: str
    type: ApplicationType
    title: str
    description: str
    skills: List[str] = []
    experience_years: Optional[int] = 0
    available_hours: Optional[int] = 0
    preferred_subjects: List[str] = []
    location: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    attachments: List[str] = []
    status: ApplicationStatus = ApplicationStatus.PENDING
    reviewer_id: Optional[str] = None
    review_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }
        schema_extra = {
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "type": "volunteer",
                "title": "数学辅导志愿者申请",
                "description": "我有5年数学教学经验，希望为偏远地区学生提供在线辅导...",
                "skills": ["数学教学", "在线辅导", "课程设计"],
                "experience_years": 5,
                "available_hours": 10,
                "preferred_subjects": ["数学", "物理"],
                "location": "北京",
                "contact_email": "volunteer@example.com",
                "contact_phone": "+8613800138000",
                "attachments": ["resume.pdf", "certificate.jpg"],
                "status": "pending"
            }
        }


class ApplicationUpdateModel(BaseModel):
    """申请更新模型"""
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
    reviewer_id: Optional[str] = None
    review_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)