# Vanilla DOM Playground - 架構總覽

> **最後更新**: 2025-11-16
> **版本**: v2.0 (學習平台升級版)

---

## 專案目標

打造一個**全功能 DOM 學習平台**，結合：
- **互動式構建器** - 可視化創建和操作 DOM 元素
- **遊戲化挑戰** - 通過5個小遊戲學習事件處理
- **可視化教程** - 深入理解事件傳播、委託等核心概念
- **實戰項目** - 3個真實世界的項目模板

---

## 完整模塊結構

```
/vanilla-dom-playground
├── index.html                 # 主應用入口
├── LLM_PROVIDER.md                 # AI 開發指南
├── README.md                 # 用戶文檔
├── start.md                  # 快速開始
├── css/
│   ├── reset.css            # CSS 重置
│   ├── app.css              # 主樣式
│   ├── games.css            # 遊戲模式樣式
│   ├── tutorials.css        # 教程樣式
│   └── effects.css          # 粒子特效樣式
├── js/
│   ├── main.js              # 應用入口
│   │
│   ├── core/                # 核心系統 (已有)
│   │   ├── eventBus.js      # 事件總線 (Pub/Sub)
│   │   ├── state.js         # 狀態管理
│   │   ├── domUtils.js      # DOM 工具函數
│   │   ├── geometry.js      # 幾何計算
│   │   ├── codegen.js       # 代碼生成器
│   │   └── history.js       # 歷史/撤銷重做
│   │
│   ├── stage/               # 畫布系統 (已有)
│   │   ├── stage.js         # 畫布控制器
│   │   ├── selection.js     # 選擇系統
│   │   └── snaplines.js     # 智能輔助線
│   │
│   ├── panels/              # 面板系統 (已有)
│   │   ├── propertiesPanel.js
│   │   ├── eventsPanel.js   # 將擴展到50+事件
│   │   └── animationsPanel.js
│   │
│   ├── ui/                  # UI 組件 (擴展中)
│   │   ├── toolbar.js       # 工具欄
│   │   ├── codePreview.js   # 代碼預覽
│   │   ├── contextMenu.js   # 右鍵菜單
│   │   ├── eventLog.js      # 事件日志
│   │   ├── projectManager.js
│   │   ├── colorPicker.js
│   │   ├── particleEffects.js     # 🆕 粒子特效系統
│   │   ├── animations.js          # 🆕 高級動畫控制器
│   │   ├── progressRing.js        # 🆕 進度環組件
│   │   ├── achievementPopup.js    # 🆕 成就彈窗
│   │   └── leaderboard.js         # 🆕 排行榜
│   │
│   ├── learning/            # 🆕 學習模式核心
│   │   ├── learningMode.js  # 學習模式管理器
│   │   ├── challenges.js    # 挑戰系統
│   │   ├── achievements.js  # 成就/徽章系統
│   │   ├── progress.js      # 學習進度追蹤
│   │   │
│   │   ├── games/           # 遊戲模塊
│   │   │   ├── whackAMole.js      # 打地鼠
│   │   │   ├── snakeGame.js       # 貪吃蛇
│   │   │   ├── dragPuzzle.js      # 拖放拼圖
│   │   │   ├── formMaster.js      # 表單驗證大師
│   │   │   └── musicKeys.js       # 音樂按鍵遊戲
│   │   │
│   │   ├── tutorials/       # 教程模塊
│   │   │   ├── eventPropagation.js  # 事件傳播可視化
│   │   │   ├── eventDelegation.js   # 事件委託演示
│   │   │   ├── customEvents.js      # 自定義事件工作坊
│   │   │   └── eventInspector.js    # 事件對象解析器
│   │   │
│   │   └── projects/        # 實戰項目模板
│   │       ├── todoList.js        # TODO List Pro
│   │       ├── carousel.js        # 圖片輪播器
│   │       └── dropdownMenu.js    # 下拉菜單系統
│   │
│   └── utils/               # 🆕 工具模塊
│       ├── codeHighlight.js # Prism.js 集成
│       ├── snippets.js      # 代碼片段庫
│       └── export.js        # 高級導出 (ZIP/CodePen)
│
├── assets/                  # 資源文件
│   ├── icons/              # 圖標
│   ├── sounds/             # 音效 (遊戲用)
│   └── images/             # 圖片素材
│
└── docs/                   # 📚 文檔系統
    ├── architecture/       # 架構文檔
    │   ├── OVERVIEW.md    # 本文件
    │   └── EVENT_SYSTEM.md # 事件系統設計
    ├── games/             # 遊戲文檔
    │   └── GAMES.md       # 所有遊戲的設計與實作
    ├── tutorials/         # 教程文檔
    │   └── TUTORIALS.md   # 教程設計與測試結果
    ├── projects/          # 項目文檔
    │   └── PROJECTS.md    # 實戰項目文檔
    └── testing/           # 測試文檔
        └── TEST_RESULTS.md # 測試記錄與發現
```

