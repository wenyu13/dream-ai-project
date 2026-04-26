from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import FileResponse
from typing import List
import os

from ..middleware.auth import get_current_user, require_admin
from ..utils.upload import save_upload_file, save_multiple_files, delete_file, get_file_info, get_allowed_extensions
from ..config import settings

router = APIRouter(prefix="/upload", tags=["文件上传"])


@router.post("/single")
async def upload_single_file(
    file: UploadFile = File(...),
    file_type: str = None,
    current_user: dict = Depends(get_current_user)
):
    """上传单个文件"""
    # 根据文件类型获取允许的扩展名
    allowed_extensions = get_allowed_extensions(file_type)
    
    try:
        # 保存文件
        file_url = await save_upload_file(file, allowed_extensions)
        
        return {
            "message": "文件上传成功",
            "filename": file.filename,
            "url": file_url,
            "size": file.size,
            "content_type": file.content_type
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"文件上传失败: {str(e)}"
        )


@router.post("/multiple")
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    file_type: str = None,
    current_user: dict = Depends(get_current_user)
):
    """上传多个文件"""
    # 检查文件数量
    if len(files) > 10:
        raise HTTPException(
            status_code=400,
            detail="一次最多上传10个文件"
        )
    
    # 根据文件类型获取允许的扩展名
    allowed_extensions = get_allowed_extensions(file_type)
    
    try:
        # 保存文件
        file_urls = await save_multiple_files(files, allowed_extensions)
        
        return {
            "message": f"成功上传 {len(file_urls)} 个文件",
            "files": [
                {
                    "filename": files[i].filename,
                    "url": file_urls[i],
                    "size": files[i].size,
                    "content_type": files[i].content_type
                }
                for i in range(len(file_urls))
            ]
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"文件上传失败: {str(e)}"
        )


@router.get("/files/{filename}")
async def get_file(filename: str):
    """获取文件"""
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="文件不存在"
        )
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream"
    )


@router.get("/files/{filename}/info")
async def get_file_info_api(
    filename: str,
    current_user: dict = Depends(get_current_user)
):
    """获取文件信息"""
    file_url = f"/uploads/{filename}"
    info = get_file_info(file_url)
    
    if not info:
        raise HTTPException(
            status_code=404,
            detail="文件不存在"
        )
    
    return info


@router.delete("/files/{filename}")
async def delete_file_api(
    filename: str,
    current_user: dict = Depends(require_admin)  # 仅管理员可以删除文件
):
    """删除文件"""
    file_url = f"/uploads/{filename}"
    
    if delete_file(file_url):
        return {"message": "文件删除成功"}
    else:
        raise HTTPException(
            status_code=404,
            detail="文件不存在或删除失败"
        )


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """上传用户头像"""
    # 只允许图片文件
    allowed_extensions = get_allowed_extensions("image")
    
    # 检查文件大小（头像限制为2MB）
    original_max_size = settings.MAX_FILE_SIZE
    settings.MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB
    
    try:
        # 保存文件
        file_url = await save_upload_file(file, allowed_extensions)
        
        # 更新用户头像
        from ..database import get_database
        from bson import ObjectId
        
        db = get_database()
        await db.users.update_one(
            {"_id": ObjectId(current_user.user_id)},
            {"$set": {"avatar": file_url}}
        )
        
        return {
            "message": "头像上传成功",
            "avatar_url": file_url
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"头像上传失败: {str(e)}"
        )
    finally:
        # 恢复原始文件大小限制
        settings.MAX_FILE_SIZE = original_max_size


@router.post("/model")
async def upload_model_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """上传3D模型文件"""
    # 只允许3D模型文件
    allowed_extensions = get_allowed_extensions("model")
    
    try:
        # 保存文件
        file_url = await save_upload_file(file, allowed_extensions)
        
        return {
            "message": "模型文件上传成功",
            "filename": file.filename,
            "url": file_url,
            "size": file.size,
            "content_type": file.content_type
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"模型文件上传失败: {str(e)}"
        )


@router.get("/stats")
async def get_upload_stats(
    current_user: dict = Depends(require_admin)  # 仅管理员
):
    """获取上传统计信息"""
    try:
        total_size = 0
        file_count = 0
        files_by_type = {}
        
        if os.path.exists(settings.UPLOAD_DIR):
            for filename in os.listdir(settings.UPLOAD_DIR):
                file_path = os.path.join(settings.UPLOAD_DIR, filename)
                if os.path.isfile(file_path):
                    file_size = os.path.getsize(file_path)
                    total_size += file_size
                    file_count += 1
                    
                    # 按扩展名统计
                    file_ext = os.path.splitext(filename)[1].lower()
                    files_by_type[file_ext] = files_by_type.get(file_ext, 0) + 1
        
        return {
            "total_files": file_count,
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / 1024 / 1024, 2),
            "files_by_type": files_by_type,
            "upload_dir": settings.UPLOAD_DIR
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取统计信息失败: {str(e)}"
        )