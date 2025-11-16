# 遊戲化學習模塊 - 完整設計文檔

> **目標**: 通過5個精心設計的小遊戲，讓用戶在趣味中掌握 DOM 事件處理

---

## 🎮 遊戲總覽

| 遊戲名稱 | 難度 | 核心事件 | 學習重點 | 預計時長 |
|---------|------|---------|---------|---------|
| 打地鼠 | ⭐ 簡單 | click, transitionend | 基礎點擊、防作弊 | 5分鐘 |
| 拖放拼圖 | ⭐⭐ 中等 | 拖放API (7個) | 完整拖放流程 | 10分鐘 |
| 貪吃蛇 | ⭐⭐ 中等 | keydown, keyup | 鍵盤控制、遊戲循環 | 15分鐘 |
| 表單驗證大師 | ⭐⭐⭐ 困難 | input, blur, submit | 實時驗證、正則表達式 | 10分鐘 |
| 音樂按鍵 | ⭐⭐ 中等 | keydown, keyup, Audio API | 音頻播放、視覺反饋 | 8分鐘 |

---

## 1. 打地鼠 (Whack-a-Mole)

### 設計目標
學習最基本的 `click` 事件，理解 `event.isTrusted` 防作弊機制

### 遊戲機制
- 3×3 網格，地鼠隨機從洞中彈出
- 停留時間：簡單 1.5秒 / 中等 1秒 / 困難 0.7秒
- 倒計時 30 秒
- 點擊地鼠 +10 分，錯過 -5 分
- 連擊獎勵：3連擊 +20，5連擊 +50

### UI 佈局
```
┌─────────────────────────────────┐
│  🎯 打地鼠  得分: 0  時間: 30s   │
├─────────────────────────────────┤
│  ┌───┐ ┌───┐ ┌───┐              │
│  │ 🕳️ │ │🦫│ │ 🕳️ │              │
│  └───┘ └───┘ └───┘              │
│  ┌───┐ ┌───┐ ┌───┐              │
│  │ 🕳️ │ │ 🕳️ │ │🦫│              │
│  └───┘ └───┘ └───┘              │
│  ┌───┐ ┌───┐ ┌───┐              │
│  │🦫│ │ 🕳️ │ │ 🕳️ │              │
│  └───┘ └───┘ └───┘              │
├─────────────────────────────────┤
│  [開始遊戲] [重置] [查看代碼]    │
└─────────────────────────────────┘
```

### 核心代碼邏輯
```javascript
class WhackAMole {
  constructor() {
    this.score = 0
    this.timeLeft = 30
    this.combo = 0
    this.holes = [] // 9個洞的 DOM 元素
    this.gameInterval = null
  }

  init() {
    // 創建 3x3 網格
    // 綁定事件
    this.holes.forEach(hole => {
      hole.addEventListener('click', (e) => this.whack(e))
    })
  }

  whack(event) {
    // 防作弊檢測
    if (!event.isTrusted) {
      console.warn('檢測到作弊行為！')
      return
    }

    const hole = event.currentTarget
    if (!hole.classList.contains('active')) return

    // 得分邏輯
    this.score += 10
    this.combo++

    // 連擊獎勵
    if (this.combo >= 5) this.score += 50
    else if (this.combo >= 3) this.score += 20

    // 視覺反饋
    hole.classList.add('hit')
    this.showParticles(hole) // 粒子爆炸效果

    // 動畫結束後移除
    hole.addEventListener('transitionend', () => {
      hole.classList.remove('active', 'hit')
    }, { once: true })
  }

  popRandom() {
    const randomHole = this.holes[Math.floor(Math.random() * 9)]
    randomHole.classList.add('active')

    // 自動縮回
    setTimeout(() => {
      if (randomHole.classList.contains('active')) {
        randomHole.classList.remove('active')
        this.combo = 0 // 重置連擊
      }
    }, this.difficulty.duration)
  }

  start() {
    this.gameInterval = setInterval(() => this.popRandom(), 800)
    this.startTimer()
  }
}
```

### 學習要點
1. **event.isTrusted** - 區分用戶行為和腳本觸發
2. **transitionend 事件** - CSS 過渡完成回調
3. **classList API** - 添加/移除 class 控制狀態
4. **定時器管理** - setInterval/setTimeout 的清理

