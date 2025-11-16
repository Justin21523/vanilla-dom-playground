# DOM 事件系統完整指南

> **文檔目的**: 詳細記錄項目支持的所有 DOM 事件類型、使用場景、實作細節和測試結果

---

## 📋 事件類型總覽 (50+ 事件)

### 當前支持 (M2 已實現) ✅
| 事件名稱 | 類別 | 冒泡 | 觸發時機 | 遊戲應用 |
|---------|------|------|---------|---------|
| `click` | 鼠標 | ✅ | 鼠標點擊並釋放 | 打地鼠、按鈕交互 |
| `dblclick` | 鼠標 | ✅ | 雙擊 | 快速操作 |
| `mouseenter` | 鼠標 | ❌ | 鼠標移入 | 懸停卡片 |
| `mouseleave` | 鼠標 | ❌ | 鼠標移出 | 懸停卡片 |
| `input` | 表單 | ✅ | 輸入值改變（實時） | 表單驗證 |
| `keydown` | 鍵盤 | ✅ | 按鍵按下 | 貪吃蛇控制 |
| `focus` | 表單 | ❌ | 獲得焦點 | 表單高亮 |
| `blur` | 表單 | ❌ | 失去焦點 | 驗證觸發 |

### 待擴展 (階段1目標) 🚧

#### 鼠標事件組
| 事件名稱 | 冒泡 | 觸發時機 | 與相似事件的區別 |
|---------|------|---------|-----------------|
| `contextmenu` | ✅ | 右鍵菜單 | 可 preventDefault 阻止默認菜單 |
| `mousedown` | ✅ | 鼠標按下 | 比 click 更早，拖拽起點 |
| `mouseup` | ✅ | 鼠標釋放 | 拖拽終點 |
| `mousemove` | ✅ | 鼠標移動 | 高頻觸發，需節流 |
| `mouseover` | ✅ | 鼠標懸停 | 與 mouseenter 區別：會冒泡 |
| `mouseout` | ✅ | 鼠標離開 | 與 mouseleave 區別：會冒泡 |
| `wheel` | ✅ | 鼠標滾輪 | deltaY 判斷方向 |

#### 鍵盤事件組
| 事件名稱 | 冒泡 | 觸發時機 | 備註 |
|---------|------|---------|------|
| `keyup` | ✅ | 按鍵釋放 | 與 keydown 成對使用 |
| `keypress` | ✅ | 按鍵（已廢棄） | 僅用於教學對比 |

#### 表單事件組
| 事件名稱 | 冒泡 | 觸發時機 | 應用場景 |
|---------|------|---------|---------|
| `change` | ✅ | 值改變並失焦 | select、checkbox、radio |
| `submit` | ✅ | 表單提交 | 驗證攔截 |
| `reset` | ✅ | 表單重置 | 清空提示 |
| `select` | ✅ | 選中文本 | 文本編輯器 |
| `invalid` | ❌ | HTML5 驗證失敗 | 原生驗證提示 |
| `focusin` | ✅ | 獲得焦點（冒泡版） | 事件委託場景 |
| `focusout` | ✅ | 失去焦點（冒泡版） | 事件委託場景 |

#### 拖放事件組 (重點學習) 🎯
| 事件名稱 | 觸發元素 | 觸發時機 | 關鍵要點 |
|---------|---------|---------|---------|
| `dragstart` | 被拖動元素 | 開始拖動 | 設置 dataTransfer |
| `drag` | 被拖動元素 | 拖動中 | 高頻觸發 |
| `dragend` | 被拖動元素 | 拖動結束 | 清理狀態 |
| `dragenter` | 目標元素 | 拖入目標 | 視覺反饋 |
| `dragover` | 目標元素 | 在目標上方 | **必須 preventDefault 才能 drop** |
| `dragleave` | 目標元素 | 離開目標 | 移除高亮 |
| `drop` | 目標元素 | 放下 | 獲取 dataTransfer，執行邏輯 |

#### 窗口/文檔事件組
| 事件名稱 | 目標 | 觸發時機 | 應用場景 |
|---------|------|---------|---------|
| `load` | window | 所有資源加載完成 | 圖片、腳本等 |
| `DOMContentLoaded` | document | DOM 解析完成 | 早於 load |
| `resize` | window | 窗口大小改變 | 響應式布局，需防抖 |
| `scroll` | window/element | 滾動 | 無限滾動、返回頂部 |
| `beforeunload` | window | 即將離開頁面 | 保存提醒 |
| `unload` | window | 頁面卸載 | 清理資源 |