---

## 核心架構設計

### 1. 事件總線 (Event Bus)

**位置**: `js/core/eventBus.js`

所有模塊通過事件總線通信，實現低耦合：

```javascript
// API
subscribe(topic, handler) => unsubscribe()
publish(topic, payload)
once(topic, handler)
```

**關鍵事件主題**:
- `stage/*` - 舞台相關（element/created, selected, updated, deleted）
- `panel/*` - 面板相關（properties/change, events/bind, animations/change）
- `learning/*` - 🆕 學習模式（game/start, tutorial/complete, achievement/unlock）
- `app/*` - 應用設置（settings/change, theme/toggle）

---

### 2. 狀態管理 (State)

**位置**: `js/core/state.js`

集中式狀態管理，包含：

```typescript
AppState = {
  // 構建器模式狀態
  elements: Map<string, ElementNode>
  zOrder: string[]
  selected: Set<string>

  // 🆕 學習模式狀態
  learningMode: {
    currentMode: 'builder' | 'game' | 'tutorial' | 'project'
    currentGame?: string
    currentTutorial?: string
    currentProject?: string
  }

  // 🆕 用戶進度
  userProgress: {
    completedGames: Set<string>
    completedTutorials: Set<string>
    completedProjects: Set<string>
    achievements: Map<string, Achievement>
    stats: {
      totalPlayTime: number
      eventsLearned: Set<string>
      highScores: Map<string, number>
    }
  }

  // 應用設置
  settings: {
    snapToGrid: boolean
    gridSize: number
    showGuides: boolean
    theme: 'light' | 'dark' | 'neon'
    particlesEnabled: boolean
  }
}
```

---

### 3. 命令模式 (Command Pattern)

**位置**: `js/core/history.js`

所有操作可撤銷/重做：

```typescript
interface Command {
  name: string
  do(state: AppState): void
  undo(state: AppState): void
}
```

**命令類型**:
- `AddElement`, `DeleteElement`
- `MoveElement`, `ResizeElement`
- `UpdateStyle`, `UpdateAttr`
- `BindEvent`, `UnbindEvent`
- 🆕 `StartGame`, `CompleteChallenge`

---

### 4. 代碼生成 (CodeGen)

**位置**: `js/core/codegen.js`

生成最小化可運行的 HTML/CSS/JS：

**原則**:
1. 無冗餘 - 不輸出默認值
2. 單例內聯 - 獨特樣式用 inline style
3. 複用提取 - 重複樣式提取為 class
4. 穩定選擇器 - 使用 `id` 綁定事件

---

## 學習模式架構

### 遊戲系統

每個遊戲是獨立模塊，提供統一接口：

```typescript
interface Game {
  name: string
  description: string
  eventsUsed: string[]        // 學習的事件類型
  difficulty: 'easy' | 'medium' | 'hard'

  init(): void                // 初始化遊戲
  start(): void               // 開始遊戲
  pause(): void               // 暫停
  reset(): void               // 重置
  getScore(): number          // 獲取分數
  getCode(): { html, css, js } // 獲取實現代碼
}
```

### 教程系統

交互式教程，步驟式引導：

```typescript
interface Tutorial {
  name: string
  steps: TutorialStep[]
  conceptsCovered: string[]

  init(): void
  nextStep(): void
  prevStep(): void
  complete(): void
}
```

### 成就系統

徽章解鎖與進度追蹤：

```typescript
interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date

  // 解鎖條件
  condition: (state: AppState) => boolean
}
```

---

## 視覺效果系統

### 粒子特效

**位置**: `js/ui/particleEffects.js`

Canvas 粒子系統，支持：
- **爆炸效果** - 點擊、成就解鎖
- **星星飄落** - 遊戲得分
- **波紋擴散** - 按鈕點擊反饋
- **煙花** - 挑戰完成