### CSS 動畫
```css
.hole {
  position: relative;
  width: 100px;
  height: 100px;
  background: #8B4513;
  border-radius: 50%;
  overflow: hidden;
}

.mole {
  position: absolute;
  bottom: -100%;
  width: 100%;
  height: 100%;
  background: url('mole.png');
  transition: bottom 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.hole.active .mole {
  bottom: 0;
}

.hole.hit .mole {
  animation: shake 0.2s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

### 粒子效果
點擊時從地鼠位置發射星星粒子

### 成就系統
- 🏆 **新手獵人** - 首次得分
- 🔥 **連擊大師** - 達成 5 連擊
- ⚡ **速度之王** - 30 秒內打中 20 只
- 🎯 **完美主義者** - 零失誤完成

---

## 2. 拖放拼圖 (Drag Puzzle)

### 設計目標
完整學習拖放 API (dragstart, dragover, drop 等 7 個事件)

### 遊戲機制
- 4×4 或 6×6 拼圖網格
- 初始狀態打亂
- 拖動拼圖塊到正確位置
- 完成時煙花慶祝效果

### UI 佈局
```
┌────────────────────────────────────┐
│  🧩 拼圖遊戲  進度: 0/16  時間: 0s │
├────────────────────────────────────┤
│  ┌────────────┐  ┌──────────────┐ │
│  │ 拼圖預覽   │  │  ┌──┬──┬──┬──┐ │ │
│  │  🖼️       │  │  │3 │1 │  │2 │ │ │
│  │           │  │  ├──┼──┼──┼──┤ │ │
│  └────────────┘  │  │  │4 │5 │  │ │ │
│                  │  ├──┼──┼──┼──┤ │ │
│  難度: ⭐⭐      │  │  │  │  │  │ │ │
│  [4x4] [6x6]    │  ├──┼──┼──┼──┤ │ │
│                  │  │  │  │  │  │ │ │
│  [打亂] [提示]  │  └──┴──┴──┴──┘ │ │
│                  └──────────────┘ │
└────────────────────────────────────┘
```

### 核心代碼邏輯
```javascript
class DragPuzzle {
  constructor(size = 4) {
    this.size = size
    this.pieces = []
    this.correctPositions = new Map()
  }

