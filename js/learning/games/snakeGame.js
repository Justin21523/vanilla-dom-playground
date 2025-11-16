/**
 * 貪吃蛇遊戲 (Snake Game)
 *
 * 學習目標:
 * - keydown / keyup - 鍵盤事件處理
 * - preventDefault - 阻止方向鍵默認滾動
 * - 遊戲循環 - setInterval 和清理
 * - 碰撞檢測 - 邊界和自身碰撞
 * - 方向控制 - 防止 180 度轉向
 *
 * 使用純 Vanilla JavaScript，無任何框架依賴
 */

import { particleEffects } from '../../ui/particleEffects.js';

export class SnakeGame {
  constructor(container) {
    this.container = container;

    // 遊戲設定
    this.gridSize = 20; // 20x20 網格
    this.cellSize = 20; // 每格 20px
    this.canvasWidth = this.gridSize * this.cellSize;
    this.canvasHeight = this.gridSize * this.cellSize;

    // 遊戲狀態
    this.snake = [{ x: 10, y: 10 }]; // 蛇的身體（頭在前）
    this.direction = 'right'; // 當前方向
    this.nextDirection = 'right'; // 下一個方向（用於防止快速轉向）
    this.food = null;
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.isPlaying = false;
    this.isPaused = false;
    this.gameLoop = null;
    this.speed = 150; // 移動間隔（ms）

    // 難度設定
    this.difficulties = {
      easy: { speed: 200, name: '簡單' },
      medium: { speed: 150, name: '中等' },
      hard: { speed: 100, name: '困難' },
      extreme: { speed: 60, name: '極速' }
    };
    this.currentDifficulty = 'medium';

    // Canvas 元素
    this.canvas = null;
    this.ctx = null;

    // DOM 元素
    this.scoreDisplay = null;
    this.highScoreDisplay = null;
    this.lengthDisplay = null;

    // 鍵盤事件處理器（保存引用以便移除）
    this.handleKeyDown = null;

    this.init();
  }

  /**
   * 初始化遊戲
   */
  init() {
    this.render();
    this.bindEvents();
    this.generateFood();
  }

