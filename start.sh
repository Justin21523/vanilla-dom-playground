#!/bin/bash

# Vanilla DOM Playground - 快速啟動腳本
# 此腳本會自動檢查環境並啟動應用

set -e

echo "========================================="
echo "  Vanilla DOM Playground - 快速啟動"
echo "========================================="
echo ""

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 檢查 Docker 是否安裝
check_docker() {
    echo "🔍 檢查 Docker..."
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker 未安裝${NC}"
        echo "請訪問 https://docs.docker.com/get-docker/ 安裝 Docker"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker 已安裝${NC}"
}

# 檢查 Docker Compose 是否安裝
check_docker_compose() {
    echo "🔍 檢查 Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose 未安裝${NC}"
        echo "請訪問 https://docs.docker.com/compose/install/ 安裝 Docker Compose"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker Compose 已安裝${NC}"
}

# 檢查 Docker 是否運行
check_docker_running() {
    echo "🔍 檢查 Docker 服務..."
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker 服務未運行${NC}"
        echo "請啟動 Docker Desktop 或執行: sudo systemctl start docker"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker 服務正在運行${NC}"
}

# 檢查端口是否被占用
check_port() {
    local PORT=8080
    echo "🔍 檢查端口 $PORT..."

    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  端口 $PORT 已被占用${NC}"
        echo "請選擇操作："
        echo "  1) 停止占用端口的進程"
        echo "  2) 使用其他端口"
        read -p "選擇 [1/2]: " choice

        case $choice in
            1)
                echo "正在停止占用端口的進程..."
                kill -9 $(lsof -ti:$PORT) 2>/dev/null || true
                echo -e "${GREEN}✅ 端口已釋放${NC}"
                ;;
            2)
                echo "請編輯 docker-compose.yml 修改端口映射"
                exit 1
                ;;
            *)
                echo -e "${RED}無效的選擇${NC}"
                exit 1
                ;;
        esac
    else
        echo -e "${GREEN}✅ 端口 $PORT 可用${NC}"
    fi
}

# 停止舊容器
stop_old_containers() {
    echo "🛑 停止舊容器（如果存在）..."
    docker-compose down 2>/dev/null || true
    echo -e "${GREEN}✅ 舊容器已停止${NC}"
}

# 構建並啟動
build_and_start() {
    echo "🏗️  構建並啟動容器..."
    docker-compose up -d --build

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 容器啟動成功${NC}"
    else
        echo -e "${RED}❌ 容器啟動失敗${NC}"
        echo "查看日誌: docker-compose logs"
        exit 1
    fi
}

# 等待服務就緒
wait_for_service() {
    echo "⏳ 等待服務就緒..."
    local MAX_ATTEMPTS=30
    local ATTEMPT=0

    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if curl -s http://localhost:8080/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 服務已就緒${NC}"
            return 0
        fi
        ATTEMPT=$((ATTEMPT + 1))
        echo -n "."
        sleep 1
    done

    echo -e "${YELLOW}⚠️  服務可能需要更多時間啟動${NC}"
    echo "手動檢查: curl http://localhost:8080/health"
}

# 顯示訪問信息
show_access_info() {
    echo ""
    echo "========================================="
    echo -e "${GREEN}🎉 部署成功！${NC}"
    echo "========================================="
    echo ""
    echo "訪問方式："
    echo "  🎓 學習中心: http://localhost:8080/"
    echo "  🛠️  構建模式: http://localhost:8080/index.html"
    echo "  🏆 成就中心: http://localhost:8080/achievement-test.html"
    echo ""
    echo "管理命令："
    echo "  查看日誌: docker-compose logs -f"
    echo "  停止服務: docker-compose down"
    echo "  重啟服務: docker-compose restart"
    echo ""
    echo "健康檢查："
    echo "  curl http://localhost:8080/health"
    echo ""
    echo "========================================="
}

# 主函數
main() {
    check_docker
    check_docker_compose
    check_docker_running
    check_port
    stop_old_containers
    build_and_start
    wait_for_service
    show_access_info

    # 詢問是否在瀏覽器中打開
    echo ""
    read -p "是否在瀏覽器中打開？[Y/n] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        if command -v open &> /dev/null; then
            open http://localhost:8080/
        elif command -v xdg-open &> /dev/null; then
            xdg-open http://localhost:8080/
        elif command -v start &> /dev/null; then
            start http://localhost:8080/
        else
            echo "請手動在瀏覽器中開啟: http://localhost:8080/"
        fi
    fi
}

# 執行主函數
main