  init() {
    // 創建拼圖塊
    this.pieces.forEach((piece, index) => {
      piece.draggable = true
      piece.dataset.correctIndex = index

      // 拖動開始
      piece.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', index)
        piece.classList.add('dragging')

        // 可選：設置拖動圖像
        e.dataTransfer.setDragImage(piece, 50, 50)
      })

      // 拖動結束
      piece.addEventListener('dragend', (e) => {
        piece.classList.remove('dragging')
      })
    })

    // 設置放置目標
    this.slots.forEach((slot, index) => {
      // 拖入目標
      slot.addEventListener('dragenter', (e) => {
        e.preventDefault()
        slot.classList.add('drag-over')
      })

      // 在目標上方
      slot.addEventListener('dragover', (e) => {
        e.preventDefault() // 關鍵！必須阻止默認
        e.dataTransfer.dropEffect = 'move'
      })

      // 離開目標
      slot.addEventListener('dragleave', (e) => {
        slot.classList.remove('drag-over')
      })

      // 放下
      slot.addEventListener('drop', (e) => {
        e.preventDefault()
        const pieceIndex = e.dataTransfer.getData('text/plain')
        const piece = this.pieces[pieceIndex]

        // 檢查是否正確
        if (parseInt(pieceIndex) === index) {
          slot.appendChild(piece)
          slot.classList.add('correct')
          this.checkCompletion()
          this.showSuccess(slot) // 正確時的綠色閃光
        } else {
          this.showError(slot) // 錯誤時的紅色震動
        }

        slot.classList.remove('drag-over')
      })
    })
  }

  checkCompletion() {
    const allCorrect = this.slots.every(slot =>
      slot.classList.contains('correct')
    )

    if (allCorrect) {
      this.celebrate() // 煙花效果
      this.unlockAchievement('puzzle_master')
    }
  }
}
```

### 學習要點
1. **dataTransfer API** - 拖放數據傳遞
2. **preventDefault 時機** - dragover 必須阻止默認行為
3. **視覺反饋** - dragenter/dragleave 切換樣式
4. **效果控制** - effectAllowed 和 dropEffect
5. **自定義拖動圖像** - setDragImage

### 進階功能
- 支持觸摸設備（touch 事件模擬拖放）
- 自定義圖片上傳
- 提示系統（高亮下一個正確塊）

### 成就系統
- 🧩 **拼圖新手** - 完成首個拼圖
- ⏱️ **速度狂魔** - 1 分鐘內完成 4×4
- 🎨 **藝術家** - 完成 6×6 拼圖
- 🏅 **拖放大師** - 累計完成 10 個拼圖

---

## 3. 貪吃蛇 (Snake Game)

### 設計目標
學習 keydown/keyup 事件，掌握遊戲循環和碰撞檢測

### 遊戲機制
- 方向鍵控制蛇移動
- 吃到食物增長，撞牆/自身 Game Over
- 速度逐漸加快
- 無盡模式 + 障礙物模式

### UI 佈局
```
┌───────────────────────────────────┐
│  🐍 貪吃蛇  得分: 0  長度: 3      │
├───────────────────────────────────┤
│  ┌─────────────────────────────┐ │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│  │ ░                        ░ │ │
│  │ ░    🍎                  ░ │ │
│  │ ░       🟩🟩🟩           ░ │ │
│  │ ░                        ░ │ │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│  └─────────────────────────────┘ │
│                                   │
│  控制: ⬆️ ⬇️ ⬅️ ➡️  空格: 暫停    │
│  [開始] [重置] [查看代碼]         │
└───────────────────────────────────┘
```

### 核心代碼邏輯
```javascript
class SnakeGame {
  constructor() {
    this.snake = [{x: 10, y: 10}]
    this.direction = 'right'
    this.nextDirection = 'right'
    this.food = this.randomFood()
    this.gameLoop = null
    this.speed = 150 // ms
  }

  init() {
    // 鍵盤控制
    document.addEventListener('keydown', (e) => {
      const key = e.key

      // 防止方向鍵滾動頁面
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
        e.preventDefault()
      }

      switch(key) {
        case 'ArrowUp':
          if (this.direction !== 'down') this.nextDirection = 'up'
          break
        case 'ArrowDown':
          if (this.direction !== 'up') this.nextDirection = 'down'
          break
        case 'ArrowLeft':
          if (this.direction !== 'right') this.nextDirection = 'left'
          break
        case 'ArrowRight':
          if (this.direction !== 'left') this.nextDirection = 'right'
          break
        case ' ':
          this.togglePause()
          break
      }
    })

