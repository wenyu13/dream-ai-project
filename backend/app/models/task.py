from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from pydantic import BaseModel, Field
from enum import Enum


class TaskStatus(str, Enum):
    """任务状态枚举"""
    DRAFT = "draft"
    PUBLISHED = "published"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    """任务优先级枚举"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskType(str, Enum):
    """任务类型枚举"""
    TEACHING = "teaching"
    TUTORING = "tutoring"
    MATERIAL = "material"
    TRANSLATION = "translation"
    RESEARCH = "research"
    OTHER = "other"


class TaskModel(BaseModel):
    """任务MongoDB模型"""
    creator_id: str
    title: str
    description: str
    type: TaskType
    priority: TaskPriority = TaskPriority.MEDIUM
    skills_required: List[str] = []
    estimated_hours: Optional[int] = 0
    deadline: Optional[datetime] = None
    location: Optional[str] = None
    is_remote: bool = True
    max_participants: Optional[int] = 1
    reward_points: Optional[int] = 0
    tags: List[str] = []
    attachments: List[str] = []
    status: TaskStatus = TaskStatus.DRAFT
    participants: List[str] = []  # 参与者用户ID列表
    completed_by: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }
        schema_extra = {
            "example": {
                "creator_id": "507f1f77bcf86cd799439011",
                "title": "初中数学在线辅导",
                "description": "为偏远地区初中生提供数学在线辅导，每周2次，每次1小时...",
                "type": "tutoring",
                "priority": "high",
                "skills_required": ["数学教学", "在线辅导", "初中数学"],
                "estimated_hours": 20,
                "deadline": "2024-12-31T23:59:59",
                "location": "在线",
                "is_remote": True,
                "max_participants": 3,
                "reward_points": 100,
                "tags": ["数学", "初中", "在线"],
                "attachments": ["syllabus.pdf"],
                "status": "published"
            }
        }


class TaskUpdateModel(BaseModel):
    """任务更新模型"""
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[TaskType] = None
    priority: Optional[TaskPriority] = None
    skills_required: Optional[List[str]] = None
    estimated_hours: Optional[int] = None
    deadline: Optional[datetime] = None
    location: Optional[str] = None
    is_remote: Optional[bool] = None
    max_participants: Optional[int] = None
    reward_points: Optional[int] = None
    tags: Optional[List[str]] = None
    attachments: Optional[List[str]] = None
    status: Optional[TaskStatus] = None
    participants: Optional[List[str]] = None
    completed_by: Optional[str] = None
    completed_at: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TaskApplicationModel(BaseModel):
    """任务申请MongoDB模型"""
    task_id: str
    user_id: str
    message: Optional[str] = None
    skills_match: List[str] = []
    available_hours: Optional[int] = 0
    status: str = "pending"  # pending, accepted, rejected
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None