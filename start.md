太好了，這個專案超適合你現在的學習目標。先給你一個清楚、可落地的規劃（中文說明為主），再附上一份你可以直接丟給 Claude Code 的「英文專案說明文字」（不幫你主動建檔，純貼上用）。最後我也幫你想好 GitHub repo 名稱與短描述。

# 專案總覽（中文）

目標是做一個「可視化、可拖拉、即時回饋」的 Vanilla JavaScript 練功房：左邊是可拖拉的畫布（Canvas / Stage），右邊是屬性面板與事件面板，底部有即時程式碼視窗。你拖動元素、改 CSS/屬性、綁事件、設定動畫，畫面立刻反映，並且同步把對應的 HTML/CSS/JS 片段顯示出來，讓你以「動手試」取代死記。

## 開發原則

* 純 Vanilla JS（不依賴框架），HTML / CSS / JS 分離。
* 模組化：每個面板/工具各自獨立，彼此透過簡單事件匯流（pub/sub 或自訂事件）溝通。
* 以「最小可用」為起點，逐步擴充（每一步都有清楚驗收）。

## 功能分區（MVP → 進階）

1. 畫布區（Stage / Playground）

* 拖拉建立元素（div、button、img、input…）
* 對齊輔助線、吸附網格（可開關）
* 選取元素時高亮 + 邊框控制點（resize / rotate 先做 resize）

2. 屬性面板（Properties）

* 基本盒模型：width/height/margin/padding/border
* 位置：position/top/left/z-index（MVP 先做 relative/absolute）
* 文字：font-size/font-weight/color/text-align/line-height
* 背景：background-color/background-image（URL）
* 變更即時反映到畫布

3. 事件面板（Events）

* 可選事件：click、dblclick、mouseenter、mouseleave、input、keydown、scroll、dragstart/dragend（MVP 先做 click、input、mouseenter）
* 提供「事件動作範本」下拉：e.g. 改色、切換 class、切換顯示、插入文字…（產生對應 JS 並綁定）
* 事件即時測試 + 解除綁定

4. 動畫面板（Animations）

* CSS Transitions：目標屬性、duration、delay、timing-function
* CSS Keyframes（進階）：可視化節點 + 預覽
* 提供幾個預設動畫：淡入、位移、縮放、旋轉

5. 程式碼視窗（Code Preview）

* 即時同步輸出目前狀態的 HTML / CSS / JS（可複製）
* 只生成必要的最小片段（避免太冗）

6. 專案工具列（Toolbar）

* 新增元素（按鈕、文字、圖片、輸入框）
* 撤銷/重做、清空畫布、匯出（HTML+CSS+JS zip，進階再做）
* 深色/淺色主題（進階）

## 分階段里程碑（每階段約半天～一天）

* **M0：骨架**
  建立專案結構、基本版面（Stage + Properties + Code），能選取元素、即時改變 style。
* **M1：拖拉與選取**
  可拖拉元素、套 outline、顯示尺寸與座標、屬性面板與畫布雙向同步。
* **M2：事件面板（click / input / mouseenter）**
  可挑事件 + 動作範本，立即綁定與測試；Code Preview 同步更新 JS。
* **M3：動畫面板（Transition）**
  可對當前元素設定 transition，提供幾個常用預設。
* **M4：Code Export（基礎）**
  產出最小可運作的 HTML / CSS / JS 三檔案內容（先顯示可複製文字；zip 之後再做）。
* **M5：UX 打磨**
  對齊線、網格吸附、鍵盤微移（方向鍵）、深/淺色主題。

## 專案目錄建議