    // 也支持 WASD
    document.addEventListener('keydown', (e) => {
      const keyMap = {
        'w': 'ArrowUp',
        's': 'ArrowDown',
        'a': 'ArrowLeft',
        'd': 'ArrowRight'
      }
      if (keyMap[e.key.toLowerCase()]) {
        // 模擬方向鍵事件
        const arrowEvent = new KeyboardEvent('keydown', { key: keyMap[e.key.toLowerCase()] })
        document.dispatchEvent(arrowEvent)
      }
    })
  }

  start() {
    this.gameLoop = setInterval(() => this.update(), this.speed)
  }

  update() {
    this.direction = this.nextDirection

    // 計算新頭部位置
    const head = { ...this.snake[0] }
    switch(this.direction) {
      case 'up': head.y--; break
      case 'down': head.y++; break
      case 'left': head.x--; break
      case 'right': head.x++; break
    }

    // 碰撞檢測
    if (this.checkCollision(head)) {
      this.gameOver()
      return
    }

    // 添加新頭部
    this.snake.unshift(head)

    // 吃到食物？
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10
      this.food = this.randomFood()
      this.playSound('eat')
      // 不移除尾部，蛇變長
    } else {
      this.snake.pop() // 移除尾部
    }

    this.render()
  }

  checkCollision(head) {
    // 撞牆
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
      return true
    }
    // 撞自己
    return this.snake.some(segment =>
      segment.x === head.x && segment.y === head.y
    )
  }
}
```

### 學習要點
1. **e.preventDefault()** - 阻止方向鍵默認滾動
2. **e.key vs e.keyCode** - 現代方法 vs 舊方法
3. **方向限制** - 不能 180 度轉向
4. **遊戲循環** - setInterval 的清理
5. **自定義事件** - WASD 轉換為方向鍵事件

### 進階功能
- 穿牆模式（從右邊出來左邊進入）
- 障礙物模式
- 多人對戰（雙鍵盤）

### 成就系統
- 🐍 **初出茅廬** - 達到長度 10
- 🏆 **蛇王** - 達到長度 30
- 🎯 **精準操控** - 零失誤完成
- 🚀 **極速挑戰** - 速度 50ms 下生存

---

## 4. 表單驗證大師 (Form Master)

### 設計目標
深入學習 input, change, focus, blur, submit 事件，掌握實時驗證

### 遊戲機制
- 多個表單字段（郵箱、密碼、電話、信用卡等）
- 實時驗證 + 視覺反饋
- 密碼強度檢測器
- 提交攔截

### UI 佈局
```
┌─────────────────────────────────────┐
│  📝 表單驗證大師  進度: 0/5 ✓       │
├─────────────────────────────────────┤
│  ✉️ Email                           │
│  [_____________________________] ❌ │
│  ⚠️ 請輸入有效的郵箱地址             │
│                                      │
│  🔒 密碼  強度: ████░░░░ 中等        │
│  [_____________________________] ✓  │
│  ✓ 至少 8 字符 ✓ 包含數字 ✗ 特殊符號│
│                                      │
│  📞 電話                             │
│  [_____________________________] ⏳ │
│  ℹ️ 格式: +886-912-345-678          │
│                                      │
│  💳 信用卡                           │
│  [____-____-____-____] 🏦 VISA      │
│                                      │
│  [提交表單] (已驗證 2/5)             │
└─────────────────────────────────────┘
```

### 核心代碼邏輯
```javascript
class FormMaster {
  constructor() {
    this.validators = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[0-9]{1,3}[\s-]?[(]?[0-9]{1,4}[)]?[\s-]?[0-9]{1,4}[\s-]?[0-9]{1,9}$/,
      creditCard: /^[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}$/
    }
  }

  init() {
    const emailInput = document.getElementById('email')

    // 實時驗證
    emailInput.addEventListener('input', (e) => {
      const value = e.target.value
      const isValid = this.validators.email.test(value)

      // 實時反饋
      e.target.classList.toggle('valid', isValid && value.length > 0)
      e.target.classList.toggle('invalid', !isValid && value.length > 0)

      this.updateIcon(e.target, isValid && value.length > 0)
    })

    // 失焦驗證（更嚴格）
    emailInput.addEventListener('blur', (e) => {
      const value = e.target.value
      if (value.length === 0) {
        this.showError(e.target, '此欄位為必填')
      } else if (!this.validators.email.test(value)) {
        this.showError(e.target, '郵箱格式不正確')
        e.target.classList.add('shake') // 震動動畫
      }
    })

    // 獲得焦點時清除錯誤
    emailInput.addEventListener('focus', (e) => {
      this.clearError(e.target)
      e.target.classList.remove('shake')
    })

    // 密碼強度實時檢測
    const passwordInput = document.getElementById('password')
    passwordInput.addEventListener('input', (e) => {
      const strength = this.checkPasswordStrength(e.target.value)
      this.updateStrengthMeter(strength)
    })

    // 表單提交攔截
    const form = document.getElementById('master-form')
    form.addEventListener('submit', (e) => {
      e.preventDefault() // 阻止默認提交

      if (this.validateAll()) {
        this.showSuccess('✅ 表單驗證成功！')
        this.celebrate()
      } else {
        this.showError(form, '請修正錯誤後再提交')
      }
    })

    // HTML5 原生驗證失敗
    form.addEventListener('invalid', (e) => {
      e.preventDefault() // 阻止瀏覽器默認提示
      this.showCustomValidation(e.target)
    }, true) // 使用捕獲階段
  }

  checkPasswordStrength(password) {
    let strength = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    }

    strength = Object.values(checks).filter(Boolean).length

    return {
      score: strength,
      checks: checks,
      label: ['極弱', '弱', '中等', '強', '極強'][strength - 1] || '無'
    }
  }

  // 信用卡自動格式化
  formatCreditCard(input) {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\s/g, '')
      let formatted = value.match(/.{1,4}/g)?.join('-') || value
      e.target.value = formatted

      // 識別卡片類型
      const type = this.detectCardType(value)
      this.showCardIcon(type) // 顯示 VISA/MasterCard/等圖標
    })
  }

  detectCardType(number) {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/
    }

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(number)) return type
    }
    return 'unknown'
  }
}
```

### 學習要點
1. **input vs change** - 實時 vs 失焦觸發
2. **focus/blur** - 焦點管理
3. **submit 事件攔截** - preventDefault 阻止提交
4. **invalid 事件** - HTML5 驗證失敗回調
5. **正則表達式** - 格式驗證
6. **事件捕獲** - invalid 需要在捕獲階段監聽

### 視覺反饋
- ✓ 綠色勾號（驗證通過）
- ✗ 紅色叉號（驗證失敗）
- ⏳ 黃色感嘆號（待驗證）
- 震動動畫（錯誤）
- 綠色波紋（成功）

### 成就系統
- 📝 **表單新手** - 完成首個驗證
- 🔐 **安全專家** - 創建極強密碼
- ⚡ **快槍手** - 10 秒內完成所有驗證
- 🎯 **完美主義者** - 零錯誤提交

---

## 5. 音樂按鍵 (Music Keys)

### 設計目標
學習 keydown/keyup 配合 Audio API，理解事件時序

### 遊戲機制
- 鍵盤 A-Z 對應不同音符
- 自由演奏模式
- 節奏挑戰模式（音符下落，按對應鍵）

### UI 佈局
```
┌──────────────────────────────────────┐
│  🎹 音樂按鍵  模式: 自由演奏          │
├──────────────────────────────────────┤
│              音符下落區              │
│  ─────────────────────────────────── │
│       ↓    ↓         ↓               │
│      [C]  [E]       [G]              │
│  ─────────────────────────────────── │
│                                       │
│  ┌──┬──┬──┬──┬──┬──┬──┬──┐          │
│  │A │S │D │F │G │H │J │K │          │
│  │C │D │E │F │G │A │B │C2│          │
│  └──┴──┴──┴──┴──┴──┴──┴──┘          │
│                                       │
│  得分: 0  連擊: 0x  準確率: 0%       │
│  [自由模式] [挑戰模式] [查看代碼]    │
└──────────────────────────────────────┘
```

### 核心代碼邏輯
```javascript
class MusicKeys {
  constructor() {
    this.sounds = {}
    this.keys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k']
    this.notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C2']
    this.activeKeys = new Set()
  }

