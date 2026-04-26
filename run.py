"""
筑梦AI支教 - 后端启动脚本
Usage:  python run.py
"""
import uvicorn
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

if __name__ == "__main__":
    print("🚀 筑梦AI支教 FastAPI 后端启动中...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
