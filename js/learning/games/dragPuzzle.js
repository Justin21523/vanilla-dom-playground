/**
 * 拖放拼圖遊戲 (Drag Puzzle)
 *
 * 學習目標:
 * - dragstart / drag / dragend - 拖動源事件
 * - dragenter / dragover / dragleave / drop - 拖放目標事件
 * - dataTransfer API - 數據傳遞
 * - preventDefault 時機 - 關鍵操作
 * - 效果控制 - effectAllowed 和 dropEffect
 *
 * 使用純 Vanilla JavaScript，無任何框架依賴
 */

import { particleEffects } from '../../ui/particleEffects.js';

export class DragPuzzle {
  constructor(container) {
    this.container = container;

    // 遊戲狀態
    this.size = 3; // 3x3 拼圖
    this.pieces = [];
    this.slots = [];
    this.score = 0;
    this.moves = 0;
    this.correctCount = 0;
    this.startTime = null;
    this.isPlaying = false;
    this.timer = null;
    this.elapsedTime = 0;

    // 難度設定
    this.difficulties = {
      easy: { size: 3, name: '簡單 (3×3)' },
      medium: { size: 4, name: '中等 (4×4)' },
      hard: { size: 5, name: '困難 (5×5)' }
    };
    this.currentDifficulty = 'easy';

    // 當前拖動的元素
    this.draggedPiece = null;

    // DOM 元素
    this.scoreDisplay = null;
    this.movesDisplay = null;
    this.timerDisplay = null;

    this.init();
  }

  /**
   * 初始化遊戲
   */
  init() {
    this.render();
    this.bindEvents();
  }

  /**
   * 渲染遊戲 UI
   */
  render() {
    this.container.innerHTML = `
      <div class="drag-puzzle-game">
        <!-- 遊戲標題 -->
        <div class="game-header">
          <h2 class="game-title">🧩 拖放拼圖</h2>
          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-label">得分</span>
              <span class="stat-value" id="dp-score">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">移動</span>
              <span class="stat-value" id="dp-moves">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">時間</span>
              <span class="stat-value" id="dp-timer">00:00</span>
            </div>
          </div>
        </div>

        <!-- 遊戲區域 -->
        <div class="game-canvas">
          <div class="puzzle-container">
            <!-- 拼圖塊容器（待放置） -->
            <div class="puzzle-pieces" id="dp-pieces">
              ${this.createPuzzlePiecesHTML()}
            </div>

            <!-- 拼圖槽位容器（目標位置） -->
            <div class="puzzle-slots" id="dp-slots">
              ${this.createPuzzleSlotsHTML()}
            </div>
          </div>
        </div>

        <!-- 控制面板 -->
        <div class="game-controls">
          <div class="difficulty-selector">
            <label>難度：</label>
            <select id="dp-difficulty">
              <option value="easy">簡單 (3×3)</option>
              <option value="medium">中等 (4×4)</option>
              <option value="hard">困難 (5×5)</option>
            </select>
          </div>
          <button class="btn btn-primary" id="dp-start">開始遊戲</button>
          <button class="btn btn-secondary" id="dp-reset" disabled>重置</button>
          <button class="btn btn-info" id="dp-code">查看代碼</button>
        </div>

        <!-- 學習要點 -->
        <div class="game-tips">
          <h3>💡 學習要點</h3>
          <ul>
            <li><code>dragstart</code> - 開始拖動時設置數據</li>
            <li><code>dragend</code> - 拖動結束時清理狀態</li>
            <li><code>dragenter</code> - 拖入目標時的視覺反饋</li>
            <li><code>dragover</code> - 必須 preventDefault 才能放置！</li>
            <li><code>dragleave</code> - 離開目標時移除高亮</li>
            <li><code>drop</code> - 放下時處理數據和驗證</li>
            <li><code>dataTransfer</code> - 拖放數據傳遞 API</li>
          </ul>
        </div>

        <!-- 遊戲結束彈窗 -->
        <div class="game-over-modal" id="dp-modal" style="display: none;">
          <div class="modal-content">
            <h2>🎉 拼圖完成！</h2>
            <div class="final-stats">
              <p>最終得分: <strong id="dp-final-score">0</strong></p>
              <p>移動次數: <strong id="dp-final-moves">0</strong></p>
              <p>完成時間: <strong id="dp-final-time">00:00</strong></p>
              <p>評級: <strong id="dp-rating">⭐⭐⭐</strong></p>
            </div>
            <button class="btn btn-primary" id="dp-play-again">再玩一次</button>
          </div>
        </div>
      </div>
    `;

    // 獲取 DOM 元素引用
    this.scoreDisplay = document.getElementById('dp-score');
    this.movesDisplay = document.getElementById('dp-moves');
    this.timerDisplay = document.getElementById('dp-timer');
  }