  init() {
    // 預加載音頻
    this.keys.forEach((key, i) => {
      this.sounds[key] = new Audio(`sounds/${this.notes[i]}.mp3`)
      this.sounds[key].preload = 'auto'
    })

    // 按下播放
    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase()

      // 防止長按重複觸發
      if (e.repeat) return

      if (this.keys.includes(key)) {
        e.preventDefault() // 防止觸發其他快捷鍵
        this.playNote(key)
      }
    })

    // 釋放停止視覺效果
    document.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase()
      if (this.keys.includes(key)) {
        this.stopVisual(key)
      }
    })
  }

  playNote(key) {
    const audio = this.sounds[key]
    const keyElement = document.querySelector(`[data-key="${key}"]`)

    // 重新開始播放（允許快速連按）
    audio.currentTime = 0
    audio.play()

    // 視覺反饋
    keyElement.classList.add('active')
    this.createRipple(keyElement) // 波紋效果

    // 記錄活躍鍵
    this.activeKeys.add(key)

    // 粒子效果
    this.emitParticles(keyElement, this.getColorForNote(key))
  }

  stopVisual(key) {
    const keyElement = document.querySelector(`[data-key="${key}"]`)
    keyElement.classList.remove('active')
    this.activeKeys.delete(key)
  }

  // 挑戰模式：音符下落
  challengeMode() {
    setInterval(() => {
      const randomKey = this.keys[Math.floor(Math.random() * this.keys.length)]
      this.spawnFallingNote(randomKey)
    }, 1000)

    // 按鍵檢測
    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase()
      const hit = this.checkHit(key)

      if (hit) {
        this.score += 10
        this.combo++
        this.showPerfect() // "PERFECT!" 文字飄過
      } else {
        this.combo = 0
        this.showMiss()
      }
    })
  }

  checkHit(key) {
    // 檢查是否有音符在判定區域
    const notes = document.querySelectorAll('.falling-note')
    for (const note of notes) {
      const rect = note.getBoundingClientRect()
      const hitZone = document.getElementById('hit-zone').getBoundingClientRect()

      if (note.dataset.key === key &&
          rect.bottom >= hitZone.top &&
          rect.top <= hitZone.bottom) {
        note.remove()
        return true
      }
    }
    return false
  }
}
```

### 學習要點
1. **e.repeat** - 檢測長按重複觸發
2. **keydown/keyup 配對** - 實現按下/釋放效果
3. **Audio API** - 播放控制、預加載
4. **currentTime 重置** - 允許快速連按
5. **getBoundingClientRect** - 碰撞檢測

### 視覺效果
- 按鍵發光脈沖
- 音符粒子（不同顏色）
- 波紋擴散
- 連擊閃電特效

### 成就系統
- 🎵 **音樂家** - 演奏首個音符
- 🎹 **鋼琴師** - 連擊 10 次
- 🎯 **完美演奏** - 準確率 100%
- 🏆 **節奏大師** - 挑戰模式得分 500+

---

## 🎨 通用 UI 組件

### 遊戲容器
所有遊戲共用統一容器結構：

```html
<div class="game-container" data-game="whack-a-mole">
  <div class="game-header">
    <h2 class="game-title">🎯 打地鼠</h2>
    <div class="game-stats">
      <span class="stat">得分: <strong id="score">0</strong></span>
      <span class="stat">時間: <strong id="time">30</strong>s</span>
    </div>
  </div>

  <div class="game-canvas">
    <!-- 遊戲主體區域 -->
  </div>

  <div class="game-controls">
    <button class="btn-primary" id="start">開始遊戲</button>
    <button class="btn-secondary" id="reset">重置</button>
    <button class="btn-code" id="showCode">查看代碼</button>
  </div>

  <div class="game-tips">
    <h3>💡 學習要點</h3>
    <ul>
      <li><code>click</code> 事件基礎</li>
      <li><code>event.isTrusted</code> 防作弊</li>
    </ul>
  </div>
