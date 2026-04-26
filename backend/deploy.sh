#!/bin/bash

# 筑梦AI支教项目 - 部署脚本
# 适用于Linux/macOS系统

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    echo "筑梦AI支教项目部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  dev       开发环境部署"
    echo "  prod      生产环境部署"
    echo "  docker    使用Docker部署"
    echo "  test      运行测试"
    echo "  clean     清理环境"
    echo "  help      显示此帮助信息"
    echo ""
}

# 开发环境部署
deploy_dev() {
    log_info "开始开发环境部署..."
    
    # 检查Python
    check_command python3
    check_command pip3
    
    # 创建虚拟环境
    if [ ! -d "venv" ]; then
        log_info "创建Python虚拟环境..."
        python3 -m venv venv
    fi
    
    # 激活虚拟环境
    log_info "激活虚拟环境..."
    source venv/bin/activate
    
    # 安装依赖
    log_info "安装Python依赖..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # 检查MongoDB
    if ! pgrep -x "mongod" > /dev/null; then
        log_warning "MongoDB未运行，请先启动MongoDB服务"
        log_info "启动MongoDB命令: sudo systemctl start mongod (Linux) 或 brew services start mongodb-community (macOS)"
    fi
    
    # 创建必要目录
    log_info "创建必要目录..."
    mkdir -p uploads logs
    
    # 复制环境变量文件
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            log_info "复制环境变量文件..."
            cp .env.example .env
            log_warning "请编辑 .env 文件配置您的环境变量"
        else
            log_error ".env.example 文件不存在"
            exit 1
        fi
    fi
    
    log_success "开发环境部署完成！"
    echo ""
    echo "下一步："
    echo "1. 编辑 .env 文件配置环境变量"
    echo "2. 启动MongoDB服务"
    echo "3. 运行: source venv/bin/activate"
    echo "4. 启动应用: python run.py 或 uvicorn app.main:app --reload"
}

# 生产环境部署
deploy_prod() {
    log_info "开始生产环境部署..."
    
    # 检查系统服务
    check_command systemctl
    
    # 创建生产环境目录
    local APP_DIR="/opt/dream-ai"
    local APP_USER="dream-ai"
    
    log_info "创建应用目录: $APP_DIR"
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
    
    # 复制文件
    log_info "复制项目文件..."
    cp -r . $APP_DIR/
    
    # 创建系统用户
    if ! id "$APP_USER" &>/dev/null; then
        log_info "创建系统用户: $APP_USER"
        sudo useradd -r -s /bin/false $APP_USER
    fi
    
    # 设置目录权限
    log_info "设置目录权限..."
    sudo chown -R $APP_USER:$APP_USER $APP_DIR
    sudo chmod -R 755 $APP_DIR
    
    # 创建虚拟环境
    log_info "创建生产虚拟环境..."
    cd $APP_DIR
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # 创建系统服务文件
    log_info "创建系统服务..."
    cat > /tmp/dream-ai.service << EOF
[Unit]
Description=Dream AI Teaching Backend
After=network.target mongod.service

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
Environment="PATH=$APP_DIR/venv/bin"
ExecStart=$APP_DIR/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    sudo mv /tmp/dream-ai.service /etc/systemd/system/
    
    # 重新加载systemd
    sudo systemctl daemon-reload
    
    log_success "生产环境部署完成！"
    echo ""
    echo "下一步："
    echo "1. 编辑 $APP_DIR/.env 文件配置生产环境变量"
    echo "2. 设置SECRET_KEY等敏感信息"
    echo "3. 启动服务: sudo systemctl start dream-ai"
    echo "4. 设置开机自启: sudo systemctl enable dream-ai"
    echo "5. 查看日志: sudo journalctl -u dream-ai -f"
}

# Docker部署
deploy_docker() {
    log_info "开始Docker部署..."
    
    check_command docker
    check_command docker-compose
    
    # 检查Docker服务
    if ! docker info &> /dev/null; then
        log_error "Docker服务未运行"
        exit 1
    fi
    
    # 构建镜像
    log_info "构建Docker镜像..."
    docker-compose build
    
    # 启动服务
    log_info "启动Docker服务..."
    docker-compose up -d
    
    # 检查服务状态
    log_info "检查服务状态..."
    sleep 5
    docker-compose ps
    
    log_success "Docker部署完成！"
    echo ""
    echo "服务访问地址:"
    echo "- 后端API: http://localhost:8000"
    echo "- API文档: http://localhost:8000/docs"
    echo "- MongoDB管理: http://localhost:8081"
    echo ""
    echo "管理命令:"
    echo "- 查看日志: docker-compose logs -f"
    echo "- 停止服务: docker-compose down"
    echo "- 重启服务: docker-compose restart"
}

# 运行测试
run_tests() {
    log_info "运行测试..."
    
    # 激活虚拟环境
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    # 安装测试依赖
    pip install pytest pytest-asyncio httpx
    
    # 运行测试
    python -m pytest tests/ -v
    
    log_success "测试完成！"
}

# 清理环境
clean_environment() {
    log_info "清理环境..."
    
    # 停止Docker服务
    if command -v docker-compose &> /dev/null; then
        log_info "停止Docker服务..."
        docker-compose down -v
    fi
    
    # 删除虚拟环境
    if [ -d "venv" ]; then
        log_info "删除虚拟环境..."
        rm -rf venv
    fi
    
    # 删除上传文件
    if [ -d "uploads" ]; then
        log_info "清理上传文件..."
        rm -rf uploads/*
    fi
    
    # 删除日志文件
    if [ -d "logs" ]; then
        log_info "清理日志文件..."
        rm -rf logs/*
    fi
    
    # 删除Python缓存文件
    log_info "清理Python缓存..."
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    
    log_success "环境清理完成！"
}

# 主函数
main() {
    case "$1" in
        "dev")
            deploy_dev
            ;;
        "prod")
            deploy_prod
            ;;
        "docker")
            deploy_docker
            ;;
        "test")
            run_tests
            ;;
        "clean")
            clean_environment
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"