from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

from ..database import get_database
from ..schemas.application import (
    ApplicationCreate, ApplicationResponse, ApplicationUpdate,
    ApplicationReview, ApplicationStats, ApplicationFilter,
    ApplicationStatus, ApplicationType
)
from ..models.application import ApplicationModel, ApplicationUpdateModel
from ..middleware.auth import (
    get_current_user, require_admin, require_teacher, require_volunteer
)

router = APIRouter(prefix="/applications", tags=["申请管理"])


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    application: ApplicationCreate,
    current_user: dict = Depends(get_current_user)
):
    """创建申请"""
    db = get_database()
    
    # 检查用户是否已有相同类型的待处理申请
    existing_application = await db.applications.find_one({
        "user_id": current_user.user_id,
        "type": application.type,
        "status": {"$in": ["pending", "reviewing"]}
    })
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"您已有一个{application.type}类型的申请正在处理中"
        )
    
    # 创建申请
    application_dict = application.dict()
    application_dict["user_id"] = current_user.user_id
    
    app_model = ApplicationModel(**application_dict)
    
    # 插入数据库
    result = await db.applications.insert_one(app_model.dict())
    
    # 返回创建的申请
    created_app = await db.applications.find_one({"_id": result.inserted_id})
    created_app["id"] = str(created_app["_id"])
    
    return ApplicationResponse(**created_app)


@router.get("/", response_model=List[ApplicationResponse])
async def get_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[ApplicationStatus] = None,
    type: Optional[ApplicationType] = None,
    current_user: dict = Depends(get_current_user)
):
    """获取申请列表（根据权限）"""
    db = get_database()
    
    # 构建查询条件
    query = {}
    
    # 普通用户只能看到自己的申请
    if current_user.role not in ["admin", "teacher"]:
        query["user_id"] = current_user.user_id
    elif status:
        query["status"] = status
    if type:
        query["type"] = type
    
    # 执行查询
    applications = await db.applications.find(query).skip(skip).limit(limit).to_list(length=limit)
    
    # 转换ID
    for app in applications:
        app["id"] = str(app["_id"])
    
    return applications


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: str,
    current_user: dict = Depends(get_current_user)
):
    """获取单个申请"""
    db = get_database()
    
    try:
        app = await db.applications.find_one({"_id": ObjectId(application_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的申请ID"
        )
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="申请不存在"
        )
    
    # 权限检查：普通用户只能查看自己的申请
    if current_user.role not in ["admin", "teacher"] and app["user_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权查看此申请"
        )
    
    app["id"] = str(app["_id"])
    return ApplicationResponse(**app)


@router.put("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: str,
    application_update: ApplicationUpdate,
    current_user: dict = Depends(get_current_user)
):
    """更新申请（申请人或管理员）"""
    db = get_database()
    
    try:
        # 查找申请
        app = await db.applications.find_one({"_id": ObjectId(application_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的申请ID"
        )
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="申请不存在"
        )
    
    # 权限检查
    is_owner = app["user_id"] == current_user.user_id
    is_admin_or_teacher = current_user.role in ["admin", "teacher"]
    
    if not (is_owner or is_admin_or_teacher):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权更新此申请"
        )
    
    # 申请人只能更新特定字段，不能更新状态
    if is_owner and not is_admin_or_teacher:
        if application_update.status:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="申请人不能修改申请状态"
            )
        
        # 申请人只能更新待处理状态的申请
        if app["status"] not in ["pending", "reviewing"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="已审核的申请不能修改"
            )
    
    # 构建更新数据
    update_data = application_update.dict(exclude_unset=True)
    
    # 如果是状态更新，记录审核信息
    if "status" in update_data and is_admin_or_teacher:
        update_data["reviewer_id"] = current_user.user_id
        update_data["reviewed_at"] = datetime.utcnow()
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": update_data}
        )
    
    # 返回更新后的申请
    updated_app = await db.applications.find_one({"_id": ObjectId(application_id)})
    updated_app["id"] = str(updated_app["_id"])
    
    return ApplicationResponse(**updated_app)


