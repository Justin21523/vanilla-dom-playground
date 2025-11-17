# Vanilla DOM Playground

**一個全功能的 DOM 學習平台** - 通過遊戲、教程和實戰項目，深入掌握 JavaScript DOM 操作與事件處理

🎮 **5個趣味遊戲** | 🎓 **4個可視化教程** | 🚀 **3個實戰項目** | ⚡ **50+ DOM 事件**

## 快速開始

1. 直接用瀏覽器開啟 `index.html`
2. 或使用本機伺服器（推薦）：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx http-server

# 使用 PHP
php -S localhost:8000
```

然後在瀏覽器開啟 `http://localhost:8000`

## 目前功能

### M0 - 骨架 ✅
- ✅ 新增元素（Div、Button、Text、Input、Image）
- ✅ 選取元素（點擊選取）
- ✅ 拖曳元素移動位置
- ✅ 調整元素大小（8 個控制點）
- ✅ 屬性面板編輯：
  - 位置與尺寸（X, Y, 寬度, 高度）
  - 樣式（背景色、文字色、字體大小、圓角）
  - 文字內容（Button、Text 元素）
- ✅ 即時程式碼預覽（HTML/CSS/JS）
- ✅ 複製生成的程式碼

### M1 - 互動 ✅
- ✅ **智慧輔助線** - 拖曳時自動對齊其他元素的邊緣/中心
- ✅ **網格吸附** - 可切換的網格對齊（按住 Alt 暫時停用）
- ✅ **多選功能** - Shift+Click 多選元素
- ✅ **框選** - 拖曳空白處框選多個元素
- ✅ **Z 軸控制** - 右鍵選單調整圖層順序
- ✅ **複製元素** - 右鍵選單或 Ctrl+D 快速複製
- ✅ **鍵盤微調** - 方向鍵精確移動元素（Shift+方向鍵移動 10px）

### M2 - 事件 ✅
- ✅ **事件面板** - 視覺化綁定 DOM 事件
- ✅ **支援事件** - click、input、mouseenter、mouseleave、dblclick、keydown、focus、blur
- ✅ **動作範本**：
  - **toggleClass** - 切換 CSS class
  - **changeColor** - 改變背景顏色
  - **toggleVisibility** - 切換顯示/隱藏
  - **setText** - 設定目標元素的文字
  - **alert** - 彈出提示訊息
  - **custom** - 自訂 JavaScript 程式碼
- ✅ **進階選項** - capture（捕獲）、once（單次）、passive（被動）
- ✅ **即時測試** - 直接測試綁定的事件
- ✅ **程式碼輸出** - 自動生成可執行的事件處理器程式碼

### M3 - 動畫 ✅
- ✅ **動畫面板** - 視覺化設定 CSS Transitions
- ✅ **Transition 控制**：
  - **Property** - 選擇要動畫的屬性（all、opacity、transform、color 等）
  - **Duration** - 持續時間（0-2000ms，拖拉條調整）
  - **Delay** - 延遲時間（0-2000ms）
  - **Timing Function** - 緩動函數（ease、linear、ease-in/out、bounce）
- ✅ **動畫預設** - 6 種常用動畫效果：
  - **淡入/淡出** (Fade In/Out)
  - **滑入/滑出** (Slide In/Out)
  - **放大/縮小** (Scale Up/Down)
- ✅ **即時預覽** - 點擊按鈕預覽動畫效果
- ✅ **程式碼輸出** - 自動生成 CSS transition 規則

## 鍵盤快捷鍵

- `方向鍵` - 移動選取的元素 1px
- `Shift + 方向鍵` - 移動選取的元素 10px
- `Ctrl/Cmd + D` - 複製選取的元素
- `Delete` / `Backspace` - 刪除選取的元素
- `Esc` - 取消選取
- `Alt` (拖曳時) - 暫時停用吸附功能

## 滑鼠操作

- `左鍵點擊` - 選取元素
- `Shift + 左鍵` - 多選元素
- `空白處拖曳` - 框選多個元素
- `右鍵點擊元素` - 開啟右鍵選單（複製、刪除、圖層順序）

## 專案結構

```
vanilla-dom-playground/
├── index.html          # 主頁面
├── CLAUDE.md          # 開發指南（給 AI 參考）
├── css/
│   ├── reset.css      # CSS 重置
│   └── app.css        # 主要樣式
└── js/
    ├── main.js        # 應用程式入口
    ├── core/          # 核心模組
    │   ├── eventBus.js     # 事件匯流排（Pub/Sub）
    │   ├── state.js        # 狀態管理
    │   ├── domUtils.js     # DOM 工具函數
    │   ├── geometry.js     # 幾何計算（吸附、對齊）
    │   └── codegen.js      # 程式碼產生器
    ├── stage/         # 畫布模組
    │   ├── stage.js        # 畫布控制器
    │   ├── selection.js    # 選取系統
    │   └── snaplines.js    # 智慧輔助線
    ├── panels/        # 面板模組
    │   ├── propertiesPanel.js  # 屬性面板
    │   ├── eventsPanel.js      # 事件面板
    │   └── animationsPanel.js  # 動畫面板
    └── ui/            # UI 模組
        ├── toolbar.js      # 工具列
        ├── codePreview.js  # 程式碼預覽
        └── contextMenu.js  # 右鍵選單
```

## 🎯 學習模式

### 🎮 遊戲化挑戰
通過趣味遊戲掌握 DOM 事件處理：