#### 動畫/過渡事件組 (CSS 配合)
| 事件名稱 | 觸發時機 | event 屬性 |
|---------|---------|-----------|
| `animationstart` | CSS 動畫開始 | animationName |
| `animationend` | CSS 動畫結束 | animationName, elapsedTime |
| `animationiteration` | 動畫循環一次 | iterationCount |
| `transitionend` | CSS 過渡結束 | propertyName, elapsedTime |

#### 剪貼板事件組
| 事件名稱 | 觸發時機 | 訪問數據 |
|---------|---------|---------|
| `copy` | 複製 | event.clipboardData.setData() |
| `cut` | 剪切 | 同上 |
| `paste` | 粘貼 | event.clipboardData.getData() |

#### 其他事件
| 事件名稱 | 類別 | 應用場景 |
|---------|------|---------|
| `error` | 資源 | 圖片加載失敗 |
| `abort` | 資源 | 資源加載中止 |
| `online` | 網絡 | 恢復網絡連接 |
| `offline` | 網絡 | 失去網絡連接 |
| `storage` | 存儲 | LocalStorage 改變 |
| `message` | 通信 | postMessage 接收 |

#### 觸摸事件組 (可選，移動端)
| 事件名稱 | 觸發時機 | 備註 |
|---------|---------|------|
| `touchstart` | 觸摸開始 | touches 數組 |
| `touchmove` | 觸摸移動 | 需 preventDefault 防止滾動 |
| `touchend` | 觸摸結束 | changedTouches |
| `touchcancel` | 觸摸取消 | 系統中斷（來電等） |

---

## 🎯 事件學習優先級

### 第一階梯 - 基礎必學 (已實現 ✅)
1. **click** - 最基本的交互
2. **input** - 表單實時響應
3. **keydown** - 鍵盤控制

### 第二階梯 - 常用進階
4. **mouseenter/leave** - 懸停效果
5. **focus/blur** - 表單焦點管理
6. **submit** - 表單提交攔截
7. **change** - 下拉選擇、複選框

### 第三階梯 - 專項深入
8. **拖放 API** (7個事件) - 最複雜但最實用
9. **mousedown/move/up** - 自定義拖拽
10. **animationend/transitionend** - 動畫回調

### 第四階梯 - 完整掌握
11. **scroll/resize** - 性能優化場景
12. **copy/paste** - 剪貼板操作
13. **wheel** - 自定義滾動
14. **contextmenu** - 自定義右鍵菜單

---

## 🔍 核心概念深入

### 1. 事件傳播機制

#### 三個階段
```
1. 捕獲階段 (Capturing Phase)
   Window → Document → HTML → Body → ... → Target 父元素

2. 目標階段 (Target Phase)
   觸發目標元素上的監聽器

3. 冒泡階段 (Bubbling Phase)
   Target 父元素 → ... → Body → HTML → Document → Window
```

#### addEventListener 第三個參數
```javascript
// 冒泡階段監聽 (默認)
element.addEventListener('click', handler, false)

// 捕獲階段監聽
element.addEventListener('click', handler, true)

// 或使用對象形式
element.addEventListener('click', handler, {
  capture: false,  // 捕獲階段？
  once: true,      // 只觸發一次？
  passive: true    // 永不調用 preventDefault？(性能優化)
})
```

#### event.target vs event.currentTarget
```javascript
<div id="parent">
  <button id="child">Click</button>
</div>

parent.addEventListener('click', (e) => {
  console.log(e.target)        // <button> (實際點擊的元素)
  console.log(e.currentTarget) // <div> (綁定監聽器的元素)
})
```

### 2. 事件委託 (Event Delegation)

**原理**: 利用事件冒泡，在父元素上統一處理子元素事件

**優勢**:
- 減少監聽器數量（性能）
- 動態新增的子元素自動生效

**示例**:
```javascript
// ❌ 不好的做法
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('click', handleClick)
})

// ✅ 好的做法
document.getElementById('list').addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    handleClick(e)
  }
})
```

### 3. 默認行為與阻止

#### preventDefault()
阻止瀏覽器默認行為：
- `<a>` 點擊 → 阻止跳轉
- `<form>` 提交 → 阻止刷新頁面
- `dragover` → 允許 drop
- 右鍵 → 阻止默認菜單

#### stopPropagation()
阻止事件傳播（冒泡/捕獲）

#### stopImmediatePropagation()
立即阻止，同元素上的其他監聽器也不執行

### 4. 自定義事件

```javascript
// 創建自定義事件
const myEvent = new CustomEvent('userLogin', {
  detail: { username: 'Alice', timestamp: Date.now() },
  bubbles: true,
  cancelable: true
})

// 分發事件
element.dispatchEvent(myEvent)

// 監聽自定義事件
element.addEventListener('userLogin', (e) => {
  console.log(e.detail.username) // 'Alice'
})
```

---