  /**
   * 創建拼圖塊 HTML
   */
  createPuzzlePiecesHTML() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#FFD93D', '#6C5CE7', '#A8E6CF',
      '#FF8B94', '#C7CEEA', '#FFDAC1', '#B5EAD7',
      '#E2F0CB', '#C7CEEA', '#FFDFD3', '#B4A7D6',
      '#9FA8DA', '#80CBC4', '#FFE082', '#FFAB91',
      '#CE93D8', '#81C784', '#FFD54F', '#FF8A65',
      '#BA68C8'
    ];

    let html = '';
    const totalPieces = this.size * this.size;

    for (let i = 0; i < totalPieces; i++) {
      const row = Math.floor(i / this.size);
      const col = i % this.size;
      const color = colors[i % colors.length];
      const number = i + 1;

      html += `
        <div
          class="puzzle-piece"
          draggable="true"
          data-index="${i}"
          data-row="${row}"
          data-col="${col}"
          style="background: ${color};"
        >
          <span class="piece-number">${number}</span>
          <div class="piece-grid-pos">${row},${col}</div>
        </div>
      `;
    }

    return html;
  }

  /**
   * 創建拼圖槽位 HTML
   */
  createPuzzleSlotsHTML() {
    let html = '';
    const totalSlots = this.size * this.size;

    for (let i = 0; i < totalSlots; i++) {
      const row = Math.floor(i / this.size);
      const col = i % this.size;

      html += `
        <div
          class="puzzle-slot"
          data-index="${i}"
          data-row="${row}"
          data-col="${col}"
        >
          <div class="slot-label">${i + 1}</div>
        </div>
      `;
    }

    return html;
  }

  /**
   * 綁定事件
   */
  bindEvents() {
    // 開始按鈕
    const startBtn = document.getElementById('dp-start');
    startBtn.addEventListener('click', () => this.start());

    // 重置按鈕
    const resetBtn = document.getElementById('dp-reset');
    resetBtn.addEventListener('click', () => this.reset());

    // 查看代碼按鈕
    const codeBtn = document.getElementById('dp-code');
    codeBtn.addEventListener('click', () => this.showCode());

    // 難度選擇
    const difficultySelect = document.getElementById('dp-difficulty');
    difficultySelect.addEventListener('change', (e) => {
      this.currentDifficulty = e.target.value;
      this.size = this.difficulties[e.target.value].size;
      this.reset();
      this.render();
      this.bindEvents();
    });

    // 再玩一次按鈕
    const playAgainBtn = document.getElementById('dp-play-again');
    playAgainBtn.addEventListener('click', () => {
      this.hideModal();
      this.reset();
      this.start();
    });

    // 綁定拖放事件
    this.setupDragAndDrop();
  }

  /**
   * 設置拖放事件處理器
   */
  setupDragAndDrop() {
    // 獲取所有拼圖塊
    this.pieces = Array.from(document.querySelectorAll('.puzzle-piece'));

    // 獲取所有槽位
    this.slots = Array.from(document.querySelectorAll('.puzzle-slot'));

    // 為每個拼圖塊綁定拖動源事件
    this.pieces.forEach(piece => {
      // dragstart - 開始拖動
      piece.addEventListener('dragstart', (e) => this.handleDragStart(e));

      // drag - 拖動過程中（可選，用於追蹤）
      piece.addEventListener('drag', (e) => this.handleDrag(e));

      // dragend - 拖動結束
      piece.addEventListener('dragend', (e) => this.handleDragEnd(e));
    });

    // 為每個槽位綁定拖放目標事件
    this.slots.forEach(slot => {
      // dragenter - 拖入目標
      slot.addEventListener('dragenter', (e) => this.handleDragEnter(e));

      // dragover - 在目標上方（必須 preventDefault！）
      slot.addEventListener('dragover', (e) => this.handleDragOver(e));

      // dragleave - 離開目標
      slot.addEventListener('dragleave', (e) => this.handleDragLeave(e));

      // drop - 放下
      slot.addEventListener('drop', (e) => this.handleDrop(e));
    });
  }

  /**
   * 處理 dragstart 事件
   */
  handleDragStart(event) {
    if (!this.isPlaying) return;

    const piece = event.currentTarget;
    this.draggedPiece = piece;

    // 設置拖動效果
    event.dataTransfer.effectAllowed = 'move';

    // 傳遞數據（拼圖塊的索引）
    event.dataTransfer.setData('text/plain', piece.dataset.index);

    // 添加拖動樣式
    piece.classList.add('dragging');

    // 可選：自定義拖動圖像
    const rect = piece.getBoundingClientRect();
    event.dataTransfer.setDragImage(piece, rect.width / 2, rect.height / 2);

    console.log('🎯 dragstart - 開始拖動拼圖塊:', piece.dataset.index);
  }

  /**
   * 處理 drag 事件（拖動過程中）
   */
  handleDrag(event) {
    // 可選：在這裡追蹤拖動位置或顯示輔助線
    // 為了性能，通常不做處理
  }

  /**
   * 處理 dragend 事件
   */
  handleDragEnd(event) {
    const piece = event.currentTarget;

    // 移除拖動樣式
    piece.classList.remove('dragging');

    // 清理所有槽位的高亮
    this.slots.forEach(slot => {
      slot.classList.remove('drag-over', 'drag-valid', 'drag-invalid');
    });

    console.log('🏁 dragend - 拖動結束');
  }

  /**
   * 處理 dragenter 事件
   */
  handleDragEnter(event) {
    if (!this.isPlaying || !this.draggedPiece) return;

    const slot = event.currentTarget;

    // 阻止默認行為
    event.preventDefault();

    // 檢查槽位是否為空
    const isEmpty = !slot.querySelector('.puzzle-piece');

    if (isEmpty) {
      // 檢查是否是正確位置
      const pieceIndex = this.draggedPiece.dataset.index;
      const slotIndex = slot.dataset.index;

      if (pieceIndex === slotIndex) {
        slot.classList.add('drag-over', 'drag-valid');
      } else {
        slot.classList.add('drag-over', 'drag-invalid');
      }
    }

    console.log('🔵 dragenter - 拖入槽位:', slot.dataset.index);
  }

  /**
   * 處理 dragover 事件
   */
  handleDragOver(event) {
    if (!this.isPlaying) return;

    // ⚠️ 關鍵！必須阻止默認行為才能觸發 drop
    event.preventDefault();

    // 設置拖放效果
    event.dataTransfer.dropEffect = 'move';
  }

  /**
   * 處理 dragleave 事件
   */
  handleDragLeave(event) {
    const slot = event.currentTarget;

    // 檢查是否真的離開了槽位（不是進入子元素）
    if (!slot.contains(event.relatedTarget)) {
      slot.classList.remove('drag-over', 'drag-valid', 'drag-invalid');
    }

    console.log('🔴 dragleave - 離開槽位:', slot.dataset.index);
  }

  /**
   * 處理 drop 事件
   */
  handleDrop(event) {
    if (!this.isPlaying) return;

    // 阻止默認行為（某些瀏覽器會打開鏈接）
    event.preventDefault();

    const slot = event.currentTarget;

    // 獲取拖動的拼圖塊索引
    const pieceIndex = event.dataTransfer.getData('text/plain');
    const piece = this.pieces[pieceIndex];
    const slotIndex = slot.dataset.index;

    // 檢查槽位是否為空
    const isEmpty = !slot.querySelector('.puzzle-piece');

    if (!isEmpty) {
      // 槽位已被占用
      this.showError(slot, '槽位已被占用！');
      slot.classList.remove('drag-over', 'drag-valid', 'drag-invalid');
      return;
    }

    // 移動計數
    this.moves++;
    this.updateDisplay();

    // 檢查是否放置正確
    if (pieceIndex === slotIndex) {
      // ✅ 正確位置
      slot.appendChild(piece);
      slot.classList.add('correct');
      slot.classList.remove('drag-over', 'drag-valid', 'drag-invalid');

      this.correctCount++;
      this.score += 100;

      // 視覺反饋
      this.showSuccess(slot);

      // 粒子特效
      const rect = slot.getBoundingClientRect();
      particleEffects.explode(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        {
          count: 15,
          colors: ['#4ECDC4', '#FFD93D', '#FF6B6B'],
          minSpeed: 2,
          maxSpeed: 5
        }
      );

      // 檢查是否完成
      if (this.correctCount === this.size * this.size) {
        setTimeout(() => this.gameWin(), 500);
      }
    } else {
      // ❌ 錯誤位置
      this.showError(slot, '位置錯誤！');
      this.score = Math.max(0, this.score - 10); // 扣分但不低於 0
    }

    slot.classList.remove('drag-over', 'drag-valid', 'drag-invalid');
    this.updateDisplay();

    console.log('📦 drop - 放下拼圖塊:', pieceIndex, '到槽位:', slotIndex);
  }

  /**
   * 開始遊戲
   */
  start() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.score = 0;
    this.moves = 0;
    this.correctCount = 0;
    this.elapsedTime = 0;
    this.startTime = Date.now();

    // 打亂拼圖塊
    this.shufflePieces();

    this.updateDisplay();

    // 啟用/禁用按鈕
    document.getElementById('dp-start').disabled = true;
    document.getElementById('dp-reset').disabled = false;
    document.getElementById('dp-difficulty').disabled = true;

    // 開始計時器
    this.startTimer();
  }

  /**
   * 開始計時器
   */
  startTimer() {
    this.timer = setInterval(() => {
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      this.updateTimerDisplay();
    }, 1000);
  }

  /**
   * 打亂拼圖塊
   */
  shufflePieces() {
    const piecesContainer = document.getElementById('dp-pieces');

    // 使用 Fisher-Yates 洗牌算法
    const shuffled = [...this.pieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 重新排列 DOM
    shuffled.forEach(piece => {
      piecesContainer.appendChild(piece);
    });
  }

  /**
   * 顯示成功反饋
   */
  showSuccess(slot) {
    slot.classList.add('flash-success');
    setTimeout(() => {
      slot.classList.remove('flash-success');
    }, 600);
  }

  /**
   * 顯示錯誤反饋
   */
  showError(slot, message = '錯誤！') {
    // 震動效果
    slot.classList.add('shake');
    setTimeout(() => {
      slot.classList.remove('shake');
    }, 500);

    // 顯示錯誤消息
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.textContent = message;
    errorMsg.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 107, 107, 0.95);
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: bold;
      pointer-events: none;
      animation: fadeOut 1s ease-out forwards;
      z-index: 10;
    `;

    slot.style.position = 'relative';
    slot.appendChild(errorMsg);

    setTimeout(() => {
      if (errorMsg.parentNode) {
        errorMsg.parentNode.removeChild(errorMsg);
      }
    }, 1000);
  }

  /**
   * 更新顯示
   */
  updateDisplay() {
    this.scoreDisplay.textContent = this.score;
    this.movesDisplay.textContent = this.moves;
  }

  /**
   * 更新計時器顯示
   */
  updateTimerDisplay() {
    const minutes = Math.floor(this.elapsedTime / 60);
    const seconds = this.elapsedTime % 60;
    this.timerDisplay.textContent =
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  /**
   * 遊戲勝利
   */
  gameWin() {
    this.isPlaying = false;
    clearInterval(this.timer);

    // 計算評級
    const rating = this.calculateRating();

    // 顯示結果
    document.getElementById('dp-final-score').textContent = this.score;
    document.getElementById('dp-final-moves').textContent = this.moves;
    document.getElementById('dp-final-time').textContent = this.timerDisplay.textContent;
    document.getElementById('dp-rating').textContent = rating.stars;

    // 煙火慶祝
    if (rating.level >= 3) {
      particleEffects.fireworkShow(5);
    } else if (rating.level >= 2) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      particleEffects.confetti(centerX, centerY - 100, { count: 50 });
    }

    // 顯示彈窗
    setTimeout(() => {
      this.showModal();
    }, 800);

    // 恢復按鈕狀態
    document.getElementById('dp-start').disabled = false;
    document.getElementById('dp-reset').disabled = true;
    document.getElementById('dp-difficulty').disabled = false;
  }

  /**
   * 計算評級
   */
  calculateRating() {
    const perfectMoves = this.size * this.size;
    const maxTime = this.size * this.size * 10; // 每塊 10 秒

    let stars = '⭐';
    let level = 1;

    if (this.moves === perfectMoves && this.elapsedTime < maxTime * 0.5) {
      stars = '⭐⭐⭐⭐⭐';
      level = 5;
    } else if (this.moves <= perfectMoves * 1.2 && this.elapsedTime < maxTime * 0.7) {
      stars = '⭐⭐⭐⭐';
      level = 4;
    } else if (this.moves <= perfectMoves * 1.5 && this.elapsedTime < maxTime) {
      stars = '⭐⭐⭐';
      level = 3;
    } else if (this.moves <= perfectMoves * 2) {
      stars = '⭐⭐';
      level = 2;
    }

    return { stars, level };
  }

  /**
   * 重置遊戲
   */
  reset() {
    this.isPlaying = false;
    this.score = 0;
    this.moves = 0;
    this.correctCount = 0;
    this.elapsedTime = 0;
    this.draggedPiece = null;

    clearInterval(this.timer);

    // 重置顯示
    this.updateDisplay();
    this.timerDisplay.textContent = '00:00';

    // 移除所有拼圖塊從槽位
    this.slots.forEach(slot => {
      slot.classList.remove('correct', 'drag-over', 'drag-valid', 'drag-invalid');
      const piece = slot.querySelector('.puzzle-piece');
      if (piece) {
        document.getElementById('dp-pieces').appendChild(piece);
      }
    });

    // 恢復按鈕狀態
    document.getElementById('dp-start').disabled = false;
    document.getElementById('dp-reset').disabled = true;
  }

  /**
   * 顯示彈窗
   */
  showModal() {
    const modal = document.getElementById('dp-modal');
    modal.style.display = 'flex';
  }

  /**
   * 隱藏彈窗
   */
  hideModal() {
    const modal = document.getElementById('dp-modal');
    modal.style.display = 'none';
  }

  /**
   * 顯示代碼
   */
  showCode() {
    const code = `
// 拖放拼圖核心代碼示例

// 1. 設置拖動源事件
piece.addEventListener('dragstart', (e) => {
  // 設置拖動效果
  e.dataTransfer.effectAllowed = 'move';

  // 傳遞數據
  e.dataTransfer.setData('text/plain', pieceIndex);

  // 添加拖動樣式
  piece.classList.add('dragging');

  // 自定義拖動圖像
  e.dataTransfer.setDragImage(piece, 50, 50);
});

piece.addEventListener('dragend', (e) => {
  piece.classList.remove('dragging');
});

// 2. 設置拖放目標事件
slot.addEventListener('dragenter', (e) => {
  e.preventDefault();
  slot.classList.add('drag-over');
});

slot.addEventListener('dragover', (e) => {
  // ⚠️ 關鍵！必須阻止默認行為
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
});

slot.addEventListener('dragleave', (e) => {
  // 檢查是否真的離開（不是進入子元素）
  if (!slot.contains(e.relatedTarget)) {
    slot.classList.remove('drag-over');
  }
});

slot.addEventListener('drop', (e) => {
  e.preventDefault();

  // 獲取傳遞的數據
  const pieceIndex = e.dataTransfer.getData('text/plain');
  const piece = pieces[pieceIndex];

  // 驗證並放置
  if (pieceIndex === slotIndex) {
    slot.appendChild(piece);
    slot.classList.add('correct');
  } else {
    showError('位置錯誤！');
  }

  slot.classList.remove('drag-over');
});

// 3. 關鍵學習點
// - dragover 必須 preventDefault，否則 drop 不會觸發
// - dataTransfer 用於在源和目標間傳遞數據
// - dragleave 需要檢查 relatedTarget 避免誤判
// - effectAllowed 和 dropEffect 控制拖動游標
    `.trim();

    alert(code);
  }

  /**
   * 銷毀遊戲
   */
  destroy() {
    clearInterval(this.timer);
    this.container.innerHTML = '';
  }
}