| 遊戲 | 難度 | 學習重點 |
|------|------|---------|
| 🦫 打地鼠 | ⭐ | click、event.isTrusted、transitionend |
| 🧩 拖放拼圖 | ⭐⭐ | 完整拖放 API (7個事件) |
| 🐍 貪吃蛇 | ⭐⭐ | keydown/keyup、遊戲循環 |
| 📝 表單驗證大師 | ⭐⭐⭐ | input/blur/submit、實時驗證 |
| 🎹 音樂按鍵 | ⭐⭐ | Audio API、按鍵事件 |

### 🎓 可視化教程
深入理解 DOM 事件核心概念：

- **事件傳播可視化器** - 捕獲/冒泡/目標階段完整演示
- **事件委託演示器** - 性能優化實戰
- **自定義事件工作坊** - CustomEvent、組件通信
- **事件對象解析器** - Event 屬性全面解析

### 🚀 實戰項目
真實世界的項目模板：

- **TODO List Pro** - 任務管理（拖放排序、LocalStorage）
- **圖片輪播器** - 響應式輪播（自動播放、觸摸滑動）
- **下拉菜單系統** - 無障礙多級菜單（鍵盤導航）

---

## 開發路線圖

### 已完成 ✅
- [x] **M0: 骨架** - 基本版面與元素操作
- [x] **M1: 互動** - 智慧輔助線、多選、框選、Z軸控制
- [x] **M2: 事件** - 事件綁定與動作範本（8 種事件）
- [x] **M3: 動畫** - CSS Transitions 與預設動畫
- [x] **階段 1** - 擴展事件支持到 62 種類型（8 大分組）✅
- [x] **階段 2** - 5 個遊戲模塊（~3,660 行代碼）✅
- [x] **階段 3** - 4 個可視化教程（~2,080 行代碼）✅
- [x] **階段 4** - 3 個實戰項目（~2,020 行代碼）✅
- [x] **階段 6** - 粒子特效系統（~420 行代碼）✅

### 進行中 🔄
- [ ] **文檔更新** - 完善項目文檔和測試記錄
- [ ] **主頁面整合** - 將所有模塊整合到主 index.html

### 規劃中 🚧
- [ ] **階段 5** - 成就系統、進度追蹤、排行榜
- [ ] **階段 7** - 代碼高亮、片段庫、高級導出
- [ ] **M4: 歷史** - 撤銷/重做功能
- [ ] **M5: 匯出 & 打磨** - 主題切換、完整匯出

## 📊 項目統計

**代碼規模**:
- **~14,000 行**純 Vanilla JavaScript 代碼
- JavaScript: ~9,000 行
- CSS: ~5,000 行

**功能模塊**:
- 🎮 遊戲: 5 個（打地鼠、拖放拼圖、貪吃蛇、表單驗證、音樂按鍵）
- 📚 教程: 4 個（事件傳播、事件對象、事件委託、自定義事件）
- 🚀 項目: 3 個（TODO List Pro、圖片輪播器、下拉菜單）
- 🎨 特效: 1 個粒子系統（6 種特效）
- 📄 測試頁面: 13 個獨立測試頁面

**事件系統**:
- 62 個 DOM 事件類型
- 8 個分組（鼠標、鍵盤、表單、拖放、觸控、媒體、動畫、其他）

**技術覆蓋**:
- Canvas 2D API / Web Audio API
- Drag & Drop API / localStorage API
- CustomEvent API / Constraint Validation API
- CSS Animations / Transitions / Transform
- Flexbox / Grid 布局
- 響應式設計 / ARIA 無障礙

---

## 技術特點

- 純 Vanilla JavaScript（無框架依賴）
- ES6 模組化架構
- 事件匯流排（Pub/Sub）模式
- 集中式狀態管理
- 即時程式碼生成

## 📚 文檔

詳細的設計文檔和測試記錄位於 `/docs` 目錄：

```
docs/
├── architecture/        # 架構設計
│   ├── OVERVIEW.md     # 總體架構
│   └── EVENT_SYSTEM.md # 事件系統詳解
├── games/              # 遊戲設計
│   └── GAMES.md        # 5個遊戲完整設計
├── tutorials/          # 教程設計
│   └── TUTORIALS.md    # 4個教程詳細說明
├── projects/           # 項目設計
│   └── PROJECTS.md     # 3個實戰項目
└── testing/            # 測試記錄
    └── TEST_RESULTS.md # 測試結果與問題追蹤
```

---

## 🎓 學習路徑建議

### 初學者路徑
1. 使用構建器熟悉 DOM 基礎操作
2. 玩打地鼠遊戲學習 `click` 事件
3. 通過事件對象解析器了解 Event 屬性
4. 完成 TODO List 項目鞏固所學

### 進階路徑
5. 事件傳播可視化器深入理解機制
6. 拖放拼圖掌握完整拖放 API
7. 事件委託演示器學習性能優化
8. 圖片輪播器項目實戰

### 高級路徑
9. 貪吃蛇/表單驗證/音樂按鍵綜合應用
10. 自定義事件工作坊學習組件通信
11. 下拉菜單系統掌握無障礙設計
12. 解鎖所有成就，成為 DOM 大師！

---

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

**貢獻指南**:
- 所有代碼註釋使用中文
- 遵循現有代碼風格
- 提交前手動測試所有功能
- 更新相關文檔

---

## 授權

MIT License
