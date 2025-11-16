# 可視化教程系統 - 設計文檔

> **目標**: 通過交互式可視化教程，深入理解 DOM 事件的核心概念

---

## 🎓 教程總覽

| 教程名稱 | 難度 | 核心概念 | 預計時長 |
|---------|------|---------|---------|
| 事件傳播可視化器 | ⭐⭐ | 捕獲/冒泡/目標階段 | 10分鐘 |
| 事件委託演示器 | ⭐⭐⭐ | 事件委託、性能優化 | 12分鐘 |
| 自定義事件工作坊 | ⭐⭐⭐ | CustomEvent、dispatchEvent | 8分鐘 |
| 事件對象解析器 | ⭐ | Event 屬性、target vs currentTarget | 5分鐘 |

---

## 1. 事件傳播可視化器

### 教學目標
完整理解事件的三個階段：捕獲 → 目標 → 冒泡

### UI 設計
```
┌──────────────────────────────────────────┐
│  📊 事件傳播可視化器                     │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐ │
│  │  🖱️ Window                         │ │
│  │  ┌──────────────────────────────┐ │ │
│  │  │  📄 Document                  │ │ │
│  │  │  ┌────────────────────────┐  │ │ │
│  │  │  │  🏠 HTML               │  │ │ │
│  │  │  │  ┌──────────────────┐ │  │ │ │
│  │  │  │  │  📦 Body         │ │  │ │ │
│  │  │  │  │  ┌────────────┐ │ │  │ │ │
│  │  │  │  │  │ 🎯 Target  │ │ │  │ │ │
│  │  │  │  │  └────────────┘ │ │  │ │ │
│  │  │  │  └──────────────────┘ │  │ │ │
│  │  │  └────────────────────────┘  │ │ │
│  │  └──────────────────────────────┘ │ │
│  └────────────────────────────────────┘ │
│                                          │
│  事件日誌 (實時顯示執行順序):            │
│  ┌────────────────────────────────────┐ │
│  │ 1. [捕獲] Window → click           │ │
│  │ 2. [捕獲] Document → click         │ │
│  │ 3. [捕獲] HTML → click             │ │
│  │ 4. [捕獲] Body → click             │ │
│  │ 5. [目標] Target → click           │ │
│  │ 6. [冒泡] Body → click             │ │
│  │ 7. [冒泡] HTML → click             │ │
│  │ 8. [冒泡] Document → click         │ │
│  │ 9. [冒泡] Window → click           │ │
│  └────────────────────────────────────┘ │
│                                          │
│  控制面板:                               │
│  ☑️ 啟用捕獲階段  ☑️ 啟用冒泡階段       │
│  ☐ stopPropagation  ☐ stopImmediatePropagation │
│  [清空日誌] [重置] [查看代碼]           │
└──────────────────────────────────────────┘
```

### 核心實現
```javascript
class EventPropagationVisualizer {
  constructor() {
    this.eventLog = []
    this.enableCapture = true
    this.enableBubble = true
    this.stopProp = false
    this.stopImmediateProp = false
  }

  init() {
    const elements = [
      { el: window, name: 'Window' },
      { el: document, name: 'Document' },
      { el: document.documentElement, name: 'HTML' },
      { el: document.body, name: 'Body' },
      { el: document.getElementById('target'), name: 'Target' }
    ]

    // 為每個元素同時綁定捕獲和冒泡監聽器
    elements.forEach(({ el, name }) => {
      // 捕獲階段
      el.addEventListener('click', (e) => {
        if (!this.enableCapture) return

        this.logEvent(`[捕獲] ${name}`, e)
        this.highlightElement(name, 'capturing')

        if (this.stopProp) e.stopPropagation()
        if (this.stopImmediateProp) e.stopImmediatePropagation()
      }, true) // capture = true

      // 冒泡階段
      el.addEventListener('click', (e) => {
        if (!this.enableBubble && e.target !== e.currentTarget) return

        const phase = e.target === e.currentTarget ? '目標' : '冒泡'
        this.logEvent(`[${phase}] ${name}`, e)
        this.highlightElement(name, 'bubbling')

        if (this.stopProp) e.stopPropagation()
        if (this.stopImmediateProp) e.stopImmediatePropagation()
      }, false) // capture = false
    })
  }

  logEvent(message, event) {
    const entry = {
      timestamp: Date.now(),
      message: message,
      target: event.target.tagName,
      currentTarget: event.currentTarget === window ? 'Window' :
                     event.currentTarget === document ? 'Document' :
                     event.currentTarget.tagName,
      eventPhase: ['', '捕獲', '目標', '冒泡'][event.eventPhase]
    }

    this.eventLog.push(entry)
    this.renderLog()
  }

  highlightElement(name, phase) {
    const element = document.querySelector(`[data-element="${name}"]`)
    element.classList.add('highlight', `phase-${phase}`)

    // 動畫持續 500ms
    setTimeout(() => {
      element.classList.remove('highlight', `phase-${phase}`)
    }, 500)
  }

  renderLog() {
    const logContainer = document.getElementById('event-log')
    logContainer.innerHTML = this.eventLog
      .map((entry, index) => `
        <div class="log-entry phase-${entry.eventPhase}">
          <span class="log-number">${index + 1}.</span>
          <span class="log-message">${entry.message}</span>
          <span class="log-detail">
            target: ${entry.target} | currentTarget: ${entry.currentTarget}
          </span>
        </div>
      `)
      .join('')
  }
}
```

### 視覺反饋
- **捕獲階段**: 藍色高亮，從外向內動畫
- **目標階段**: 紅色閃爍
- **冒泡階段**: 綠色高亮，從內向外動畫
- **stopPropagation 效果**: 停止處顯示 🚫 標誌

### 學習要點
1. **事件階段順序**: 捕獲 → 目標 → 冒泡
2. **addEventListener 第三個參數**: true = 捕獲，false = 冒泡
3. **event.eventPhase**: 1=捕獲, 2=目標, 3=冒泡
4. **target vs currentTarget**: 點擊元素 vs 綁定元素
5. **stopPropagation 效果**: 阻止後續階段執行

### 交互練習
- [ ] 觀察完整事件流
- [ ] 禁用捕獲階段，觀察變化
- [ ] 禁用冒泡階段，觀察變化
- [ ] 在 Body 階段 stopPropagation，觀察後續被阻止
- [ ] 對比 stopPropagation 和 stopImmediatePropagation

---

## 2. 事件委託演示器

### 教學目標
理解事件委託原理，掌握性能優化技巧

### UI 設計
```
┌──────────────────────────────────────────┐
│  🎯 事件委託演示器                       │
├──────────────────────────────────────────┤
│  方法對比:                               │
│  ┌─────────────────┐ ┌─────────────────┐│
│  │ ❌ 逐個綁定      │ │ ✅ 事件委託      ││
│  │                 │ │                 ││
│  │ 監聽器數量:     │ │ 監聽器數量:     ││
│  │ 100 個          │ │ 1 個            ││
│  │                 │ │                 ││
│  │ 內存: 45 KB     │ │ 內存: 0.5 KB    ││
│  │ 綁定時間: 12ms  │ │ 綁定時間: 1ms   ││
│  └─────────────────┘ └─────────────────┘│
│                                          │
│  動態測試區:                             │
│  ┌────────────────────────────────────┐ │
│  │  [Item 1] [Item 2] [Item 3] ...   │ │
│  │  ... (100 個按鈕)                  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  操作:                                   │
│  [添加新項目] [刪除項目] [清空所有]     │
│                                          │
│  點擊統計:                               │
│  - 逐個綁定: 點擊 Item 5 (響應時間: 2ms)│
│  - 事件委託: 點擊 Item 5 (響應時間: 1ms)│
└──────────────────────────────────────────┘
```

### 核心實現
```javascript
class EventDelegationDemo {
  constructor() {
    this.itemCount = 100
    this.stats = {
      individual: { listeners: 0, memory: 0, time: 0 },
      delegated: { listeners: 0, memory: 0, time: 0 }
    }
  }

  // ❌ 不好的做法：逐個綁定
  setupIndividualListeners() {
    const startTime = performance.now()
    const items = document.querySelectorAll('.individual-method .item')

    items.forEach(item => {
      item.addEventListener('click', (e) => {
        this.handleItemClick(e, 'individual')
      })
    })

    const endTime = performance.now()
    this.stats.individual.listeners = items.length
    this.stats.individual.time = (endTime - startTime).toFixed(2)

    // 估算內存 (粗略)
    this.stats.individual.memory = items.length * 0.45 // KB
  }

  // ✅ 好的做法：事件委託
  setupDelegatedListeners() {
    const startTime = performance.now()
    const container = document.querySelector('.delegated-method .container')

    // 只在父容器上綁定一個監聽器
    container.addEventListener('click', (e) => {
      // 使用 closest 或 matches 檢查目標
      if (e.target.matches('.item') || e.target.closest('.item')) {
        const item = e.target.closest('.item')
        this.handleItemClick({ target: item, currentTarget: container }, 'delegated')
      }
    })

    const endTime = performance.now()
    this.stats.delegated.listeners = 1
    this.stats.delegated.time = (endTime - startTime).toFixed(2)
    this.stats.delegated.memory = 0.5 // KB
  }

  handleItemClick(event, method) {
    const item = event.target.closest ? event.target.closest('.item') : event.target
    const itemText = item.textContent

    console.log(`[${method}] 點擊了: ${itemText}`)
    console.log(`target: ${event.target.tagName}`)
    console.log(`currentTarget: ${event.currentTarget.tagName || event.currentTarget.className}`)

    // 視覺反饋
    item.classList.add('clicked')
    setTimeout(() => item.classList.remove('clicked'), 300)

    this.updateStats(method)
  }

  // 動態添加項目測試
  addItem(container) {
    const newItem = document.createElement('button')
    newItem.className = 'item'
    newItem.textContent = `Item ${++this.itemCount}`

    container.appendChild(newItem)

    // ❌ 逐個綁定需要手動為新項目添加監聽器
    if (container.classList.contains('individual-method')) {
      newItem.addEventListener('click', (e) => {
        this.handleItemClick(e, 'individual')
      })
      this.stats.individual.listeners++
    }

    // ✅ 事件委託自動生效，無需額外操作！
  }

  // 性能測試
  performanceTest() {
    const iterations = 1000

    // 測試逐個綁定
    console.time('Individual binding')
    for (let i = 0; i < iterations; i++) {
      const div = document.createElement('div')
      div.addEventListener('click', () => {})
    }
    console.timeEnd('Individual binding')

    // 測試事件委託
    console.time('Delegated binding')
    const parent = document.createElement('div')
    parent.addEventListener('click', (e) => {
      if (e.target.matches('.item')) {}
    })
    for (let i = 0; i < iterations; i++) {
      const div = document.createElement('div')
      div.className = 'item'
      parent.appendChild(div)
    }
    console.timeEnd('Delegated binding')
  }
}
```

### 學習要點
1. **事件委託原理**: 利用事件冒泡，在父元素統一處理
2. **性能優勢**: 減少監聽器數量，降低內存佔用
3. **動態內容**: 新增元素自動生效
4. **target vs currentTarget**: 委託場景下的區別
5. **matches() vs closest()**: 匹配元素的兩種方法

### 實際應用場景
- 長列表（如表格、商品列表）
- 動態生成的內容（如聊天消息）
- 頁面有大量相同類型的交互元素

---

## 3. 自定義事件工作坊

### 教學目標
學習創建和分發自定義事件，實現組件間通信

### UI 設計
```
┌──────────────────────────────────────────┐
│  🎨 自定義事件工作坊                     │
├──────────────────────────────────────────┤
│  創建事件:                               │
│  ┌────────────────────────────────────┐ │
│  │ 事件名稱: [userLogin_____________] │ │
│  │                                    │ │
│  │ 事件數據 (detail):                 │ │
│  │ {                                  │ │
│  │   "username": "Alice",            │ │
│  │   "timestamp": 1699200000000,     │ │
│  │   "role": "admin"                 │ │
│  │ }                                  │ │
│  │                                    │ │
│  │ ☑️ 冒泡 (bubbles)                  │ │
│  │ ☑️ 可取消 (cancelable)             │ │
│  │ ☐ 組合 (composed) - 穿透 Shadow DOM│ │
│  │                                    │ │
│  │ [創建事件] [分發事件]              │ │
│  └────────────────────────────────────┘ │
│                                          │
│  監聽器:                                 │
│  ┌────────────────────────────────────┐ │
│  │ document.addEventListener('userLogin', (e) => { │
│  │   console.log(e.detail.username) // 'Alice'    │
│  │   console.log(e.detail.role)     // 'admin'    │
│  │ })                                              │
│  └────────────────────────────────────┘ │
│                                          │
│  事件日誌:                               │
│  ┌────────────────────────────────────┐ │
│  │ ✅ 事件 'userLogin' 已分發          │ │
│  │ 📦 detail: { username: 'Alice' ... }│ │
│  │ 🎯 監聽器已觸發 (1 個)              │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### 核心實現
```javascript
class CustomEventWorkshop {
  constructor() {
    this.listeners = new Map()
  }

  // 創建自定義事件
  createEvent(eventName, detail, options = {}) {
    const event = new CustomEvent(eventName, {
      detail: detail,
      bubbles: options.bubbles ?? true,
      cancelable: options.cancelable ?? true,
      composed: options.composed ?? false
    })

    this.logEvent('創建', eventName, detail)
    return event
  }

  // 分發事件
  dispatchEvent(target, event) {
    const defaultPrevented = !target.dispatchEvent(event)

    this.logEvent('分發', event.type, event.detail, {
      defaultPrevented,
      bubbles: event.bubbles,
      cancelable: event.cancelable
    })

    return !defaultPrevented
  }

  // 添加監聽器
  addListener(target, eventName, handler) {
    target.addEventListener(eventName, handler)

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, [])
    }
    this.listeners.get(eventName).push({ target, handler })

    this.logEvent('監聽', eventName)
  }

  // 實際應用示例
  exampleUserLogin() {
    // 組件 A: 登錄按鈕
    const loginButton = document.getElementById('login-btn')
    loginButton.addEventListener('click', () => {
      // 創建自定義事件
      const loginEvent = new CustomEvent('userLogin', {
        detail: {
          username: 'Alice',
          timestamp: Date.now(),
          role: 'admin'
        },
        bubbles: true
      })

      // 分發事件
      document.dispatchEvent(loginEvent)
    })

    // 組件 B: 用戶資訊顯示
    document.addEventListener('userLogin', (e) => {
      console.log(`歡迎, ${e.detail.username}！`)
      this.updateUserInfo(e.detail)
    })

    // 組件 C: 日誌系統
    document.addEventListener('userLogin', (e) => {
      this.logUserActivity(e.detail)
    })
  }

  // 高級示例：可取消事件
  exampleFormValidation() {
    const form = document.getElementById('custom-form')

    form.addEventListener('submit', (e) => {
      e.preventDefault()

      // 創建可取消的驗證事件
      const validateEvent = new CustomEvent('formValidate', {
        detail: { formData: new FormData(form) },
        cancelable: true
      })

      // 分發驗證事件
      const isValid = form.dispatchEvent(validateEvent)

      if (isValid) {
        console.log('✅ 驗證通過，提交表單')
      } else {
        console.log('❌ 驗證失敗，已取消提交')
      }
    })

    // 驗證監聽器
    form.addEventListener('formValidate', (e) => {
      const email = e.detail.formData.get('email')
      if (!email.includes('@')) {
        e.preventDefault() // 取消事件
        alert('郵箱格式不正確！')
      }
    })
  }

  // 事件鏈示例
  exampleEventChain() {
    // 購物車流程：addToCart → updateBadge → saveToStorage

    document.addEventListener('addToCart', (e) => {
      console.log(`添加商品: ${e.detail.productName}`)

      // 觸發後續事件
      const updateEvent = new CustomEvent('cartUpdated', {
        detail: { itemCount: e.detail.itemCount + 1 }
      })
      document.dispatchEvent(updateEvent)
    })

    document.addEventListener('cartUpdated', (e) => {
      console.log(`更新徽章: ${e.detail.itemCount}`)

      // 觸發存儲事件
      const saveEvent = new CustomEvent('saveCart', {
        detail: { itemCount: e.detail.itemCount }
      })
      document.dispatchEvent(saveEvent)
    })

    document.addEventListener('saveCart', (e) => {
      localStorage.setItem('cartCount', e.detail.itemCount)
      console.log('已保存到 LocalStorage')
    })
  }
}
```

### 學習要點
1. **CustomEvent 構造函數**: 創建自定義事件
2. **detail 屬性**: 傳遞自定義數據
3. **bubbles/cancelable**: 控制事件行為
4. **dispatchEvent**: 手動觸發事件
5. **preventDefault**: 取消自定義事件
6. **組件解耦**: 不同模塊通過事件通信

### 實際應用
- 組件間通信（無需直接引用）
- 插件系統（擴展功能）
- 狀態變更通知
- 生命周期鉤子

---

## 4. 事件對象解析器

### 教學目標
全面了解 Event 對象的所有屬性和方法

### UI 設計
```
┌──────────────────────────────────────────┐
│  🔍 事件對象解析器                       │
├──────────────────────────────────────────┤
│  觸發區域:                               │
│  ┌────────────────────────────────────┐ │
│  │  點擊這裡觸發事件 👆                │ │
│  └────────────────────────────────────┘ │
│                                          │
│  事件對象屬性 (實時更新):                │
│  ┌────────────────────────────────────┐ │
│  │ 🏷️ 基礎屬性                         │ │
│  │ type: "click"                      │ │
│  │ target: <button id="trigger">      │ │
│  │ currentTarget: <div class="parent">│ │
│  │ eventPhase: 3 (冒泡)               │ │
│  │ isTrusted: true                    │ │
│  │ bubbles: true                      │ │
│  │ cancelable: true                   │ │
│  │ defaultPrevented: false            │ │
│  │ timeStamp: 123456.78               │ │
│  │                                    │ │
│  │ 🖱️ 鼠標事件專屬                     │ │
│  │ clientX: 350                       │ │
│  │ clientY: 120                       │ │
│  │ pageX: 350                         │ │
│  │ pageY: 520                         │ │
│  │ screenX: 1200                      │ │
│  │ screenY: 350                       │ │
│  │ offsetX: 25                        │ │
│  │ offsetY: 15                        │ │
│  │ button: 0 (左鍵)                   │ │
│  │ buttons: 1                         │ │
│  │ ctrlKey: false                     │ │
│  │ shiftKey: false                    │ │
│  │ altKey: false                      │ │
│  │ metaKey: false                     │ │
│  │                                    │ │
│  │ ⌨️ 鍵盤事件專屬 (按鍵時顯示)        │ │
│  │ key: "a"                           │ │
│  │ code: "KeyA"                       │ │
│  │ keyCode: 65 (已廢棄)               │ │
│  │ repeat: false                      │ │
│  └────────────────────────────────────┘ │
│                                          │
│  座標系統可視化:                         │
│  client (視口) vs page (文檔) vs screen │
└──────────────────────────────────────────┘
```

### 核心實現
```javascript
class EventInspector {
  init() {
    const trigger = document.getElementById('trigger')
    const display = document.getElementById('event-display')

    // 監聽所有常見事件
    ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove',
     'keydown', 'keyup', 'input', 'focus', 'blur'].forEach(eventType => {
      trigger.addEventListener(eventType, (e) => {
        this.inspectEvent(e)
      })
    })
  }

  inspectEvent(event) {
    const props = {
      // 基礎屬性
      type: event.type,
      target: this.elementToString(event.target),
      currentTarget: this.elementToString(event.currentTarget),
      eventPhase: ['', '捕獲', '目標', '冒泡'][event.eventPhase],
      isTrusted: event.isTrusted,
      bubbles: event.bubbles,
      cancelable: event.cancelable,
      defaultPrevented: event.defaultPrevented,
      timeStamp: event.timeStamp.toFixed(2),

      // 鼠標事件
      ...(event instanceof MouseEvent && {
        clientX: event.clientX,
        clientY: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY,
        screenX: event.screenX,
        screenY: event.screenY,
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        button: ['左鍵', '中鍵', '右鍵'][event.button],
        buttons: event.buttons,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey
      }),

      // 鍵盤事件
      ...(event instanceof KeyboardEvent && {
        key: event.key,
        code: event.code,
        keyCode: event.keyCode,
        repeat: event.repeat
      })
    }

    this.displayProperties(props)
    this.visualizeCoordinates(event)
  }

  elementToString(el) {
    if (el === window) return 'window'
    if (el === document) return 'document'
    return `<${el.tagName.toLowerCase()}${el.id ? ` id="${el.id}"` : ''}${el.className ? ` class="${el.className}"` : ''}>`
  }

  visualizeCoordinates(event) {
    if (!(event instanceof MouseEvent)) return

    // 顯示不同座標系統的差異
    const canvas = document.getElementById('coord-canvas')
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // clientX/Y - 相對於視口
    ctx.fillStyle = 'blue'
    ctx.fillRect(event.clientX - 5, event.clientY - 5, 10, 10)
    ctx.fillText('client', event.clientX + 10, event.clientY)

    // pageX/Y - 相對於文檔 (考慮滾動)
    ctx.fillStyle = 'green'
    const pageY = event.pageY - window.scrollY
    ctx.fillRect(event.pageX - 5, pageY - 5, 10, 10)
    ctx.fillText('page', event.pageX + 10, pageY)

    // offsetX/Y - 相對於目標元素
    ctx.fillStyle = 'red'
    ctx.fillRect(event.offsetX - 5, event.offsetY - 5, 10, 10)
    ctx.fillText('offset', event.offsetX + 10, event.offsetY)
  }
}
```

### 學習要點
1. **target vs currentTarget**: 實際觸發 vs 綁定元素
2. **座標系統**: client/page/screen/offset 的區別
3. **isTrusted**: 區分用戶行為和腳本觸發
4. **修飾鍵**: ctrl/shift/alt/meta 組合鍵
5. **鍵盤事件**: key vs code vs keyCode

---

## 🧪 測試與評估

每個教程完成後的小測驗：

### 事件傳播測驗
1. 事件的三個階段順序是？
2. 如何在捕獲階段監聽事件？
3. stopPropagation 和 stopImmediatePropagation 的區別？

### 事件委託測驗
1. 事件委託的性能優勢是什麼？
2. 動態添加的元素為什麼自動生效？
3. matches() 和 closest() 的使用場景？

---

**文檔狀態**: 設計完成，待實作
