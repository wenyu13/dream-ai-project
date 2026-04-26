from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    """任务状态枚举"""
    DRAFT = "draft"          # 草稿
    PUBLISHED = "published"  # 已发布
    IN_PROGRESS = "in_progress"  # 进行中
    COMPLETED = "completed"  # 已完成
    CANCELLED = "cancelled"  # 已取消


class TaskPriority(str, Enum):
    """任务优先级枚举"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskType(str, Enum):
    """任务类型枚举"""
    TEACHING = "teaching"        # 教学任务
    TUTORING = "tutoring"        # 辅导任务
    MATERIAL = "material"        # 材料制作
    TRANSLATION = "translation"  # 翻译任务
    RESEARCH = "research"        # 研究任务
    OTHER = "other"              # 其他


class TaskBase(BaseModel):
    """任务基础模型"""
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20, max_length=5000)
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
    attachments: List[str] = []  # 附件URL列表


class TaskCreate(TaskBase):
    """创建任务模型"""
    pass


class TaskUpdate(BaseModel):
    """更新任务模型"""
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


class TaskResponse(TaskBase):
    """任务响应模型"""
    id: str
    creator_id: str
    status: TaskStatus
    participants: List[str] = []  # 参与者用户ID列表
    completed_by: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class TaskApplication(BaseModel):
    """任务申请模型"""
    task_id: str
    user_id: str
    message: Optional[str] = Field(None, max_length=1000)
    skills_match: List[str] = []
    available_hours: Optional[int] = 0


class TaskAssignment(BaseModel):
    """任务分配模型"""
    task_id: str
    user_id: str
    assigned_by: str
    notes: Optional[str] = None


class TaskCompletion(BaseModel):
    """任务完成模型"""
    task_id: str
    completed_by: str
    actual_hours: Optional[int] = None
    feedback: Optional[str] = None
    attachments: List[str] = []  # 成果附件


class TaskStats(BaseModel):
    """任务统计模型"""
    total: int
    draft: int
    published: int
    in_progress: int
    completed: int
    cancelled: int
    by_type: dict
    by_priority: dict


class TaskFilter(BaseModel):
    """任务过滤器模型"""
    status: Optional[TaskStatus] = None
    type: Optional[TaskType] = None
    priority: Optional[TaskPriority] = None
    creator_id: Optional[str] = None
    participant_id: Optional[str] = None
    is_remote: Optional[bool] = None
    skills: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    search: Optional[str] = None
    min_reward: Optional[int] = None
    max_participants: Optional[int] = None