```
vanilla-dom-playground/
├─ index.html
├─ assets/
│  └─ icons/ ...
├─ css/
│  ├─ reset.css
│  └─ app.css
├─ js/
│  ├─ main.js              // 入口，初始化各模組
│  ├─ core/
│  │  ├─ eventBus.js       // 簡單事件匯流
│  │  ├─ domUtils.js       // 建立/查找/套樣式工具
│  │  └─ codegen.js        // 產生 HTML/CSS/JS 片段
│  ├─ stage/
│  │  ├─ stage.js          // 畫布主控：新增/選取/拖拉/尺寸
│  │  └─ selection.js      // 選取框與控制點
│  ├─ panels/
│  │  ├─ propertiesPanel.js// 屬性面板
│  │  ├─ eventsPanel.js    // 事件面板
│  │  └─ animationsPanel.js// 動畫面板
│  └─ ui/
│     ├─ toolbar.js        // 新增元素/撤銷重做等
│     └─ codePreview.js    // 即時程式碼視窗
└─ README.md               // 先放最小說明（可留白，等你要再補）
```

## 驗收（DoD）

* 不刷新頁面即可：新增元素、拖拉、選取、調整屬性 → 畫布立刻變化。
* 基本事件（click/input/mouseenter）能綁定成功、立刻測試。
* 動畫 Transition 可被設定並預覽。
* Code Preview 能輸出最小可運作片段（可貼到 Codesandbox/本機就跑）。

---

# 交給 Claude Code 的英文說明（可直接貼過去）

> Title: **Vanilla DOM Playground — Interactive HTML/CSS/JS Learning Tool**
> Goal: Build a visual, interactive playground to learn DOM manipulation, CSS properties, events, and basic animations with **Vanilla JavaScript only**. No frameworks.
>
> **Requirements**
>
> * Split files: `index.html`, `css/*.css`, `js/*.js`.
> * Modular architecture: each panel (stage, properties, events, animations, code preview) is a module. Use a minimal event bus for communication.
> * Immediate feedback: any change in the property/event/animation panel reflects on the stage instantly and updates the code preview (HTML/CSS/JS snippets).
> * Event presets: click, input, mouseenter (MVP). Provide simple action presets (toggle class, change color, update text).
> * Animations: CSS transitions (MVP) with a few presets (fade, move, scale, rotate).
> * Code Preview: always shows **minimal** required snippets; avoid redundant code.
>
> **Milestones**
>
> * M0: App skeleton (layout + init), select elements, change style from Properties panel.
> * M1: Drag/resize/select elements on the Stage; two-way sync with Properties.
> * M2: Events panel (click/input/mouseenter) with action presets; live test and unbind.
> * M3: Animations panel (CSS transitions) + preview.
> * M4: Basic export: show minimal HTML/CSS/JS to copy (zip later).
> * M5: UX polish: snap-to-grid, guide lines, dark/light mode.
>
> **Code Style & Docs**
>
> * Explanations and comments **in Chinese** (inline comments, docstrings).
> * Keep functions small and explicit, avoid globals; use dependency injection via module imports.
> * No external UI libs; minimal CSS with utility classes where helpful.
>
> **Deliverables (MVP)**
>
> * A working Stage with draggable elements (div, button, img, input).
> * Properties panel (box model, position, text, background) with instant reflection.
> * Events panel (3 core events + action presets) with live testing.
> * Animations panel (transitions) and a few presets.
> * Code preview module generating minimal HTML/CSS/JS.
>
> **Testing**
>
> * Manual testing via the UI; smoke tests for core utilities if time allows.
>
> **Non-Goals (for now)**
>
> * Keyframes editor, persistence, and zip export (can be future tasks).
>
> **Nice-to-have Later**
>
> * Keyframes timeline editor, templates, sharing links, accessibility hints, keyboard nudging, undo/redo, theming.

---

# 初始工作清單（你現在就能做）

1. 建 repo、建立目錄骨架與空檔案。
2. 先完成 `index.html` 版面：左（Stage）、右（Properties/Events/Animations Tabs）、下（Code Preview）。
3. 做 `eventBus.js`、`domUtils.js`、`stage.js` 初版，讓新增元素與選取能動。
4. 接上 `propertiesPanel.js` 做寬高/顏色/定位的即時控制。
5. `codePreview.js` 先能輸出最小 HTML/CSS。
6. 再補 `eventsPanel.js` 的 click 範本動作（改色/切 class）。