@router.post("/{application_id}/review", response_model=ApplicationResponse)
async def review_application(
    application_id: str,
    review: ApplicationReview,
    current_user: dict = Depends(require_teacher)  # 需要教师或管理员权限
):
    """审核申请"""
    db = get_database()
    
    try:
        # 查找申请
        app = await db.applications.find_one({"_id": ObjectId(application_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的申请ID"
        )
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="申请不存在"
        )
    
    # 检查申请状态
    if app["status"] not in ["pending", "reviewing"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="申请已审核，不能重复审核"
        )
    
    # 更新申请状态
    update_data = {
        "status": review.status,
        "reviewer_id": current_user.user_id,
        "review_notes": review.notes,
        "reviewed_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.applications.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": update_data}
    )
    
    # 如果申请通过，更新用户角色
    if review.status == "approved":
        user_role_map = {
            "volunteer": "volunteer",
            "teacher": "teacher",
            "partner": "partner"
        }
        
        new_role = user_role_map.get(app["type"])
        if new_role:
            await db.users.update_one(
                {"_id": ObjectId(app["user_id"])},
                {"$set": {"role": new_role, "updated_at": datetime.utcnow()}}
            )
    
    # 返回更新后的申请
    updated_app = await db.applications.find_one({"_id": ObjectId(application_id)})
    updated_app["id"] = str(updated_app["_id"])
    
    return ApplicationResponse(**updated_app)


@router.post("/{application_id}/withdraw", response_model=ApplicationResponse)
async def withdraw_application(
    application_id: str,
    current_user: dict = Depends(get_current_user)
):
    """撤回申请（仅申请人）"""
    db = get_database()
    
    try:
        # 查找申请
        app = await db.applications.find_one({"_id": ObjectId(application_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的申请ID"
        )
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="申请不存在"
        )
    
    # 检查权限
    if app["user_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只能撤回自己的申请"
        )
    
    # 检查申请状态
    if app["status"] not in ["pending", "reviewing"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只能撤回待处理状态的申请"
        )
    
    # 更新申请状态
    await db.applications.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {
            "status": "withdrawn",
            "updated_at": datetime.utcnow()
        }}
    )
    
    # 返回更新后的申请
    updated_app = await db.applications.find_one({"_id": ObjectId(application_id)})
    updated_app["id"] = str(updated_app["_id"])
    
    return ApplicationResponse(**updated_app)


@router.get("/stats/summary", response_model=ApplicationStats)
async def get_application_stats(
    current_user: dict = Depends(require_teacher)  # 需要教师或管理员权限
):
    """获取申请统计（管理员/教师）"""
    db = get_database()
    
    # 获取总数
    total = await db.applications.count_documents({})
    
    # 按状态统计
    pending = await db.applications.count_documents({"status": "pending"})
    reviewing = await db.applications.count_documents({"status": "reviewing"})
    approved = await db.applications.count_documents({"status": "approved"})
    rejected = await db.applications.count_documents({"status": "rejected"})
    withdrawn = await db.applications.count_documents({"status": "withdrawn"})
    
    # 按类型统计
    by_type = {}
    for app_type in ["volunteer", "teacher", "partner"]:
        count = await db.applications.count_documents({"type": app_type})
        by_type[app_type] = count
    
    return ApplicationStats(
        total=total,
        pending=pending,
        reviewing=reviewing,
        approved=approved,
        rejected=rejected,
        withdrawn=withdrawn,
        by_type=by_type
    )


@router.get("/user/{user_id}", response_model=List[ApplicationResponse])
async def get_user_applications(
    user_id: str,
    current_user: dict = Depends(require_teacher)  # 需要教师或管理员权限
):
    """获取指定用户的所有申请（管理员/教师）"""
    db = get_database()
    
    # 检查用户是否存在
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 获取用户的所有申请
    applications = await db.applications.find({"user_id": user_id}).to_list(length=100)
    
    # 转换ID
    for app in applications:
        app["id"] = str(app["_id"])
    
    return applications


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: str,
    current_user: dict = Depends(require_admin)  # 仅管理员
):
    """删除申请（仅管理员）"""
    db = get_database()
    
    try:
        result = await db.applications.delete_one({"_id": ObjectId(application_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的申请ID"
        )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="申请不存在"
        )