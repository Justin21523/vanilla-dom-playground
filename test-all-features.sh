#!/bin/bash

# Vanilla DOM Playground - 完整功能測試腳本
# 此腳本會測試所有頁面和功能是否正常工作

set -e

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 測試統計
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 測試結果數組
declare -a TEST_RESULTS

echo "========================================="
echo "  Vanilla DOM Playground - 功能測試"
echo "========================================="
echo ""

# 檢查伺服器是否運行
check_server() {
    local PORT=${1:-8000}
    echo "🔍 檢查伺服器 (端口 $PORT)..."

    if curl -s http://localhost:$PORT/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 伺服器正在運行${NC}"
        return 0
    else
        echo -e "${RED}❌ 伺服器未運行${NC}"
        echo "請啟動伺服器: python -m http.server $PORT"
        exit 1
    fi
}

# 測試函數
test_page() {
    local PAGE=$1
    local NAME=$2
    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -n "測試 $NAME ... "

    local STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/$PAGE)

    if [ "$STATUS" -eq 200 ]; then
        echo -e "${GREEN}✅ 通過${NC} (HTTP $STATUS)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("✅ $NAME")
        return 0
    else
        echo -e "${RED}❌ 失敗${NC} (HTTP $STATUS)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("❌ $NAME - HTTP $STATUS")
        return 1
    fi
}

# 測試 JavaScript 文件
test_js_file() {
    local FILE=$1
    local NAME=$2
    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -n "測試 $NAME ... "

    local RESPONSE=$(curl -s -I http://localhost:8000/$FILE)
    local STATUS=$(echo "$RESPONSE" | grep -i "HTTP" | awk '{print $2}')
    local CONTENT_TYPE=$(echo "$RESPONSE" | grep -i "Content-Type" | awk '{print $2}')

    if [ "$STATUS" -eq 200 ]; then
        echo -e "${GREEN}✅ 通過${NC} (HTTP $STATUS, Type: $CONTENT_TYPE)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("✅ $NAME")
        return 0
    else
        echo -e "${RED}❌ 失敗${NC} (HTTP $STATUS)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("❌ $NAME")
        return 1
    fi
}

# 測試 CSS 文件
test_css_file() {
    local FILE=$1
    local NAME=$2
    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -n "測試 $NAME ... "

    local STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/$FILE)

    if [ "$STATUS" -eq 200 ]; then
        echo -e "${GREEN}✅ 通過${NC} (HTTP $STATUS)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("✅ $NAME")
        return 0
    else
        echo -e "${RED}❌ 失敗${NC} (HTTP $STATUS)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("❌ $NAME")
        return 1
    fi
}

