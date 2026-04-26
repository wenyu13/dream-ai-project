import os
import uuid
from fastapi import UploadFile, HTTPException
from typing import List
from ..config import settings


async def save_upload_file(upload_file: UploadFile, allowed_extensions: List[str] = None) -> str:
    """保存上传的文件"""
    if allowed_extensions is None:
        allowed_extensions = settings.ALLOWED_EXTENSIONS
    
    # 检查文件大小
    file_size = 0
    upload_file.file.seek(0, 2)  # 移动到文件末尾
    file_size = upload_file.file.tell()
    upload_file.file.seek(0)  # 重置文件指针
    
    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"文件大小不能超过 {settings.MAX_FILE_SIZE // 1024 // 1024}MB"
        )
    
    # 检查文件扩展名
    file_ext = os.path.splitext(upload_file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型。允许的类型: {', '.join(allowed_extensions)}"
        )
    
    # 生成唯一文件名
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    # 确保上传目录存在
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # 保存文件
    try:
        with open(file_path, "wb") as buffer:
            content = await upload_file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"文件保存失败: {str(e)}"
        )
    
    # 返回文件URL路径
    return f"/uploads/{filename}"


async def save_multiple_files(files: List[UploadFile], allowed_extensions: List[str] = None) -> List[str]:
    """保存多个上传的文件"""
    file_urls = []
    
    for file in files:
        try:
            file_url = await save_upload_file(file, allowed_extensions)
            file_urls.append(file_url)
        except HTTPException as e:
            # 如果单个文件失败，继续处理其他文件
            raise e
    
    return file_urls


def delete_file(file_url: str) -> bool:
    """删除文件"""
    try:
        # 从URL中提取文件名
        filename = file_url.split("/")[-1]
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False


def get_file_info(file_url: str) -> dict:
    """获取文件信息"""
    try:
        filename = file_url.split("/")[-1]
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
            file_ext = os.path.splitext(filename)[1].lower()
            
            return {
                "filename": filename,
                "path": file_path,
                "size": file_size,
                "extension": file_ext,
                "url": file_url
            }
        return None
    except Exception:
        return None


def get_allowed_extensions(file_type: str = None) -> List[str]:
    """根据文件类型获取允许的扩展名"""
    if file_type == "image":
        return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"]
    elif file_type == "document":
        return [".pdf", ".doc", ".docx", ".txt", ".md"]
    elif file_type == "model":
        return [".glb", ".gltf", ".obj", ".fbx"]
    elif file_type == "video":
        return [".mp4", ".avi", ".mov", ".wmv"]
    elif file_type == "audio":
        return [".mp3", ".wav", ".ogg", ".m4a"]
    else:
        return settings.ALLOWED_EXTENSIONS