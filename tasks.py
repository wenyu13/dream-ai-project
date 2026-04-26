from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

from ..database import get_database
from ..schemas.task import (
    TaskCreate, TaskResponse, TaskUpdate, TaskApplication,
    TaskAssignment, TaskCompletion, TaskStats, TaskFilter,
    TaskStatus, TaskType, TaskPriority
)
from ..models.task import TaskModel, TaskUpdateModel, TaskApplicationModel
from ..middleware.auth import (
    get_current_user, require_admin, require_teacher, require_volunteer
)

router = APIRouter(prefix="/tasks", tags=["任务管理"])


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    current_user: dict = Depends(require_teacher)  # 需要教师或管理员权限
):
    """创建任务"""
    db = get_database()
    
    # 创建任务
    task_dict = task.dict()
    task_dict["creator_id"] = current_user.user_id
    
    task_model = TaskModel(**task_dict)
    
    # 插入数据库
    result = await db.tasks.insert_one(task_model.dict())
    
    # 返回创建的任务
    created_task = await db.tasks.find_one({"_id": result.inserted_id})
    created_task["id"] = str(created_task["_id"])
    
    return TaskResponse(**created_task)


@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[TaskStatus] = None,
    type: Optional[TaskType] = None,
    priority: Optional[TaskPriority] = None,
    is_remote: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """获取任务列表"""
    db = get_database()
    
    # 构建查询条件
    query = {}
    
    # 状态过滤
    if status:
        query["status"] = status
    else:
        # 默认只显示已发布和进行中的任务
        query["status"] = {"$in": ["published", "in_progress"]}
    
    # 类型过滤
    if type:
        query["type"] = type
    
    # 优先级过滤
    if priority:
        query["priority"] = priority
    
    # 远程过滤
    if is_remote is not None:
        query["is_remote"] = is_remote
    
    # 搜索过滤
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    
    # 执行查询
    tasks = await db.tasks.find(query).skip(skip).limit(limit).to_list(length=limit)
    
    # 转换ID
    for task in tasks:
        task["id"] = str(task["_id"])
    
    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """获取单个任务"""
    db = get_database()
    
    try:
        task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的任务ID"
        )
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    # 权限检查：草稿任务只有创建者和管理员可以查看
    if task["status"] == "draft" and task["creator_id"] != current_user.user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权查看此任务"
        )
    
    task["id"] = str(task["_id"])
    return TaskResponse(**task)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: dict = Depends(get_current_user)
):
    """更新任务"""
    db = get_database()
    
    try:
        # 查找任务
        task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的任务ID"
        )
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    # 权限检查：只有创建者和管理员可以更新
    if task["creator_id"] != current_user.user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权更新此任务"
        )
    
    # 状态转换规则检查
    if task_update.status:
        current_status = task["status"]
        new_status = task_update.status
        
        # 不允许的状态转换
        invalid_transitions = {
            "completed": ["draft", "published", "cancelled"],
            "cancelled": ["completed"]
        }
        
        if new_status in invalid_transitions and current_status in invalid_transitions[new_status]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"不能从{current_status}状态转换为{new_status}状态"
            )
    
    # 构建更新数据
    update_data = task_update.dict(exclude_unset=True)
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": update_data}
        )
    
    # 返回更新后的任务
    updated_task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    updated_task["id"] = str(updated_task["_id"])
    
    return TaskResponse(**updated_task)


@router.post("/{task_id}/apply", response_model=dict)
async def apply_for_task(
    task_id: str,
    application: TaskApplication,
    current_user: dict = Depends(require_volunteer)  # 需要志愿者权限
):
    """申请参与任务"""
    db = get_database()
    
    try:
        # 查找任务
        task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的任务ID"
        )
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    # 检查任务状态
    if task["status"] != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="任务未发布，不能申请"
        )
    
    # 检查是否已满员
    if len(task.get("participants", [])) >= task.get("max_participants", 1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="任务已满员"
        )
    
    # 检查是否已申请
    existing_application = await db.task_applications.find_one({
        "task_id": task_id,
        "user_id": current_user.user_id,
        "status": "pending"
    })
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="您已申请此任务"
        )
    
    # 检查是否已是参与者
    if current_user.user_id in task.get("participants", []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="您已是此任务的参与者"
        )
    
    # 创建申请
    application_dict = application.dict()
    application_dict["task_id"] = task_id
    application_dict["user_id"] = current_user.user_id
    
    app_model = TaskApplicationModel(**application_dict)
    
    # 插入数据库
    await db.task_applications.insert_one(app_model.dict())
    
    return {"message": "申请已提交，等待审核"}


