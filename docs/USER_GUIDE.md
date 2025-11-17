# Vanilla DOM Playground - 完整使用指南

## 📖 目錄

1. [快速開始](#快速開始)
2. [學習模式指南](#學習模式指南)
3. [構建模式指南](#構建模式指南)
4. [成就系統指南](#成就系統指南)
5. [常見問題](#常見問題)
6. [部署指南](#部署指南)
7. [故障排除](#故障排除)

---

## 快速開始

### 環境要求

- **現代瀏覽器**: Chrome 90+、Firefox 88+、Edge 90+、Safari 14+
- **本地伺服器**（可選，但推薦）: Python、Node.js、或 PHP

### 安裝步驟

#### 方法 1：本地伺服器（推薦）

```bash
# 1. 克隆或下載項目
git clone <repository-url>
cd vanilla-dom-playground

# 2. 啟動本機伺服器（選擇其中一種）

# 使用 Python 3
python -m http.server 8000

# 使用 Node.js
npx http-server

# 使用 PHP
php -S localhost:8000
```

#### 方法 2：直接開啟（僅限測試）

**注意**: 某些功能（如 ES 模組）在 `file://` 協議下可能無法正常工作。

```bash
# 直接用瀏覽器開啟 HTML 文件
open index.html  # macOS
start index.html # Windows
```

### 首次使用

1. **學習模式**（推薦新手）: 開啟 `http://localhost:8000/learn.html`
2. **構建模式**（進階用戶）: 開啟 `http://localhost:8000/index.html`

---

## 學習模式指南

### 學習中心 (learn.html)

學習中心是你的學習起點，提供：
- 📊 個人學習進度追蹤
- 🎮 5 個互動遊戲
- 🎓 4 個可視化教程
- 🚀 3 個實戰項目
- 🏆 30 個可解鎖成就

#### 學習路徑建議

**初學者路徑**（1-2 天）
1. 先使用構建器（index.html）熟悉基本操作
2. 玩「打地鼠」遊戲學習 `click` 事件
3. 通過「事件對象解析器」了解 Event 屬性
4. 完成「TODO List Pro」項目鞏固所學

**進階路徑**（3-5 天）
5. 「事件傳播可視化器」深入理解事件機制
6. 「拖放拼圖」掌握完整拖放 API
7. 「事件委託演示器」學習性能優化
8. 「圖片輪播器」項目實戰

**高級路徑**（1-2 週）
9. 完成剩餘遊戲（貪吃蛇、表單驗證、音樂按鍵）
10. 「自定義事件工作坊」學習組件通信
11. 「下拉菜單系統」掌握無障礙設計
12. 解鎖所有成就，成為 DOM 大師！

---

### 遊戲模塊詳解

#### 1. 打地鼠 (game-test.html)

**學習目標**: `click` 事件、`event.isTrusted`、`transitionend`

**操作說明**:
1. 點擊「開始遊戲」按鈕
2. 用滑鼠點擊彈出的地鼠
3. 在 30 秒內獲得最高分

**學習要點**:
- 如何綁定和處理 `click` 事件
- 使用 `event.isTrusted` 防止作弊
- 利用 `transitionend` 控制動畫結束

**成就條件**:
- 完成遊戲：解鎖「首次遊戲」(10 點)
- 得分 ≥100：解鎖「打地鼠新手」(15 點)
- 得分 ≥200：解鎖「打地鼠大師」(30 點)

#### 2. 拖放拼圖 (puzzle-test.html)

**學習目標**: 完整拖放 API（7 個事件）

**操作說明**:
1. 選擇難度（簡單 3×3 / 中等 4×4 / 困難 5×5）
2. 拖動拼圖塊到正確位置
3. 完成拼圖

**學習要點**:
- `dragstart`, `drag`, `dragend` 拖動源事件
- `dragenter`, `dragover`, `dragleave`, `drop` 拖放目標事件
- `dataTransfer` 對象的使用
- 拖放視覺反饋

**成就條件**:
- 完成拼圖：解鎖「拼圖入門」(20 點)
- 30 秒內完成：解鎖「速度之王」(40 點)

#### 3. 貪吃蛇 (snake-test.html)

**學習目標**: `keydown`、`keyup`、遊戲循環

**操作說明**:
1. 點擊「開始遊戲」
2. 用方向鍵控制蛇移動
3. 吃食物增加分數和長度
4. 避免撞牆或自己

**學習要點**:
- 鍵盤事件處理和鍵碼識別
- 使用 `requestAnimationFrame` 創建遊戲循環
- Canvas 2D 繪圖基礎
- 碰撞檢測邏輯

**成就條件**:
- 得分 ≥50：解鎖「貪吃蛇學徒」(15 點)
- 得分 ≥100：解鎖「貪吃蛇高手」(35 點)

#### 4. 表單驗證大師 (form-test.html)

**學習目標**: `input`、`blur`、`submit`、實時驗證

**操作說明**:
1. 填寫表單各欄位
2. 觀察即時驗證反饋
3. 確保所有欄位通過驗證
4. 提交表單

**學習要點**:
- `input` 事件即時驗證
- `blur` 事件失焦驗證
- `submit` 事件表單提交
- Constraint Validation API
- 正則表達式驗證

**成就條件**:
- 完成表單：解鎖「表單專家」(25 點)

#### 5. 音樂按鍵 (music-test.html)

**學習目標**: 鍵盤事件、Web Audio API

**操作說明**:
1. 點擊音符或按鍵盤按鍵
2. 選擇挑戰模式跟隨提示
3. 完成旋律

**學習要點**:
- 鍵盤按鍵映射
- Web Audio API 播放音效
- 視覺反饋同步
- 時間序列處理

**成就條件**:
- 完成挑戰：解鎖「音樂新手」(20 點)

---

### 教程模塊詳解

#### 1. 事件傳播可視化器 (propagation-test.html)

**學習目標**: 捕獲/冒泡/目標階段

**操作說明**:
1. 在嵌套元素上添加事件監聽器
2. 選擇捕獲或冒泡模式
3. 點擊子元素觀察事件傳播順序
4. 查看日誌了解執行順序

**學習要點**:
- 事件傳播三個階段
- `addEventListener` 的 `capture` 參數
- `event.stopPropagation()` 停止傳播
- `event.preventDefault()` 阻止默認行為

**成就條件**:
- 完成教程：解鎖「事件學徒」(15 點)
- 完成所有操作：解鎖「傳播專家」(20 點)

#### 2. 事件對象解析器 (inspector-test.html)

**學習目標**: Event 對象屬性詳解

**操作說明**:
1. 觸發不同類型的事件（click、mousemove、keydown 等）
2. 查看事件對象詳細屬性
3. 對比不同事件的屬性差異

**學習要點**:
- `event.target` vs `event.currentTarget`
- `event.type`, `event.timeStamp`
- 滑鼠事件屬性（clientX/Y、pageX/Y）
- 鍵盤事件屬性（key、code、keyCode）
- 觸控事件屬性

**成就條件**:
- 完成教程：解鎖「偵探高手」(20 點)

#### 3. 事件委託演示器 (delegation-test.html)

**學習目標**: 事件委託模式、性能優化

**操作說明**:
1. 在「無委託」和「有委託」兩側添加多個項目
2. 點擊項目觀察行為
3. 對比兩種方式的性能和代碼

**學習要點**:
- 為何使用事件委託
- 如何在父元素監聽子元素事件
- 使用 `event.target` 識別點擊目標
- 動態元素的事件處理
- 性能優勢（減少監聽器數量）

**成就條件**:
- 完成教程：解鎖「委託大師」(25 點)

#### 4. 自定義事件工作坊 (custom-events-test.html)

**學習目標**: CustomEvent、組件通信

**操作說明**:
1. 創建自定義事件
2. 添加自定義數據
3. 在不同元素間觸發和監聽
4. 觀察事件傳遞過程

**學習要點**:
- `new CustomEvent()` 創建事件
- `detail` 屬性傳遞自定義數據
- `dispatchEvent()` 觸發事件
- 組件間通信模式
- 事件命名規範

**成就條件**:
- 完成教程：解鎖「自定義事件專家」(30 點)

---

### 項目模塊詳解

#### 1. TODO List Pro (todo-test.html)

**學習目標**: 綜合應用、localStorage、拖放排序

**功能特性**:
- ✅ 添加/刪除任務
- ✅ 標記完成/未完成
- ✅ 拖放排序
- ✅ 數據持久化（localStorage）
- ✅ 過濾顯示（全部/進行中/已完成）

**學習要點**:
- DOM 操作（創建、修改、刪除）
- 事件委託處理多個項目
- localStorage API 數據存儲
- 拖放 API 實現排序
- 數據與 UI 同步

**成就條件**:
- 添加 3 個任務：解鎖「項目啟動」(20 點)
- 完成項目：解鎖「TODO 大師」(30 點)

#### 2. 圖片輪播器 (carousel-test.html)

**學習目標**: 響應式輪播、觸摸支持、自動播放

**功能特性**:
- 🖼️ 圖片切換（箭頭、鍵盤、指示器）
- 🖱️ 觸摸/滑鼠拖動切換
- ⏱️ 自動播放（可暫停）
- 📱 響應式設計
- 🎨 縮圖導航

**學習要點**:
- CSS Transform 實現平滑切換
- Touch Events（touchstart/move/end）
- 計時器管理（setInterval/clearInterval）
- 鍵盤導航（左右箭頭）
- 響應式圖片處理

**成就條件**:
- 使用 3 種導航方式：解鎖「輪播專家」(30 點)

#### 3. 下拉菜單系統 (dropdown-test.html)

**學習目標**: 無障礙設計、鍵盤導航、多級菜單

**功能特性**:
- 📋 多級菜單支持
- ⌨️ 鍵盤導航（Tab、Enter、Escape、箭頭鍵）
- 🎯 滑鼠懸停/點擊切換
- ♿ ARIA 無障礙屬性
- 📱 響應式佈局

**學習要點**:
- `mouseenter`/`mouseleave` 懸停效果
- 鍵盤事件處理（Tab、Enter、Escape）
- ARIA 屬性（`aria-expanded`、`role`）
- 焦點管理（`focus()`、`blur()`）
- 點擊外部關閉菜單

**成就條件**:
- 使用 3 種交互方式：解鎖「菜單大師」(35 點)

---

## 構建模式指南

### 主介面 (index.html)

構建模式是一個可視化的 DOM 元素編輯器，讓你無需寫代碼即可：
- 創建和編輯 DOM 元素
- 設置樣式和屬性
- 綁定事件處理器
- 配置 CSS 動畫
- 即時生成可運行代碼

### 基本操作

#### 創建元素

1. 點擊工具欄的元素按鈕（Div、Button、Text、Input、Image）
2. 元素將出現在畫布中央
3. 在右側屬性面板調整樣式

#### 選取元素

- **單選**: 直接點擊元素
- **多選**: Shift + 點擊多個元素
- **框選**: 在空白處拖曳框選
- **取消選取**: 按 Esc 或點擊空白處

#### 移動元素

- **拖曳**: 點擊並拖動元素
- **鍵盤微調**:
  - 方向鍵：移動 1px
  - Shift + 方向鍵：移動 10px
- **吸附對齊**:
  - 自動吸附到網格（可切換）
  - 智慧輔助線對齊其他元素
  - 按住 Alt 暫時停用吸附

#### 調整大小

- 拖動 8 個控制點調整大小
- 按住 Shift 保持寬高比
- 在屬性面板輸入精確數值

### 屬性面板

#### 位置與尺寸
- X、Y 座標
- 寬度、高度
- 單位切換（px / rem / %）

#### 樣式設定
- 背景顏色（顏色選擇器）
- 文字顏色
- 字體大小
- 圓角半徑
- 邊框設定
- 陰影效果

#### 文字內容
- Button、Text 元素可編輯文字
- 支持多行文本

### 事件面板

#### 綁定事件

1. 選擇元素
2. 切換到「事件」標籤
3. 選擇事件類型（click、input 等）
4. 選擇動作範本或自訂代碼
5. 點擊「綁定」

#### 動作範本

- **toggleClass**: 切換 CSS class
- **changeColor**: 改變背景顏色
- **toggleVisibility**: 切換顯示/隱藏
- **setText**: 設定目標元素文字
- **alert**: 彈出提示訊息
- **custom**: 自訂 JavaScript 代碼

#### 進階選項

- **capture**: 使用捕獲階段（預設 false）
- **once**: 僅觸發一次（預設 false）
- **passive**: 被動監聽器（預設 false）

### 動畫面板

#### 設定 Transition

1. 選擇元素
2. 切換到「動畫」標籤
3. 選擇要動畫的屬性（opacity、transform 等）
4. 設定持續時間（Duration）
5. 設定延遲時間（Delay）
6. 選擇緩動函數（Timing Function）

#### 動畫預設

快速套用常用動畫：
- 淡入/淡出（Fade In/Out）
- 滑入/滑出（Slide In/Out）
- 放大/縮小（Scale Up/Down）

#### 即時預覽

點擊「預覽」按鈕測試動畫效果

### 程式碼預覽

#### 即時生成

- 每次修改自動更新代碼
- 分為 HTML、CSS、JavaScript 三個標籤
- 生成最小化、可執行的代碼

#### 複製代碼

1. 點擊「複製 HTML」、「複製 CSS」、「複製 JS」
2. 貼到你的項目中即可使用

#### 代碼特點

- **最小化**: 只包含必要的代碼
- **語義化**: 使用有意義的 ID 和類名
- **獨立**: 複製後即可運行
- **標準**: 遵循現代 Web 標準

### 鍵盤快捷鍵

- `方向鍵`: 移動元素 1px
- `Shift + 方向鍵`: 移動元素 10px
- `Ctrl/Cmd + D`: 複製元素
- `Delete / Backspace`: 刪除元素
- `Esc`: 取消選取
- `Alt`（拖曳時）: 暫時停用吸附

### 右鍵選單

- **複製**: 複製選取的元素
- **刪除**: 刪除選取的元素
- **置於頂層**: 移到最上層
- **置於底層**: 移到最下層
- **上移一層**: 向上移動一層
- **下移一層**: 向下移動一層

---

## 成就系統指南

### 什麼是成就系統？

成就系統是一個遊戲化學習機制，通過解鎖成就來：
- 🎯 提供明確的學習目標
- 🏆 獎勵你的學習進度
- 📊 追蹤你的技能發展
- 🎮 讓學習更有趣

### 成就分類

#### 遊戲成就（10 個，180 點）

- **首次遊戲** (10 點 - 普通) - 完成任意遊戲
- **打地鼠新手** (15 點 - 普通) - 打地鼠得分 ≥100
- **打地鼠大師** (30 點 - 稀有) - 打地鼠得分 ≥200
- **拼圖入門** (20 點 - 普通) - 完成拖放拼圖
- **速度之王** (40 點 - 史詩) - 30 秒內完成拼圖
- **貪吃蛇學徒** (15 點 - 普通) - 貪吃蛇得分 ≥50
- **貪吃蛇高手** (35 點 - 稀有) - 貪吃蛇得分 ≥100
- **表單專家** (25 點 - 稀有) - 完成表單驗證大師
- **音樂新手** (20 點 - 普通) - 完成音樂按鍵挑戰
- **遊戲達人** (50 點 - 史詩) - 完成所有 5 個遊戲

#### 教程成就（6 個，130 點）

- **事件學徒** (15 點 - 普通) - 完成任意教程
- **傳播專家** (20 點 - 普通) - 完成事件傳播可視化器
- **偵探高手** (20 點 - 普通) - 完成事件對象解析器
- **委託大師** (25 點 - 稀有) - 完成事件委託演示器
- **自定義事件專家** (30 點 - 稀有) - 完成自定義事件工作坊
- **教程通關** (60 點 - 史詩) - 完成所有 4 個教程

#### 項目成就（5 個，165 點）

- **項目啟動** (20 點 - 普通) - 完成任意項目
- **TODO 大師** (30 點 - 稀有) - 完成 TODO List Pro
- **輪播專家** (30 點 - 稀有) - 完成圖片輪播器
- **菜單大師** (35 點 - 稀有) - 完成下拉菜單系統
- **項目全通** (70 點 - 史詩) - 完成所有 3 個項目

#### 綜合成就（9 個，515 點）

- **初學者** (0 點) - 總點數 ≥50
- **進階學習者** (0 點) - 總點數 ≥150
- **專家** (0 點) - 總點數 ≥300
- **探索者** (20 點 - 普通) - 訪問所有 12 個模塊
- **夜貓子** (15 點 - 普通) - 凌晨（0-6 點）完成模塊
- **速度挑戰** (50 點 - 史詩) - 一天內完成 5 個模塊
- **連續學習** (25 點 - 稀有) - 連續 3 天訪問平台
- **DOM 大師** (100 點 - 傳說) - 完成所有 12 個模塊
- **完美主義者** (150 點 - 傳說) - 解鎖所有成就

### 稀有度等級

- **普通** (Common) - 基礎成就，易於獲得
- **稀有** (Rare) - 需要一定努力
- **史詩** (Epic) - 具有挑戰性
- **傳說** (Legendary) - 極高難度

### 查看成就

#### 在學習中心 (learn.html)

- 頂部顯示總點數、完成模塊數、解鎖成就數
- 進度條顯示整體完成率

#### 在成就中心 (achievement-test.html)

- 查看所有 30 個成就詳情
- 查看解鎖狀態和進度
- 查看排行榜（本地）
- 重置進度功能

### 成就解鎖通知

當你解鎖成就時，會看到：
- 🎉 動畫彈窗通知
- 🔊 音效提示（需要用戶互動後才能播放）
- 📊 即時更新統計數據

### 數據儲存

- 所有成就數據儲存在瀏覽器 localStorage
- 即使關閉頁面，數據也會保留
- 可在成就中心重置所有進度

---

## 常見問題

### Q1: 為什麼需要本地伺服器？

**A**: ES6 模組（import/export）在 `file://` 協議下受到瀏覽器安全限制。使用本地伺服器可以：
- 正常載入 JavaScript 模組
- 避免 CORS 錯誤
- 獲得更好的開發體驗

### Q2: 成就音效為何不播放？

**A**: 現代瀏覽器要求用戶先與頁面互動才能播放音效（安全策略）。解決方法：
- 點擊頁面任意位置
- 或先開始遊戲/教程
- 之後的成就音效就會正常播放

### Q3: 如何重置成就進度？

**A**:
1. 開啟 `achievement-test.html`
2. 點擊「重置所有進度」按鈕
3. 確認後即可清除所有數據

或在瀏覽器控制台執行：
```javascript
localStorage.clear()
location.reload()
```

### Q4: 代碼複製後無法運行？

**A**: 確保你：
- 複製了所有三個標籤（HTML、CSS、JS）
- 按順序放置代碼（HTML 結構 → CSS 樣式 → JS 行為）
- 將 JavaScript 放在 `<body>` 結尾或使用 `DOMContentLoaded`

### Q5: 多選元素後如何統一修改樣式？

**A**: 目前版本暫不支持批量修改。計劃在未來版本添加此功能。

### Q6: 如何導出完整項目？

**A**: MVP 版本提供代碼複製功能。完整導出（ZIP 檔案）計劃在 M5 階段實現。

### Q7: 是否支持撤銷/重做？

**A**: 撤銷/重做功能計劃在 M4 階段實現。

### Q8: 成就系統是否需要網絡連接？

**A**: **不需要**。所有數據儲存在本地瀏覽器，完全離線可用。

### Q9: 如何在自己的項目中使用成就系統？

**A**:
```html
<!-- 1. 引入自動初始化腳本 -->
<script type="module" src="./js/learning/gamification/autoInit.js"></script>

<!-- 2. 在適當時機調用 API -->
<script>
// 追蹤完成
window.achievementAPI.complete('module-id', { extraData: 'value' });

// 追蹤分數
window.achievementAPI.score('game-id', 150);

// 手動檢查成就
window.achievementAPI.checkAchievements();
</script>
```

詳見 `docs/gamification/INTEGRATION_GUIDE.md`

---

## 部署指南

### GitHub Pages 部署

```bash
# 1. 推送到 GitHub
git push origin main

# 2. 在 GitHub 倉庫設置中
# Settings > Pages > Source: main branch

# 3. 訪問
https://your-username.github.io/vanilla-dom-playground/
```

### Netlify 部署

```bash
# 1. 安裝 Netlify CLI
npm install -g netlify-cli

# 2. 登入
netlify login

# 3. 部署
netlify deploy --prod --dir=.
```

### Vercel 部署

```bash
# 1. 安裝 Vercel CLI
npm install -g vercel

# 2. 登入
vercel login

# 3. 部署
vercel --prod
```

### 自定義伺服器部署

**Nginx 配置範例**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/vanilla-dom-playground;
    index learn.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # 確保 ES 模組正確的 MIME 類型
    location ~* \.js$ {
        add_header Content-Type application/javascript;
    }
}
```

---

## 故障排除

### 問題 1: 模塊載入失敗

**症狀**: 控制台顯示 `Failed to load module script`

**解決方法**:
1. 確保使用本地伺服器（不是 `file://`）
2. 檢查文件路徑是否正確
3. 確認瀏覽器支持 ES6 模組

### 問題 2: 成就未解鎖

**症狀**: 完成模塊但成就未觸發

**解決方法**:
1. 開啟瀏覽器控制台查看錯誤
2. 確認 `window.achievementAPI` 存在
3. 檢查模塊是否正確調用 API
4. 查看 localStorage 中的數據

```javascript
// 控制台檢查
console.log(window.achievementAPI);
console.log(localStorage.getItem('gamification_achievements'));
```

### 問題 3: 樣式顯示異常

**症狀**: 元素位置錯亂或樣式缺失

**解決方法**:
1. 清除瀏覽器緩存
2. 確認 CSS 文件正確載入
3. 檢查 CSS 路徑（相對路徑）
4. 使用瀏覽器開發者工具檢查元素

### 問題 4: localStorage 配額超限

**症狀**: 數據無法保存，控制台顯示 QuotaExceededError

**解決方法**:
```javascript
// 清理舊數據
localStorage.removeItem('old-data-key');

// 或重置所有成就數據
localStorage.removeItem('gamification_achievements');
localStorage.removeItem('gamification_progress');
```

### 問題 5: 粒子特效卡頓

**症狀**: 成就解鎖時動畫不流暢

**解決方法**:
1. 減少粒子數量（修改 particleEffects.js）
2. 關閉其他消耗資源的瀏覽器標籤
3. 使用硬體加速（瀏覽器設置）

### 問題 6: 跨域錯誤

**症狀**: 控制台顯示 CORS 錯誤

**解決方法**:
- 使用本地伺服器而非直接開啟 HTML
- 如需載入外部資源，確保伺服器支持 CORS

---

## 進階技巧

### 自定義成就

修改 `js/learning/gamification/achievements.js`:

```javascript
// 添加新成就
const customAchievement = {
  id: 'custom-achievement',
  name: '自定義成就',
  description: '完成自定義任務',
  points: 50,
  rarity: 'epic',
  condition: (progress) => {
    return progress.custom?.someValue >= 100;
  }
};
```

### 自定義粒子特效

修改 `js/learning/gamification/particleEffects.js`:

```javascript
// 調整粒子數量
const particleCount = 30; // 預設 50

// 調整動畫時長
const duration = 2000; // 預設 3000ms

// 更改顏色
const colors = ['#your-color-1', '#your-color-2'];
```

### 導出學習數據

```javascript
// 控制台執行
const data = {
  achievements: localStorage.getItem('gamification_achievements'),
  progress: localStorage.getItem('gamification_progress'),
  leaderboard: localStorage.getItem('gamification_leaderboard')
};

console.log(JSON.stringify(data, null, 2));
// 複製輸出保存為 JSON 文件
```

### 導入學習數據

```javascript
// 控制台執行
const importData = {
  // 貼上你的數據
};

localStorage.setItem('gamification_achievements', importData.achievements);
localStorage.setItem('gamification_progress', importData.progress);
localStorage.setItem('gamification_leaderboard', importData.leaderboard);

location.reload();
```

---

## 學習資源

### 官方文檔
- [MDN Web Docs - DOM](https://developer.mozilla.org/zh-TW/docs/Web/API/Document_Object_Model)
- [MDN - Event Reference](https://developer.mozilla.org/zh-TW/docs/Web/Events)
- [MDN - Web Audio API](https://developer.mozilla.org/zh-TW/docs/Web/API/Web_Audio_API)

### 項目文檔
- `docs/architecture/OVERVIEW.md` - 架構總覽
- `docs/architecture/EVENT_SYSTEM.md` - 事件系統詳解
- `docs/gamification/INTEGRATION_GUIDE.md` - 成就系統整合指南
- `docs/gamification/TESTING_PLAN.md` - 測試計劃

### 推薦閱讀
- JavaScript.info - 現代 JavaScript 教程
- Eloquent JavaScript - JavaScript 編程精解
- You Don't Know JS - JavaScript 深入理解

---

## 貢獻指南

歡迎貢獻！請遵循以下規範：

### 代碼規範
- 所有註釋使用繁體中文
- 遵循現有代碼風格
- 函數名使用駝峰命名法
- 常量使用大寫加下劃線

### 提交規範
使用 Conventional Commits 格式：
```
feat: 新增功能
fix: 修復 bug
docs: 文檔更新
style: 代碼格式調整
refactor: 代碼重構
test: 測試相關
chore: 其他雜項
```

### Pull Request
1. Fork 本倉庫
2. 創建特性分支 (`git checkout -b feat/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feat/amazing-feature`)
5. 開啟 Pull Request

---

## 授權

MIT License - 詳見 LICENSE 文件

---

## 聯繫方式

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

## 更新日誌

### v1.0.0 (2025-11-17)

- ✅ 完成 M0-M3 基礎功能
- ✅ 實現 5 個遊戲模塊
- ✅ 實現 4 個教程模塊
- ✅ 實現 3 個項目模塊
- ✅ 完整的成就系統（30 個成就）
- ✅ 粒子特效系統
- ✅ 完整測試計劃
- ✅ 綜合文檔

### 未來計劃

- ⏳ M4: 撤銷/重做功能
- ⏳ M5: 完整導出與主題切換
- ⏳ 階段 7: 代碼高亮與片段庫

---

**祝你學習愉快！成為 DOM 大師！** 🎉
