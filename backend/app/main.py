from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import json
from datetime import datetime

from .config import settings
from .database import connect_to_mongo, close_mongo_connection
from .api import auth, applications, tasks, upload
from .api.auth_simple import router as auth_simple_router
from .api.auth_persistent import router as auth_persistent_router

# 创建FastAPI应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="筑梦AI支教项目 - 智慧支教生态系统后端API",
    docs_url="/docs",
    redoc_url="/redoc",
    default_response_class=JSONResponse,
    openapi_tags=[
        {
            "name": "认证",
            "description": "用户认证、注册、登录、权限管理"
        },
        {
            "name": "申请管理",
            "description": "志愿者、教师、合作伙伴申请管理"
        },
        {
            "name": "任务管理",
            "description": "教学任务、辅导任务、材料制作等任务管理"
        },
        {
            "name": "文件上传",
            "description": "文件上传、下载、管理"
        }
    ]
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 添加编码中间件
@app.middleware("http")
async def add_charset_header(request, call_next):
    response = await call_next(request)
    if response.headers.get("content-type", "").startswith("application/json"):
        response.headers["content-type"] = "application/json; charset=utf-8"
    return response

# 挂载静态文件目录
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# 确保上传目录存在
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


# 启动和关闭事件
@app.on_event("startup")
async def startup_event():
    """应用启动时执行"""
    await connect_to_mongo()
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} 启动成功")
    print(f"🌐 访问地址: http://{settings.HOST}:{settings.PORT}")
    print(f"📚 API文档: http://{settings.HOST}:{settings.PORT}/docs")
    print(f"📁 上传目录: {os.path.abspath(settings.UPLOAD_DIR)}")
    print(f"🔒 安全密钥: {'已设置' if settings.SECRET_KEY != 'your-secret-key-change-this-in-production-min-32-chars' else '使用默认值，请在生产环境中修改！'}")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时执行"""
    await close_mongo_connection()
    print(f"👋 {settings.APP_NAME} 已关闭")


# 根路径
@app.get("/")
async def root():
    """根路径"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "筑梦AI支教项目后端API",
        "docs": "/docs",
        "health": "/api/health",
        "timestamp": datetime.utcnow().isoformat()
    }


# 健康检查
@app.get("/api/health")
async def health_check():
    """健康检查"""
    from .database import get_database
    
    db_status = "unknown"
    try:
        db = get_database()
        if db:
            # 尝试执行一个简单的数据库操作
            await db.command("ping")
            db_status = "connected"
        else:
            db_status = "disconnected"
    except Exception:
        db_status = "error"
    
    return {
        "status": "ok",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_status,
        "environment": "development" if settings.DEBUG else "production"
    }


# 注册路由
app.include_router(auth.router, prefix="/api")
app.include_router(auth_simple_router, prefix="/api")
app.include_router(auth_persistent_router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(upload.router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