</div>
```

### 代碼預覽彈窗
點擊「查看代碼」顯示該遊戲的完整實現

```html
<div class="code-modal">
  <div class="modal-header">
    <h3>🎯 打地鼠 - 完整代碼</h3>
    <button class="close">✕</button>
  </div>
  <div class="code-tabs">
    <button class="active">HTML</button>
    <button>CSS</button>
    <button>JavaScript</button>
  </div>
  <div class="code-content">
    <pre><code class="language-html"><!-- 高亮代碼 --></code></pre>
  </div>
  <button class="btn-copy">複製代碼</button>
</div>
```

---

## 📊 數據追蹤

每個遊戲記錄：
```javascript
{
  gameId: 'whack-a-mole',
  playCount: 15,
  bestScore: 420,
  averageScore: 230,
  totalPlayTime: 450, // 秒
  completedAt: '2025-11-16T10:30:00Z',
  achievements: ['rookie_hunter', 'combo_master']
}
```

---

## 🧪 測試計劃

### 功能測試
- [ ] 所有遊戲可正常啟動/重置
- [ ] 事件綁定正確觸發
- [ ] 得分計算準確
- [ ] 成就正確解鎖
- [ ] 代碼預覽顯示正常

### 性能測試
- [ ] 粒子效果不卡頓（60fps）
- [ ] 音頻播放無延遲
- [ ] 事件監聽器正確清理

### 瀏覽器兼容
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

---

**文檔狀態**: 設計完成，待實作
**預計完成時間**: 2025-11-20