  /**
   * 渲染遊戲 UI
   */
  render() {
    this.container.innerHTML = `
      <div class="snake-game">
        <!-- 遊戲標題 -->
        <div class="game-header">
          <h2 class="game-title">🐍 貪吃蛇</h2>
          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-label">得分</span>
              <span class="stat-value" id="snake-score">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">長度</span>
              <span class="stat-value" id="snake-length">1</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最高分</span>
              <span class="stat-value" id="snake-high-score">${this.highScore}</span>
            </div>
          </div>
        </div>

        <!-- 遊戲畫布 -->
        <div class="game-canvas">
          <canvas
            id="snake-canvas"
            width="${this.canvasWidth}"
            height="${this.canvasHeight}"
          ></canvas>
          <div class="game-overlay" id="snake-overlay" style="display: none;">
            <div class="overlay-content">
              <p id="overlay-message">按空格鍵開始</p>
            </div>
          </div>
        </div>

        <!-- 控制說明 -->
        <div class="game-controls-info">
          <p>🎮 控制: <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> 或 <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd></p>
          <p>⏸️ 暫停: <kbd>Space</kbd> | 🔄 重新開始: <kbd>R</kbd></p>
        </div>

        <!-- 控制面板 -->
        <div class="game-controls">
          <div class="difficulty-selector">
            <label>難度：</label>
            <select id="snake-difficulty">
              <option value="easy">簡單</option>
              <option value="medium" selected>中等</option>
              <option value="hard">困難</option>
              <option value="extreme">極速</option>
            </select>
          </div>
          <button class="btn btn-primary" id="snake-start">開始遊戲</button>
          <button class="btn btn-secondary" id="snake-pause" disabled>暫停</button>
          <button class="btn btn-info" id="snake-code">查看代碼</button>
        </div>

        <!-- 學習要點 -->
        <div class="game-tips">
          <h3>💡 學習要點</h3>
          <ul>
            <li><code>keydown</code> - 檢測鍵盤按下</li>
            <li><code>e.preventDefault()</code> - 阻止方向鍵默認滾動</li>
            <li><code>e.key</code> - 獲取按鍵名稱（現代方法）</li>
            <li><code>setInterval</code> - 遊戲循環定時器</li>
            <li>方向控制 - 防止 180 度轉向邏輯</li>
            <li>碰撞檢測 - 邊界和自身碰撞判斷</li>
          </ul>
        </div>

        <!-- 遊戲結束彈窗 -->
        <div class="game-over-modal" id="snake-modal" style="display: none;">
          <div class="modal-content">
            <h2>💀 Game Over</h2>
            <div class="final-stats">
              <p>最終得分: <strong id="snake-final-score">0</strong></p>
              <p>蛇的長度: <strong id="snake-final-length">0</strong></p>
              <p id="new-high-score" style="display: none; color: #FFD93D;">
                🎉 新紀錄！
              </p>
            </div>
            <button class="btn btn-primary" id="snake-play-again">再玩一次</button>
          </div>
        </div>
      </div>
    `;

    // 獲取 DOM 元素引用
    this.canvas = document.getElementById('snake-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.scoreDisplay = document.getElementById('snake-score');
    this.highScoreDisplay = document.getElementById('snake-high-score');
    this.lengthDisplay = document.getElementById('snake-length');

    // 繪製初始網格
    this.drawGrid();
    this.drawSnake();
    this.drawFood();
  }

  /**
   * 綁定事件
   */
  bindEvents() {
    // 開始按鈕
    const startBtn = document.getElementById('snake-start');
    startBtn.addEventListener('click', () => this.start());

    // 暫停按鈕
    const pauseBtn = document.getElementById('snake-pause');
    pauseBtn.addEventListener('click', () => this.togglePause());

    // 查看代碼按鈕
    const codeBtn = document.getElementById('snake-code');
    codeBtn.addEventListener('click', () => this.showCode());

    // 難度選擇
    const difficultySelect = document.getElementById('snake-difficulty');
    difficultySelect.addEventListener('change', (e) => {
      this.currentDifficulty = e.target.value;
      this.speed = this.difficulties[e.target.value].speed;
    });

    // 再玩一次按鈕
    const playAgainBtn = document.getElementById('snake-play-again');
    playAgainBtn.addEventListener('click', () => {
      this.hideModal();
      this.reset();
      this.start();
    });

    // 鍵盤控制
    this.handleKeyDown = (e) => this.onKeyDown(e);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 處理鍵盤事件
   */
  onKeyDown(event) {
    const key = event.key;

    // 防止方向鍵和空格鍵的默認行為（滾動頁面）
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'r'].includes(key.toLowerCase())) {
      event.preventDefault();
    }

    // 空格鍵：開始/暫停
    if (key === ' ') {
      if (!this.isPlaying) {
        this.start();
      } else {
        this.togglePause();
      }
      return;
    }

    // R 鍵：重新開始
    if (key.toLowerCase() === 'r' && !this.isPlaying) {
      this.reset();
      this.start();
      return;
    }

    // 遊戲未進行或暫停時，忽略方向鍵
    if (!this.isPlaying || this.isPaused) {
      return;
    }

    // 方向鍵控制
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        // 防止 180 度轉向（向上時不能直接向下）
        if (this.direction !== 'down') {
          this.nextDirection = 'up';
        }
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (this.direction !== 'up') {
          this.nextDirection = 'down';
        }
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (this.direction !== 'right') {
          this.nextDirection = 'left';
        }
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (this.direction !== 'left') {
          this.nextDirection = 'right';
        }
        break;
    }
  }

  /**
   * 開始遊戲
   */
  start() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.isPaused = false;
    this.hideOverlay();

    // 啟用/禁用按鈕
    document.getElementById('snake-start').disabled = true;
    document.getElementById('snake-pause').disabled = false;
    document.getElementById('snake-difficulty').disabled = true;

    // 開始遊戲循環
    this.gameLoop = setInterval(() => this.update(), this.speed);
  }

  /**
   * 暫停/繼續
   */
  togglePause() {
    if (!this.isPlaying) return;

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      clearInterval(this.gameLoop);
      this.showOverlay('遊戲暫停 - 按空格繼續');
      document.getElementById('snake-pause').textContent = '繼續';
    } else {
      this.hideOverlay();
      this.gameLoop = setInterval(() => this.update(), this.speed);
      document.getElementById('snake-pause').textContent = '暫停';
    }
  }

  /**
   * 遊戲主循環
   */
  update() {
    // 應用方向改變
    this.direction = this.nextDirection;

    // 計算新頭部位置
    const head = { ...this.snake[0] };

    switch (this.direction) {
      case 'up':
        head.y--;
        break;
      case 'down':
        head.y++;
        break;
      case 'left':
        head.x--;
        break;
      case 'right':
        head.x++;
        break;
    }

    // 碰撞檢測
    if (this.checkCollision(head)) {
      this.gameOver();
      return;
    }

    // 添加新頭部
    this.snake.unshift(head);

    // 檢查是否吃到食物
    if (head.x === this.food.x && head.y === this.food.y) {
      this.eatFood();
    } else {
      // 沒吃到食物，移除尾部（蛇不變長）
      this.snake.pop();
    }

    // 重繪
    this.draw();
    this.updateDisplay();
  }

  /**
   * 碰撞檢測
   */
  checkCollision(head) {
    // 撞牆
    if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
      return true;
    }

    // 撞到自己
    for (const segment of this.snake) {
      if (segment.x === head.x && segment.y === head.y) {
        return true;
      }
    }

    return false;
  }

  /**
   * 吃到食物
   */
  eatFood() {
    this.score += 10;

    // 粒子特效
    const foodX = this.food.x * this.cellSize + this.cellSize / 2;
    const foodY = this.food.y * this.cellSize + this.cellSize / 2;
    const rect = this.canvas.getBoundingClientRect();

    particleEffects.explode(
      rect.left + foodX,
      rect.top + foodY,
      {
        count: 15,
        colors: ['#FF6B6B', '#FFD93D', '#4ECDC4'],
        minSpeed: 2,
        maxSpeed: 5
      }
    );

    // 生成新食物
    this.generateFood();
  }

  /**
   * 生成食物
   */
  generateFood() {
    let foodPosition;

    // 確保食物不在蛇身上
    do {
      foodPosition = {
        x: Math.floor(Math.random() * this.gridSize),
        y: Math.floor(Math.random() * this.gridSize)
      };
    } while (this.snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y));

    this.food = foodPosition;
  }

  /**
   * 繪製遊戲畫面
   */
  draw() {
    // 清空畫布
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 繪製網格
    this.drawGrid();

    // 繪製蛇
    this.drawSnake();

    // 繪製食物
    this.drawFood();
  }

  /**
   * 繪製網格
   */
  drawGrid() {
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 0.5;

    // 垂直線
    for (let i = 0; i <= this.gridSize; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.cellSize, 0);
      this.ctx.lineTo(i * this.cellSize, this.canvasHeight);
      this.ctx.stroke();
    }

    // 水平線
    for (let i = 0; i <= this.gridSize; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.cellSize);
      this.ctx.lineTo(this.canvasWidth, i * this.cellSize);
      this.ctx.stroke();
    }
  }

  /**
   * 繪製蛇
   */
  drawSnake() {
    this.snake.forEach((segment, index) => {
      const x = segment.x * this.cellSize;
      const y = segment.y * this.cellSize;

      if (index === 0) {
        // 頭部 - 綠色漸變
        const gradient = this.ctx.createRadialGradient(
          x + this.cellSize / 2,
          y + this.cellSize / 2,
          0,
          x + this.cellSize / 2,
          y + this.cellSize / 2,
          this.cellSize / 2
        );
        gradient.addColorStop(0, '#4ECDC4');
        gradient.addColorStop(1, '#2c9e95');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        this.ctx.strokeStyle = '#2c9e95';
        this.ctx.strokeRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);

        // 眼睛
        this.ctx.fillStyle = '#fff';
        const eyeSize = 3;
        if (this.direction === 'right') {
          this.ctx.fillRect(x + 12, y + 6, eyeSize, eyeSize);
          this.ctx.fillRect(x + 12, y + 11, eyeSize, eyeSize);
        } else if (this.direction === 'left') {
          this.ctx.fillRect(x + 5, y + 6, eyeSize, eyeSize);
          this.ctx.fillRect(x + 5, y + 11, eyeSize, eyeSize);
        } else if (this.direction === 'up') {
          this.ctx.fillRect(x + 6, y + 5, eyeSize, eyeSize);
          this.ctx.fillRect(x + 11, y + 5, eyeSize, eyeSize);
        } else {
          this.ctx.fillRect(x + 6, y + 12, eyeSize, eyeSize);
          this.ctx.fillRect(x + 11, y + 12, eyeSize, eyeSize);
        }
      } else {
        // 身體 - 漸變變淺
        const alpha = 1 - (index / this.snake.length) * 0.5;
        this.ctx.fillStyle = `rgba(78, 205, 196, ${alpha})`;
        this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        this.ctx.strokeStyle = `rgba(44, 158, 149, ${alpha})`;
        this.ctx.strokeRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
      }
    });
  }

  /**
   * 繪製食物
   */
  drawFood() {
    if (!this.food) return;

    const x = this.food.x * this.cellSize;
    const y = this.food.y * this.cellSize;

    // 食物 - 紅色圓形
    const gradient = this.ctx.createRadialGradient(
      x + this.cellSize / 2,
      y + this.cellSize / 2,
      0,
      x + this.cellSize / 2,
      y + this.cellSize / 2,
      this.cellSize / 2
    );
    gradient.addColorStop(0, '#FF6B6B');
    gradient.addColorStop(1, '#c92a2a');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(
      x + this.cellSize / 2,
      y + this.cellSize / 2,
      this.cellSize / 2 - 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // 高光
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(
      x + this.cellSize / 2 - 3,
      y + this.cellSize / 2 - 3,
      3,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  /**
   * 更新顯示
   */
  updateDisplay() {
    this.scoreDisplay.textContent = this.score;
    this.lengthDisplay.textContent = this.snake.length;
  }

  /**
   * 遊戲結束
   */
  gameOver() {
    this.isPlaying = false;
    clearInterval(this.gameLoop);

    // 檢查是否破紀錄
    const isNewHighScore = this.score > this.highScore;
    if (isNewHighScore) {
      this.highScore = this.score;
      this.saveHighScore();
      this.highScoreDisplay.textContent = this.highScore;
    }

    // 顯示結果
    document.getElementById('snake-final-score').textContent = this.score;
    document.getElementById('snake-final-length').textContent = this.snake.length;

    const newHighScoreMsg = document.getElementById('new-high-score');
    if (isNewHighScore) {
      newHighScoreMsg.style.display = 'block';
      // 煙火慶祝
      particleEffects.fireworkShow(5);
    } else {
      newHighScoreMsg.style.display = 'none';
    }

    // 顯示彈窗
    setTimeout(() => {
      this.showModal();
    }, 500);

    // 恢復按鈕狀態
    document.getElementById('snake-start').disabled = false;
    document.getElementById('snake-pause').disabled = true;
    document.getElementById('snake-difficulty').disabled = false;
  }

  /**
   * 重置遊戲
   */
  reset() {
    this.isPlaying = false;
    this.isPaused = false;
    this.snake = [{ x: 10, y: 10 }];
    this.direction = 'right';
    this.nextDirection = 'right';
    this.score = 0;
    this.speed = this.difficulties[this.currentDifficulty].speed;

    clearInterval(this.gameLoop);

    this.generateFood();
    this.draw();
    this.updateDisplay();

    // 恢復按鈕狀態
    document.getElementById('snake-start').disabled = false;
    document.getElementById('snake-pause').disabled = true;
    document.getElementById('snake-pause').textContent = '暫停';
  }

  /**
   * 顯示遮罩
   */
  showOverlay(message) {
    const overlay = document.getElementById('snake-overlay');
    const messageEl = document.getElementById('overlay-message');
    messageEl.textContent = message;
    overlay.style.display = 'flex';
  }

  /**
   * 隱藏遮罩
   */
  hideOverlay() {
    const overlay = document.getElementById('snake-overlay');
    overlay.style.display = 'none';
  }

  /**
   * 顯示彈窗
   */
  showModal() {
    const modal = document.getElementById('snake-modal');
    modal.style.display = 'flex';
  }

  /**
   * 隱藏彈窗
   */
  hideModal() {
    const modal = document.getElementById('snake-modal');
    modal.style.display = 'none';
  }

  /**
   * 載入最高分
   */
  loadHighScore() {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  }

  /**
   * 保存最高分
   */
  saveHighScore() {
    localStorage.setItem('snakeHighScore', this.highScore.toString());
  }

  /**
   * 顯示代碼
   */
  showCode() {
    const code = `
// 貪吃蛇核心代碼示例

// 1. 鍵盤事件處理
document.addEventListener('keydown', (e) => {
  const key = e.key;

  // 防止方向鍵默認滾動
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
    e.preventDefault();
  }

  // 方向控制（防止 180 度轉向）
  switch (key) {
    case 'ArrowUp':
      if (direction !== 'down') nextDirection = 'up';
      break;
    case 'ArrowDown':
      if (direction !== 'up') nextDirection = 'down';
      break;
    case 'ArrowLeft':
      if (direction !== 'right') nextDirection = 'left';
      break;
    case 'ArrowRight':
      if (direction !== 'left') nextDirection = 'right';
      break;
  }
});

// 2. 遊戲循環
const gameLoop = setInterval(() => {
  // 移動蛇頭
  const head = { ...snake[0] };
  switch (direction) {
    case 'up': head.y--; break;
    case 'down': head.y++; break;
    case 'left': head.x--; break;
    case 'right': head.x++; break;
  }

  // 碰撞檢測
  if (checkCollision(head)) {
    gameOver();
    return;
  }

  // 添加新頭部
  snake.unshift(head);

  // 吃到食物？
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    generateFood();
  } else {
    snake.pop(); // 移除尾部
  }

  draw();
}, 150);

// 3. 碰撞檢測
function checkCollision(head) {
  // 撞牆
  if (head.x < 0 || head.x >= gridSize ||
      head.y < 0 || head.y >= gridSize) {
    return true;
  }
  // 撞自己
  return snake.some(s => s.x === head.x && s.y === head.y);
}

// 4. Canvas 繪製
function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#4ECDC4' : '#2c9e95';
    ctx.fillRect(
      segment.x * cellSize,
      segment.y * cellSize,
      cellSize,
      cellSize
    );
  });
}
    `.trim();

    alert(code);
  }

  /**
   * 銷毀遊戲
   */
  destroy() {
    clearInterval(this.gameLoop);
    document.removeEventListener('keydown', this.handleKeyDown);
    this.container.innerHTML = '';
  }
}