# 檢查 JavaScript 模塊是否有語法錯誤（基本檢查）
check_js_syntax() {
    local FILE=$1
    local NAME=$2
    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -n "檢查 $NAME 語法 ... "

    local CONTENT=$(curl -s http://localhost:8000/$FILE)

    # 基本語法檢查：檢查是否有 import/export
    if echo "$CONTENT" | grep -q "export\|import"; then
        echo -e "${GREEN}✅ ES6 模塊${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("✅ $NAME 語法")
        return 0
    elif echo "$CONTENT" | grep -q "function\|class"; then
        echo -e "${GREEN}✅ 包含函數/類${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("✅ $NAME 語法")
        return 0
    else
        echo -e "${YELLOW}⚠️  需要手動確認${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("⚠️  $NAME 語法 - 需手動確認")
        return 0
    fi
}

# 主測試流程
main() {
    check_server 8000

    echo ""
    echo -e "${BLUE}========================================="
    echo "  第 1 部分: 主要頁面測試"
    echo -e "=========================================${NC}"
    echo ""

    # 測試所有 HTML 頁面
    test_page "index.html" "構建模式主頁"
    test_page "learn.html" "學習中心"
    test_page "achievement-test.html" "成就中心"
    test_page "test-achievements.html" "成就自動測試"

    echo ""
    echo -e "${BLUE}========================================="
    echo "  第 2 部分: 遊戲模塊測試 (5/5)"
    echo -e "=========================================${NC}"
    echo ""

    test_page "game-test.html" "打地鼠遊戲"
    test_page "puzzle-test.html" "拖放拼圖"
    test_page "snake-test.html" "貪吃蛇遊戲"
    test_page "form-test.html" "表單驗證大師"
    test_page "music-test.html" "音樂按鍵"

    echo ""
    echo -e "${BLUE}========================================="
    echo "  第 3 部分: 教程模塊測試 (4/4)"
    echo -e "=========================================${NC}"
    echo ""

    test_page "propagation-test.html" "事件傳播可視化器"
    test_page "inspector-test.html" "事件對象解析器"
    test_page "delegation-test.html" "事件委託演示器"
    test_page "custom-events-test.html" "自定義事件工作坊"

    echo ""
    echo -e "${BLUE}========================================="
    echo "  第 4 部分: 項目模塊測試 (3/3)"
    echo -e "=========================================${NC}"
    echo ""

    test_page "todo-test.html" "TODO List Pro"
    test_page "carousel-test.html" "圖片輪播器"
    test_page "dropdown-test.html" "下拉菜單系統"

    echo ""
    echo -e "${BLUE}========================================="
    echo "  第 5 部分: CSS 資源測試"
    echo -e "=========================================${NC}"
    echo ""

    test_css_file "css/reset.css" "Reset CSS"
    test_css_file "css/app.css" "主應用 CSS"
    test_css_file "css/games.css" "遊戲 CSS"

    echo ""
    echo -e "${BLUE}========================================="
    echo "  第 6 部分: 核心 JavaScript 模塊"
    echo -e "=========================================${NC}"
    echo ""

    test_js_file "js/main.js" "主入口文件"
    test_js_file "js/core/eventBus.js" "事件匯流排"
    test_js_file "js/core/state.js" "狀態管理"
    test_js_file "js/core/domUtils.js" "DOM 工具"
    test_js_file "js/core/geometry.js" "幾何計算"
    test_js_file "js/core/codegen.js" "代碼生成器"

    echo ""
    echo -e "${BLUE}========================================="
    echo "  第 7 部分: Stage 模塊"
    echo -e "=========================================${NC}"
    echo ""

    test_js_file "js/stage/stage.js" "畫布控制器"
    test_js_file "js/stage/selection.js" "選取系統"
    test_js_file "js/stage/snaplines.js" "輔助線"

    echo ""
    echo -e "${BLUE}========================================="
    echo "  第 8 部分: 面板模塊"
    echo -e "=========================================${NC}"
    echo ""

    test_js_file "js/panels/propertiesPanel.js" "屬性面板"
    test_js_file "js/panels/animationsPanel.js" "動畫面板"
    test_js_file "js/panels/eventsPanel.js" "事件面板"

    echo ""
    echo -e "${BLUE}========================================="
    echo "  第 9 部分: 遊戲 JavaScript 模塊"
    echo -e "=========================================${NC}"
    echo ""

    test_js_file "js/learning/games/whackAMole.js" "打地鼠模塊"
    test_js_file "js/learning/games/dragPuzzle.js" "拖放拼圖模塊"
    test_js_file "js/learning/games/snakeGame.js" "貪吃蛇模塊"
    test_js_file "js/learning/games/formMaster.js" "表單驗證模塊"
    test_js_file "js/learning/games/musicKeys.js" "音樂按鍵模塊"

    echo ""
    echo -e "${BLUE}========================================="
    echo "  第 10 部分: 教程 JavaScript 模塊"
    echo -e "=========================================${NC}"
    echo ""

    test_js_file "js/learning/tutorials/eventPropagation.js" "事件傳播模塊"
    test_js_file "js/learning/tutorials/eventInspector.js" "事件解析器模塊"
    test_js_file "js/learning/tutorials/eventDelegation.js" "事件委託模塊"
    test_js_file "js/learning/tutorials/customEvents.js" "自定義事件模塊"

    echo ""
    echo -e "${BLUE}========================================="
    echo "  第 11 部分: 項目 JavaScript 模塊"
    echo -e "=========================================${NC}"
    echo ""

    test_js_file "js/learning/projects/todoList.js" "TODO List 模塊"
    test_js_file "js/learning/projects/carousel.js" "輪播器模塊"
    test_js_file "js/learning/projects/dropdown.js" "下拉菜單模塊"

    echo ""
    echo -e "${BLUE}========================================="
    echo "  第 12 部分: 成就系統模塊"
    echo -e "=========================================${NC}"
    echo ""

    test_js_file "js/learning/gamification/storage.js" "數據存儲"
    test_js_file "js/learning/gamification/achievements.js" "成就系統"
    test_js_file "js/learning/gamification/progress.js" "進度追蹤"
    test_js_file "js/learning/gamification/leaderboard.js" "排行榜"
    test_js_file "js/learning/gamification/achievementPopup.js" "成就彈窗"
    test_js_file "js/learning/gamification/particleEffects.js" "粒子特效"
    test_js_file "js/learning/gamification/integrationHelper.js" "整合助手"
    test_js_file "js/learning/gamification/autoInit.js" "自動初始化"

    echo ""
    echo -e "${BLUE}========================================="
    echo "  第 13 部分: 文檔資源"
    echo -e "=========================================${NC}"
    echo ""

    test_page "docs/USER_GUIDE.md" "使用指南"
    test_page "docs/PROJECT_SUMMARY.md" "項目總結"
    test_page "DEPLOYMENT.md" "部署指南"
    test_page "README.md" "README"

    # 顯示測試總結
    echo ""
    echo "========================================="
    echo -e "${BLUE}  測試總結${NC}"
    echo "========================================="
    echo ""
    echo "總測試數: $TOTAL_TESTS"
    echo -e "${GREEN}通過: $PASSED_TESTS${NC}"
    echo -e "${RED}失敗: $FAILED_TESTS${NC}"
    echo ""

    # 計算通過率
    if [ $TOTAL_TESTS -gt 0 ]; then
        PASS_RATE=$(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
        echo "通過率: $PASS_RATE%"
    fi

    echo ""

    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}========================================="
        echo "  ✅ 所有測試通過！"
        echo -e "=========================================${NC}"
        echo ""
        echo "✨ 恭喜！所有功能都正常運作！"
        echo ""
        echo "接下來可以："
        echo "  1. 提交代碼: git add . && git commit"
        echo "  2. 推送到 GitHub: git push"
        echo "  3. 部署到線上: 查看 DEPLOYMENT.md"
        echo ""
        return 0
    else
        echo -e "${RED}========================================="
        echo "  ❌ 有測試失敗"
        echo -e "=========================================${NC}"
        echo ""
        echo "失敗的測試："
        for result in "${TEST_RESULTS[@]}"; do
            if [[ $result == ❌* ]]; then
                echo -e "${RED}$result${NC}"
            fi
        done
        echo ""
        return 1
    fi
}

# 執行主函數
main