## 🎮 遊戲中的事件應用

### 打地鼠 (Whack-a-Mole)
**使用事件**:
- `click` - 點擊地鼠
- `transitionend` - 地鼠縮回動畫結束
- `animationend` - 得分動畫結束

**關鍵實現**:
```javascript
mole.addEventListener('click', (e) => {
  if (!e.isTrusted) return // 防作弊
  score++
  e.target.classList.add('hit')
})
```

### 拖放拼圖 (Drag Puzzle)
**使用事件**: 完整拖放 API (7個)

**關鍵實現**:
```javascript
// 被拖動的拼圖塊
piece.addEventListener('dragstart', (e) => {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', piece.id)
})

// 目標位置
slot.addEventListener('dragover', (e) => {
  e.preventDefault() // 關鍵！必須阻止默認行為
  e.dataTransfer.dropEffect = 'move'
})

slot.addEventListener('drop', (e) => {
  e.preventDefault()
  const pieceId = e.dataTransfer.getData('text/plain')
  // 驗證是否正確位置...
})
```

### 貪吃蛇 (Snake Game)
**使用事件**:
- `keydown` - 方向控制
- `keyup` - 防止連續輸入

**關鍵實現**:
```javascript
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowUp':
      if (direction !== 'down') direction = 'up'
      break
    // ...
  }
  e.preventDefault() // 防止頁面滾動
})
```

### 表單驗證大師 (Form Master)
**使用事件**:
- `input` - 實時驗證
- `blur` - 失焦驗證
- `submit` - 最終攔截
- `invalid` - HTML5 驗證

**關鍵實現**:
```javascript
emailInput.addEventListener('input', (e) => {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)
  e.target.classList.toggle('invalid', !isValid)
})

form.addEventListener('submit', (e) => {
  e.preventDefault() // 阻止默認提交
  if (validateAll()) {
    showSuccess()
  }
})
```

### 音樂按鍵 (Music Keys)
**使用事件**:
- `keydown` - 按下播放音符
- `keyup` - 釋放停止
- `transitionend` - 按鍵動畫

**關鍵實現**:
```javascript
document.addEventListener('keydown', (e) => {
  if (e.repeat) return // 忽略長按重複
  const audio = sounds[e.key]
  if (audio) {
    audio.currentTime = 0
    audio.play()
    visualize(e.key)
  }
})
```

---

## 🧪 測試計劃與結果

### 測試矩陣

| 事件類型 | Chrome | Firefox | Safari | Edge | 備註 |
|---------|--------|---------|--------|------|------|
| click | ✅ | ✅ | ✅ | ✅ | 全瀏覽器支持 |
| dblclick | ✅ | ✅ | ✅ | ✅ | - |
| drag* | ✅ | ✅ | ⚠️ | ✅ | Safari 需額外設置 |
| wheel | ✅ | ✅ | ✅ | ✅ | deltaMode 不同 |
| paste | ✅ | ✅ | ⚠️ | ✅ | Safari 權限問題 |

### 已知問題

#### 1. Safari 拖放問題
**問題**: 需要顯式設置 `-webkit-user-drag: element`
**解決方案**:
```css
[draggable="true"] {
  -webkit-user-drag: element;
}
```

#### 2. Passive 事件監聽器
**問題**: Chrome 警告 "Added non-passive event listener to a scroll-blocking event"
**解決方案**:
```javascript
element.addEventListener('touchstart', handler, { passive: true })
```

#### 3. 移動端 click 延遲
**問題**: 300ms 延遲
**解決方案**:
```html
<meta name="viewport" content="width=device-width">
```
或使用 `touchend` + `preventDefault`

---

## 📝 實作筆記

### 階段 1 實作記錄 (待填寫)

**日期**: 2025-11-16
**任務**: 擴展 eventsPanel.js 支持 50+ 事件

**實作細節**:
- [ ] 將事件列表重構為分類結構
- [ ] 每個事件添加 tooltip 說明
- [ ] 添加「學習模式」標記（基礎/進階/專家）
- [ ] 實現事件過濾器（按類別篩選）

**遇到的問題**:
- (待記錄)

**解決方案**:
- (待記錄)

**測試結果**:
- (待記錄)

---

## 📚 參考資源

### 官方文檔
- [MDN - Event reference](https://developer.mozilla.org/en-US/docs/Web/Events)
- [MDN - EventTarget.addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
- [MDN - Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)

### 進階閱讀
- [JavaScript.info - Bubbling and capturing](https://javascript.info/bubbling-and-capturing)
- [Philip Walton - Passive Event Listeners](https://developers.google.com/web/updates/2016/06/passive-event-listeners)

---

**文檔維護**: 持續更新中
**最後測試日期**: 待測試