@router.post("/{task_id}/assign", response_model=TaskResponse)
async def assign_task(
    task_id: str,
    assignment: TaskAssignment,
    current_user: dict = Depends(require_teacher)  # 需要教师或管理员权限
):
    """分配任务给用户"""
    db = get_database()
    
    try:
        # 查找任务
        task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的任务ID"
        )
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    # 检查任务状态
    if task["status"] not in ["published", "in_progress"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="任务不能分配"
        )
    
    # 检查是否已满员
    if len(task.get("participants", [])) >= task.get("max_participants", 1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="任务已满员"
        )
    
    # 检查用户是否存在
    user = await db.users.find_one({"_id": ObjectId(assignment.user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 检查用户是否已是参与者
    if assignment.user_id in task.get("participants", []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户已是此任务的参与者"
        )
    
    # 更新任务参与者
    participants = task.get("participants", [])
    participants.append(assignment.user_id)
    
    # 更新任务状态（如果还是已发布状态，改为进行中）
    new_status = task["status"]
    if new_status == "published":
        new_status = "in_progress"
    
    await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {
            "participants": participants,
            "status": new_status,
            "updated_at": datetime.utcnow()
        }}
    )
    
    # 更新申请状态（如果有）
    await db.task_applications.update_one(
        {
            "task_id": task_id,
            "user_id": assignment.user_id,
            "status": "pending"
        },
        {"$set": {
            "status": "accepted",
            "reviewed_by": current_user.user_id,
            "reviewed_at": datetime.utcnow(),
            "review_notes": assignment.notes
        }}
    )
    
    # 返回更新后的任务
    updated_task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    updated_task["id"] = str(updated_task["_id"])
    
    return TaskResponse(**updated_task)


@router.post("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: str,
    completion: TaskCompletion,
    current_user: dict = Depends(get_current_user)
):
    """完成任务"""
    db = get_database()
    
    try:
        # 查找任务
        task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的任务ID"
        )
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    # 权限检查：只有参与者、创建者或管理员可以完成任务
    is_participant = current_user.user_id in task.get("participants", [])
    is_creator = task["creator_id"] == current_user.user_id
    is_admin = current_user.role == "admin"
    
    if not (is_participant or is_creator or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权完成此任务"
        )
    
    # 检查任务状态
    if task["status"] != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只有进行中的任务可以完成"
        )
    
    # 更新任务状态
    update_data = {
        "status": "completed",
        "completed_by": current_user.user_id,
        "completed_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # 如果有实际用时，更新
    if completion.actual_hours:
        update_data["actual_hours"] = completion.actual_hours
    
    await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update_data}
    )
    
    # 给参与者奖励积分
    reward_points = task.get("reward_points", 0)
    if reward_points > 0:
        for participant_id in task.get("participants", []):
            await db.users.update_one(
                {"_id": ObjectId(participant_id)},
                {"$inc": {"reward_points": reward_points}}
            )
    
    # 返回更新后的任务
    updated_task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    updated_task["id"] = str(updated_task["_id"])
    
    return TaskResponse(**updated_task)


@router.get("/stats/summary", response_model=TaskStats)
async def get_task_stats(
    current_user: dict = Depends(require_teacher)  # 需要教师或管理员权限
):
    """获取任务统计"""
    db = get_database()
    
    # 获取总数
    total = await db.tasks.count_documents({})
    
    # 按状态统计
    draft = await db.tasks.count_documents({"status": "draft"})
    published = await db.tasks.count_documents({"status": "published"})
    in_progress = await db.tasks.count_documents({"status": "in_progress"})
    completed = await db.tasks.count_documents({"status": "completed"})
    cancelled = await db.tasks.count_documents({"status": "cancelled"})
    
    # 按类型统计
    by_type = {}
    for task_type in ["teaching", "tutoring", "material", "translation", "research", "other"]:
        count = await db.tasks.count_documents({"type": task_type})
        by_type[task_type] = count
    
    # 按优先级统计
    by_priority = {}
    for priority in ["low", "medium", "high", "urgent"]:
        count = await db.tasks.count_documents({"priority": priority})
        by_priority[priority] = count
    
    return TaskStats(
        total=total,
        draft=draft,
        published=published,
        in_progress=in_progress,
        completed=completed,
        cancelled=cancelled,
        by_type=by_type,
        by_priority=by_priority
    )


@router.get("/user/{user_id}/assigned", response_model=List[TaskResponse])
async def get_user_assigned_tasks(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """获取用户被分配的任务"""
    db = get_database()
    
    # 权限检查：只能查看自己的任务，除非是管理员
    if user_id != current_user.user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权查看其他用户的任务"
        )
    
    # 获取用户参与的任务
    tasks = await db.tasks.find({"participants": user_id}).to_list(length=100)
    
    # 转换ID
    for task in tasks:
        task["id"] = str(task["_id"])
    
    return tasks


@router.get("/user/{user_id}/created", response_model=List[TaskResponse])
async def get_user_created_tasks(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """获取用户创建的任务"""
    db = get_database()
    
    # 权限检查：只能查看自己创建的任务，除非是管理员
    if user_id != current_user.user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权查看其他用户创建的任务"
        )
    
    # 获取用户创建的任务
    tasks = await db.tasks.find({"creator_id": user_id}).to_list(length=100)
    
    # 转换ID
    for task in tasks:
        task["id"] = str(task["_id"])
    
    return tasks


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: dict = Depends(require_admin)  # 仅管理员
):
    """删除任务（仅管理员）"""
    db = get_database()
    
    try:
        result = await db.tasks.delete_one({"_id": ObjectId(task_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的任务ID"
        )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )