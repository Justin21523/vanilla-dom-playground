# 實戰項目模板 - 設計文檔

> **目標**: 提供3個真實世界的項目模板，將所學事件知識應用到實際場景

---

## 🚀 項目總覽

| 項目名稱 | 難度 | 核心事件 | 實際應用場景 |
|---------|------|---------|-------------|
| TODO List Pro | ⭐⭐ | click, input, keydown, drag/drop | 任務管理工具 |
| 圖片輪播器 | ⭐⭐⭐ | click, mouseenter, keydown, touch | 產品展示、相冊 |
| 下拉菜單系統 | ⭐⭐⭐ | click, mouseenter/leave, focusin/out, keydown | 導航菜單、選擇器 |

---

## 1. TODO List Pro

### 項目簡介
完整功能的任務管理應用，包含添加、編輯、刪除、拖放排序、過濾、搜索等

### 核心功能
- ✅ 添加任務（Enter 提交）
- ✏️ 雙擊編輯任務
- 🗑️ 刪除任務（帶確認）
- ✔️ 標記完成/未完成
- 🔀 拖放排序
- 🔍 實時搜索
- 🏷️ 過濾（全部/活躍/已完成）
- 💾 LocalStorage 持久化

### UI 設計
```
┌──────────────────────────────────────────┐
│  📝 TODO List Pro                        │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐ │
│  │ 🔍 搜索任務...                     │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ ➕ 添加新任務... (按 Enter)        │ │
│  └────────────────────────────────────┘ │
│                                          │
│  過濾: [全部] [活躍] [已完成]           │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ ☐ 學習 DOM 事件  ⋮  🗑️             │ │
│  │ ☑ 完成專案設計    ⋮  🗑️             │ │
│  │ ☐ 實作打地鼠遊戲  ⋮  🗑️             │ │
│  └────────────────────────────────────┘ │
│                                          │
│  剩餘 2 個任務  [清空已完成]            │
└──────────────────────────────────────────┘
```

### 核心實現
```javascript
class TODOListPro {
  constructor() {
    this.todos = this.loadFromStorage() || []
    this.filter = 'all' // 'all' | 'active' | 'completed'
  }

  init() {
    const input = document.getElementById('todo-input')
    const searchInput = document.getElementById('search-input')
    const todoList = document.getElementById('todo-list')

    // 1. 添加任務 (Enter 鍵提交)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        e.preventDefault()
        this.addTodo(e.target.value.trim())
        e.target.value = ''
        e.target.focus()
      }
    })

    // 2. 實時搜索
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase()
      this.filterTodos(query)
    })

    // 3. 事件委託處理所有任務操作
    todoList.addEventListener('click', (e) => {
      const todoItem = e.target.closest('.todo-item')
      if (!todoItem) return

      const todoId = todoItem.dataset.id

      // 勾選完成
      if (e.target.matches('.todo-checkbox')) {
        this.toggleComplete(todoId)
      }

      // 刪除任務
      if (e.target.matches('.todo-delete')) {
        if (confirm('確定刪除此任務？')) {
          this.deleteTodo(todoId)
        }
      }
    })

    // 4. 雙擊編輯
    todoList.addEventListener('dblclick', (e) => {
      const todoItem = e.target.closest('.todo-item')
      if (!todoItem) return

      const label = todoItem.querySelector('.todo-label')
      const currentText = label.textContent

      // 轉換為可編輯狀態
      const input = document.createElement('input')
      input.type = 'text'
      input.value = currentText
      input.className = 'todo-edit-input'

      label.replaceWith(input)
      input.focus()
      input.select()

      // 失焦或 Enter 保存
      const save = () => {
        if (input.value.trim()) {
          this.updateTodo(todoItem.dataset.id, input.value.trim())
        } else {
          this.render() // 取消編輯
        }
      }

      input.addEventListener('blur', save)
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') save()
        if (e.key === 'Escape') this.render()
      })
    })

    // 5. 拖放排序
    this.initDragAndDrop(todoList)

    // 6. 過濾器
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filter = e.target.dataset.filter
        this.render()
      })
    })

    // 7. 清空已完成
    document.getElementById('clear-completed').addEventListener('click', () => {
      this.todos = this.todos.filter(todo => !todo.completed)
      this.saveToStorage()
      this.render()
    })

    this.render()
  }

  // 拖放排序實現
  initDragAndDrop(todoList) {
    let draggedItem = null

    todoList.addEventListener('dragstart', (e) => {
      const item = e.target.closest('.todo-item')
      if (!item) return

      draggedItem = item
      item.classList.add('dragging')
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/html', item.innerHTML)
    })

    todoList.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'

      const afterElement = this.getDragAfterElement(todoList, e.clientY)
      const currentDragging = document.querySelector('.dragging')

      if (afterElement == null) {
        todoList.appendChild(currentDragging)
      } else {
        todoList.insertBefore(currentDragging, afterElement)
      }
    })

    todoList.addEventListener('dragend', (e) => {
      const item = e.target.closest('.todo-item')
      if (!item) return

      item.classList.remove('dragging')
      this.updateOrder()
    })
  }

  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')]

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect()
      const offset = y - box.top - box.height / 2

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child }
      } else {
        return closest
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element
  }

  // CRUD 操作
  addTodo(text) {
    const todo = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    }
    this.todos.push(todo)
    this.saveToStorage()
    this.render()
    this.showToast('✅ 任務已添加')
  }

  updateTodo(id, newText) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      todo.text = newText
      this.saveToStorage()
      this.render()
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id)
    this.saveToStorage()
    this.render()
    this.showToast('🗑️ 任務已刪除')
  }

  toggleComplete(id) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      this.saveToStorage()
      this.render()
    }
  }

  // 持久化
  saveToStorage() {
    localStorage.setItem('todos', JSON.stringify(this.todos))
  }

  loadFromStorage() {
    const data = localStorage.getItem('todos')
    return data ? JSON.parse(data) : []
  }
}
```

### 學習要點
1. **Enter 鍵提交** - keydown 事件判斷 key
2. **實時搜索** - input 事件過濾列表
3. **事件委託** - 統一處理所有任務項
4. **雙擊編輯** - dblclick + blur + Enter 組合
5. **拖放排序** - 完整拖放 API 應用
6. **LocalStorage** - 數據持久化

---

## 2. 圖片輪播器 (Carousel)

### 項目簡介
響應式圖片輪播組件，支持自動播放、手動切換、鍵盤導航、觸摸滑動

### 核心功能
- 🖼️ 圖片輪播
- ◀️ ▶️ 上一張/下一張按鈕
- 🔘 指示器點（點擊跳轉）
- ⏯️ 自動播放/暫停
- ⌨️ 鍵盤導航（左右鍵）
- 📱 觸摸滑動（移動端）
- 🖱️ 鼠標懸停暫停
- 🔄 無限循環

### UI 設計
```
┌─────────────────────────────────────────┐
│         🖼️ 圖片輪播器                   │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │                                   │ │
│  │  ◀                               ▶ │ │
│  │       [  圖片 1/5  ]              │ │
│  │                                   │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│           ⚪ ⚫ ⚪ ⚪ ⚪                   │
│                                         │
│  [⏸️ 暫停] [⏩ 自動播放] 間隔: 3 秒     │
└─────────────────────────────────────────┘
```

### 核心實現
```javascript
class Carousel {
  constructor(container, options = {}) {
    this.container = container
    this.slides = container.querySelectorAll('.slide')
    this.currentIndex = 0
    this.isPlaying = options.autoplay ?? true
    this.interval = options.interval ?? 3000
    this.timer = null
    this.startX = 0
    this.isDragging = false
  }

  init() {
    // 1. 上一張/下一張按鈕
    this.container.querySelector('.prev-btn').addEventListener('click', () => {
      this.prev()
      this.resetAutoplay()
    })

    this.container.querySelector('.next-btn').addEventListener('click', () => {
      this.next()
      this.resetAutoplay()
    })

    // 2. 指示器點擊
    this.container.querySelectorAll('.dot').forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goTo(index)
        this.resetAutoplay()
      })
    })

    // 3. 鍵盤導航
    document.addEventListener('keydown', (e) => {
      if (!this.container.matches(':hover')) return // 只在懸停時響應

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          this.prev()
          this.resetAutoplay()
          break
        case 'ArrowRight':
          e.preventDefault()
          this.next()
          this.resetAutoplay()
          break
        case ' ':
          e.preventDefault()
          this.togglePlayPause()
          break
      }
    })

    // 4. 鼠標懸停暫停
    this.container.addEventListener('mouseenter', () => {
      this.pause()
    })

    this.container.addEventListener('mouseleave', () => {
      if (this.isPlaying) {
        this.play()
      }
    })

    // 5. 觸摸滑動 (移動端)
    this.initTouchEvents()

    // 6. 動畫結束事件（用於連續切換）
    this.slides.forEach(slide => {
      slide.addEventListener('transitionend', () => {
        // 動畫完成後的清理工作
      })
    })

    // 啟動自動播放
    if (this.isPlaying) {
      this.play()
    }

    this.render()
  }

  // 觸摸事件處理
  initTouchEvents() {
    const track = this.container.querySelector('.slides-track')

    track.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX
      this.isDragging = true
      this.pause()
    })

    track.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return

      const currentX = e.touches[0].clientX
      const diff = currentX - this.startX

      // 實時跟隨手指
      track.style.transform = `translateX(calc(-${this.currentIndex * 100}% + ${diff}px))`
    })

    track.addEventListener('touchend', (e) => {
      if (!this.isDragging) return

      const endX = e.changedTouches[0].clientX
      const diff = endX - this.startX

      // 滑動距離超過 50px 才切換
      if (diff > 50) {
        this.prev()
      } else if (diff < -50) {
        this.next()
      } else {
        this.render() // 回彈
      }

      this.isDragging = false
      if (this.isPlaying) {
        this.play()
      }
    })
  }

  // 導航方法
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length
    this.render()
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length
    this.render()
  }

  goTo(index) {
    this.currentIndex = index
    this.render()
  }

  // 自動播放控制
  play() {
    this.timer = setInterval(() => this.next(), this.interval)
  }

  pause() {
    clearInterval(this.timer)
    this.timer = null
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying
    if (this.isPlaying) {
      this.play()
    } else {
      this.pause()
    }
  }

  resetAutoplay() {
    if (this.isPlaying) {
      this.pause()
      this.play()
    }
  }

  // 渲染
  render() {
    const track = this.container.querySelector('.slides-track')
    track.style.transform = `translateX(-${this.currentIndex * 100}%)`

    // 更新指示器
    this.container.querySelectorAll('.dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex)
    })

    // 更新圖片計數
    this.container.querySelector('.counter').textContent =
      `${this.currentIndex + 1} / ${this.slides.length}`
  }
}
```

### 學習要點
1. **click 事件** - 按鈕導航
2. **keydown 事件** - 鍵盤控制
3. **mouseenter/leave** - 懸停暫停
4. **touch 事件** - 移動端滑動
5. **transitionend** - 動畫完成回調
6. **定時器管理** - setInterval 清理

---

## 3. 下拉菜單系統 (Dropdown Menu)

### 項目簡介
無障礙的多級下拉菜單，支持鍵盤導航、焦點管理、懸停延遲

### 核心功能
- 📂 多級菜單（支持 3 層）
- 🖱️ 鼠標懸停展開
- ⌨️ 鍵盤導航（上下鍵、Enter、Esc）
- ♿ 無障礙支持（ARIA 屬性）
- ⏱️ 懸停延遲（防止誤觸）
- 📱 移動端點擊展開

### UI 設計
```
┌──────────────────────────────────────┐
│  首頁  產品 ▼  服務 ▼  關於  聯繫    │
│        ┌────────────┐                │
│        │ 產品 A     │                │
│        │ 產品 B   ▶ ├───────────┐    │
│        │ 產品 C     │  B-1      │    │
│        └────────────┘  B-2      │    │
│                        B-3      │    │
│                        └─────────┘   │
└──────────────────────────────────────┘
```

### 核心實現
```javascript
class DropdownMenu {
  constructor(menu) {
    this.menu = menu
    this.items = menu.querySelectorAll('.menu-item')
    this.currentFocus = -1
    this.hoverTimer = null
    this.hoverDelay = 200 // ms
  }

  init() {
    this.items.forEach((item, index) => {
      const trigger = item.querySelector('.menu-trigger')
      const submenu = item.querySelector('.submenu')

      if (!submenu) return

      // 1. 鼠標懸停展開（帶延遲）
      item.addEventListener('mouseenter', () => {
        this.hoverTimer = setTimeout(() => {
          this.openSubmenu(item)
        }, this.hoverDelay)
      })

      item.addEventListener('mouseleave', () => {
        clearTimeout(this.hoverTimer)
        this.closeSubmenu(item)
      })

      // 2. 點擊切換（移動端）
      trigger.addEventListener('click', (e) => {
        e.preventDefault()
        const isOpen = item.classList.contains('open')

        // 關閉其他菜單
        this.closeAllSubmenus()

        if (!isOpen) {
          this.openSubmenu(item)
        }
      })

      // 3. 焦點管理
      trigger.addEventListener('focus', () => {
        this.currentFocus = index
      })

      trigger.addEventListener('blur', (e) => {
        // 如果焦點沒有移到子菜單，關閉
        if (!item.contains(e.relatedTarget)) {
          setTimeout(() => this.closeSubmenu(item), 100)
        }
      })
    })

    // 4. 鍵盤導航
    this.menu.addEventListener('keydown', (e) => {
      this.handleKeyboardNav(e)
    })

    // 5. 點擊外部關閉
    document.addEventListener('click', (e) => {
      if (!this.menu.contains(e.target)) {
        this.closeAllSubmenus()
      }
    })

    // 6. Esc 關閉
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllSubmenus()
        this.menu.querySelector('.menu-trigger').focus()
      }
    })
  }

  // 鍵盤導航
  handleKeyboardNav(e) {
    const triggers = Array.from(this.menu.querySelectorAll('.menu-trigger'))

    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault()
        this.currentFocus = (this.currentFocus + 1) % triggers.length
        triggers[this.currentFocus].focus()
        break

      case 'ArrowUp':
        e.preventDefault()
        this.currentFocus = (this.currentFocus - 1 + triggers.length) % triggers.length
        triggers[this.currentFocus].focus()
        break

      case 'ArrowRight':
        e.preventDefault()
        const currentItem = triggers[this.currentFocus]?.closest('.menu-item')
        const submenu = currentItem?.querySelector('.submenu')
        if (submenu) {
          this.openSubmenu(currentItem)
          submenu.querySelector('.menu-trigger')?.focus()
        }
        break

      case 'ArrowLeft':
        e.preventDefault()
        const parentItem = e.target.closest('.submenu')?.closest('.menu-item')
        if (parentItem) {
          this.closeSubmenu(parentItem)
          parentItem.querySelector('.menu-trigger').focus()
        }
        break

      case 'Enter':
      case ' ':
        e.preventDefault()
        e.target.click()
        break

      case 'Home':
        e.preventDefault()
        triggers[0].focus()
        this.currentFocus = 0
        break

      case 'End':
        e.preventDefault()
        triggers[triggers.length - 1].focus()
        this.currentFocus = triggers.length - 1
        break
    }
  }

  // 菜單操作
  openSubmenu(item) {
    item.classList.add('open')
    const submenu = item.querySelector('.submenu')
    submenu.setAttribute('aria-hidden', 'false')

    // 定位子菜單（防止超出視口）
    this.positionSubmenu(submenu)
  }

  closeSubmenu(item) {
    item.classList.remove('open')
    const submenu = item.querySelector('.submenu')
    submenu.setAttribute('aria-hidden', 'true')
  }

  closeAllSubmenus() {
    this.items.forEach(item => this.closeSubmenu(item))
  }

  positionSubmenu(submenu) {
    const rect = submenu.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // 右側超出，改為左側顯示
    if (rect.right > viewportWidth) {
      submenu.style.left = 'auto'
      submenu.style.right = '100%'
    }

    // 底部超出，向上展開
    if (rect.bottom > viewportHeight) {
      submenu.style.top = 'auto'
      submenu.style.bottom = '0'
    }
  }
}
```

### 學習要點
1. **mouseenter/leave** - 懸停展開
2. **click 事件** - 移動端切換
3. **focus/blur** - 焦點管理
4. **keydown** - 完整鍵盤導航（方向鍵、Enter、Esc）
5. **ARIA 屬性** - 無障礙支持
6. **定時器延遲** - 防止誤觸

---

## 🧪 測試清單

### TODO List
- [ ] 添加任務
- [ ] 編輯任務
- [ ] 刪除任務
- [ ] 標記完成
- [ ] 拖放排序
- [ ] 過濾顯示
- [ ] 搜索功能
- [ ] 數據持久化

### 輪播器
- [ ] 自動播放
- [ ] 手動切換
- [ ] 鍵盤導航
- [ ] 觸摸滑動
- [ ] 懸停暫停
- [ ] 無限循環

### 下拉菜單
- [ ] 鼠標懸停
- [ ] 鍵盤導航
- [ ] 焦點管理
- [ ] 多級菜單
- [ ] 移動端適配
- [ ] 無障礙檢查

---

**文檔狀態**: 設計完成，待實作