### 動畫增強

**位置**: `js/ui/animations.js`

高級動畫控制：
- **頁面轉場** - 淡入淡出、滑動
- **元素進入** - 從工具欄飛入舞台
- **彈跳動畫** - 成功提示
- **脈沖發光** - 高亮重要元素

---

## 事件類型擴展

從 8 個擴展到 **50+ 個事件類型**：

### 鼠標事件 (10個)
click, dblclick, contextmenu, mousedown, mouseup, mousemove, mouseenter, mouseleave, mouseover, mouseout

### 鍵盤事件 (3個)
keydown, keyup, keypress

### 表單事件 (7個)
input, change, submit, reset, focus, blur, invalid

### 拖放事件 (7個)
dragstart, drag, dragend, dragenter, dragover, dragleave, drop

### 窗口/文檔事件 (6個)
load, DOMContentLoaded, resize, scroll, beforeunload, unload

### 動畫/過渡事件 (4個)
animationstart, animationend, animationiteration, transitionend

### 觸摸事件 (4個) - 可選
touchstart, touchmove, touchend, touchcancel

### 其他 (9個)
wheel, select, error, abort, copy, cut, paste, online, offline

---

## 性能優化策略

1. **事件委託** - 減少監聽器數量
2. **RAF 批處理** - DOM 寫操作合併到 requestAnimationFrame
3. **節流/防抖** - 高頻事件（resize, scroll, mousemove）
4. **虛擬滾動** - 長列表（如代碼片段庫）
5. **Canvas 離屏渲染** - 粒子特效優化

---

## 數據持久化

使用 `localStorage` 保存：
- 用戶項目（構建器保存的元素）
- 學習進度（已完成遊戲/教程）
- 成就記錄
- 個人設置（主題、網格大小等）
- 最高分排行榜

**數據結構**:
```javascript
localStorage.setItem('vdp_projects', JSON.stringify(projects))
localStorage.setItem('vdp_progress', JSON.stringify(progress))
localStorage.setItem('vdp_achievements', JSON.stringify(achievements))
localStorage.setItem('vdp_settings', JSON.stringify(settings))
```

---

## 開發階段規劃

### ✅ 已完成
- M0: 骨架 - 基本構建器
- M1: 互動 - 拖拽、多選、對齊
- M2: 事件 - 8種事件 + 6種動作
- M3: 動畫 - CSS Transitions

### 🚧 進行中
- **階段 1**: 擴展事件支持到50+
- **階段 6**: 粒子特效系統
- **階段 2**: 前兩個遊戲（打地鼠 + 拖放拼圖）

### 📅 計劃中
- 階段 3: 教程系統
- 階段 4: 實戰項目
- 階段 5: 成就系統
- 階段 7: 代碼增強（高亮、片段庫、導出）
- M4/M5: 歷史功能 + 主題系統

---

## 技術棧

- **純 Vanilla JavaScript** (ES6+)
- **CSS3** (Flexbox, Grid, Animations, Custom Properties)
- **HTML5** (Canvas for particles, LocalStorage)
- **Prism.js** (代碼高亮 - 待集成)
- **無框架依賴** (零構建步驟)

---

## 設計原則

1. **即時反饋** - 所有操作立即可見
2. **零門檻** - 打開即用，無需安裝
3. **漸進式** - 從簡單到複雜的學習路徑
4. **可視化** - 抽象概念圖形化展示
5. **可導出** - 學習成果可複製使用
6. **趣味性** - 遊戲化增強動力

---

## 瀏覽器兼容性

**最低要求**:
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

**使用的現代特性**:
- ES6 Modules
- CSS Custom Properties
- Flexbox/Grid
- Canvas API
- LocalStorage
- ResizeObserver (可選)

---

## 未來擴展方向

1. **移動端支持** - 觸摸事件優化
2. **協作功能** - 實時共享項目（WebSocket）
3. **更多遊戲** - 社區貢獻遊戲模板
4. **AI 助手** - 智能代碼建議
5. **視頻教程** - 嵌入式視頻講解
6. **挑戰排行榜** - 全球排名（需後端）

---

**文檔維護者**: LLMProvider Tooling
**專案開始**: 2025-11
**當前狀態**: 積極開發中 🚀
