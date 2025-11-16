/**
 * 打地鼠遊戲 (Whack-a-Mole)
 *
 * 學習目標:
 * - click 事件基礎
 * - event.isTrusted 防作弊
 * - transitionend 動畫結束回調
 * - classList 操作
 * - setTimeout/setInterval 定時器管理
 *
 * 使用純 Vanilla JavaScript，無任何框架依賴
 */

import { particleEffects } from '../../ui/particleEffects.js';

export class WhackAMole {
  constructor(container) {
    this.container = container;

    // 遊戲狀態
    this.score = 0;
    this.timeLeft = 30;
    this.isPlaying = false;
    this.combo = 0;
    this.maxCombo = 0;
    this.hits = 0;
    this.misses = 0;

    // 難度設定
    this.difficulty = {
      easy: { duration: 1500, interval: 800, name: '簡單' },
      medium: { duration: 1000, interval: 600, name: '中等' },
      hard: { duration: 700, interval: 400, name: '困難' }
    };
    this.currentDifficulty = 'easy';

    // 定時器
    this.gameTimer = null;
    this.moleTimer = null;

    // DOM 元素
    this.holes = [];
    this.scoreDisplay = null;
    this.timerDisplay = null;
    this.comboDisplay = null;

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
      <div class="whack-a-mole-game">
        <!-- 遊戲標題 -->
        <div class="game-header">
          <h2 class="game-title">🦫 打地鼠</h2>
          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-label">得分</span>
              <span class="stat-value" id="wam-score">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">時間</span>
              <span class="stat-value" id="wam-timer">30</span>s
            </div>
            <div class="stat-item combo-stat">
              <span class="stat-label">連擊</span>
              <span class="stat-value" id="wam-combo">0</span>x
            </div>
          </div>
        </div>

        <!-- 遊戲區域 -->
        <div class="game-canvas">
          <div class="mole-grid">
            ${this.createHoles()}
          </div>
        </div>

        <!-- 控制面板 -->
        <div class="game-controls">
          <div class="difficulty-selector">
            <label>難度：</label>
            <select id="wam-difficulty">
              <option value="easy">簡單</option>
              <option value="medium">中等</option>
              <option value="hard">困難</option>
            </select>
          </div>
          <button class="btn btn-primary" id="wam-start">開始遊戲</button>
          <button class="btn btn-secondary" id="wam-reset" disabled>重置</button>
          <button class="btn btn-info" id="wam-code">查看代碼</button>
        </div>

        <!-- 學習要點 -->
        <div class="game-tips">
          <h3>💡 學習要點</h3>
          <ul>
            <li><code>click</code> 事件 - 檢測鼠標點擊</li>
            <li><code>event.isTrusted</code> - 防止腳本作弊</li>
            <li><code>classList.add/remove</code> - 動態控制樣式</li>
            <li><code>transitionend</code> - CSS 動畫結束回調</li>
            <li><code>setTimeout/setInterval</code> - 定時器管理</li>
          </ul>
        </div>

        <!-- 遊戲結束彈窗 -->
        <div class="game-over-modal" id="wam-modal" style="display: none;">
          <div class="modal-content">
            <h2>🎉 遊戲結束</h2>
            <div class="final-stats">
              <p>最終得分: <strong id="wam-final-score">0</strong></p>
              <p>命中次數: <strong id="wam-hits">0</strong></p>
              <p>最高連擊: <strong id="wam-max-combo">0</strong>x</p>
              <p>準確率: <strong id="wam-accuracy">0</strong>%</p>
            </div>
            <button class="btn btn-primary" id="wam-play-again">再玩一次</button>
          </div>
        </div>
      </div>
    `;

    // 獲取 DOM 元素引用
    this.scoreDisplay = document.getElementById('wam-score');
    this.timerDisplay = document.getElementById('wam-timer');
    this.comboDisplay = document.getElementById('wam-combo');
    this.holes = Array.from(document.querySelectorAll('.mole-hole'));
  }

  /**
   * 創建 3x3 網格的洞
   */
  createHoles() {
    let html = '';
    for (let i = 0; i < 9; i++) {
      html += `
        <div class="mole-hole" data-index="${i}">
          <div class="mole">🦫</div>
          <div class="hole-bg"></div>
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
    const startBtn = document.getElementById('wam-start');
    startBtn.addEventListener('click', () => this.start());

    // 重置按鈕
    const resetBtn = document.getElementById('wam-reset');
    resetBtn.addEventListener('click', () => this.reset());

    // 查看代碼按鈕
    const codeBtn = document.getElementById('wam-code');
    codeBtn.addEventListener('click', () => this.showCode());

    // 難度選擇
    const difficultySelect = document.getElementById('wam-difficulty');
    difficultySelect.addEventListener('change', (e) => {
      this.currentDifficulty = e.target.value;
    });

    // 再玩一次按鈕
    const playAgainBtn = document.getElementById('wam-play-again');
    playAgainBtn.addEventListener('click', () => {
      this.hideModal();
      this.reset();
      this.start();
    });

    // 為每個洞綁定點擊事件
    this.holes.forEach(hole => {
      hole.addEventListener('click', (e) => this.whack(e));
    });
  }

  /**
   * 開始遊戲
   */
  start() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.score = 0;
    this.timeLeft = 30;
    this.combo = 0;
    this.maxCombo = 0;
    this.hits = 0;
    this.misses = 0;

    this.updateDisplay();

    // 啟用/禁用按鈕
    document.getElementById('wam-start').disabled = true;
    document.getElementById('wam-reset').disabled = false;
    document.getElementById('wam-difficulty').disabled = true;

    // 開始倒計時
    this.startTimer();

    // 開始彈出地鼠
    this.startMoles();
  }

  /**
   * 開始倒計時
   */
  startTimer() {
    this.gameTimer = setInterval(() => {
      this.timeLeft--;
      this.timerDisplay.textContent = this.timeLeft;

      // 時間快結束時變紅
      if (this.timeLeft <= 10) {
        this.timerDisplay.style.color = '#FF6B6B';
      }

      if (this.timeLeft <= 0) {
        this.gameOver();
      }
    }, 1000);
  }

  /**
   * 開始彈出地鼠
   */
  startMoles() {
    const config = this.difficulty[this.currentDifficulty];

    const popMole = () => {
      if (!this.isPlaying) return;

      // 隨機選擇一個洞
      const randomIndex = Math.floor(Math.random() * 9);
      const hole = this.holes[randomIndex];

      // 如果這個洞已經有地鼠，換一個
      if (hole.classList.contains('active')) {
        popMole();
        return;
      }

      // 地鼠彈出
      hole.classList.add('active');

      // 自動縮回
      setTimeout(() => {
        if (hole.classList.contains('active')) {
          hole.classList.remove('active');
          this.combo = 0; // 沒打到，重置連擊
          this.misses++;
        }
      }, config.duration);
    };

    // 定期彈出地鼠
    this.moleTimer = setInterval(popMole, config.interval);

    // 立即彈出第一個
    popMole();
  }

  /**
   * 打地鼠！
   */
  whack(event) {
    // 防作弊：只接受真實的用戶點擊
    if (!event.isTrusted) {
      console.warn('⚠️ 檢測到非用戶操作，計分無效！');
      return;
    }

    if (!this.isPlaying) return;

    const hole = event.currentTarget;

    // 只能打到彈出的地鼠
    if (!hole.classList.contains('active')) {
      return;
    }

    // 標記為已擊中
    hole.classList.add('hit');
    hole.classList.remove('active');

    // 計分
    this.hits++;
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);

    // 基礎分數
    let points = 10;

    // 連擊獎勵
    if (this.combo >= 5) {
      points += 50;
    } else if (this.combo >= 3) {
      points += 20;
    }

    this.score += points;

    // 更新顯示
    this.updateDisplay();

    // 視覺反饋
    this.showHitFeedback(hole, points);

    // 粒子爆炸效果
    const rect = hole.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    particleEffects.explode(x, y, {
      count: 20,
      colors: ['#FFD93D', '#FF6B6B', '#4ECDC4'],
      minSpeed: 2,
      maxSpeed: 6
    });

    // 連擊特效
    if (this.combo >= 3) {
      particleEffects.starFall(x, y - 30, { count: 5 });
    }

    // 動畫結束後移除 hit 類
    const removeHit = () => {
      hole.classList.remove('hit');
      hole.removeEventListener('transitionend', removeHit);
    };
    hole.addEventListener('transitionend', removeHit);
  }

  /**
   * 顯示擊中反饋
   */
  showHitFeedback(hole, points) {
    // 創建飄分文字
    const scorePopup = document.createElement('div');
    scorePopup.className = 'score-popup';
    scorePopup.textContent = `+${points}`;
    scorePopup.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      font-weight: bold;
      color: #FFD93D;
      pointer-events: none;
      animation: scoreFloat 1s ease-out forwards;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    `;

    hole.appendChild(scorePopup);

    // 1秒後移除
    setTimeout(() => {
      if (scorePopup.parentNode) {
        scorePopup.parentNode.removeChild(scorePopup);
      }
    }, 1000);
  }

  /**
   * 更新顯示
   */
  updateDisplay() {
    this.scoreDisplay.textContent = this.score;
    this.comboDisplay.textContent = this.combo;

    // 連擊高亮
    const comboStat = document.querySelector('.combo-stat');
    if (this.combo >= 3) {
      comboStat.classList.add('combo-active');
    } else {
      comboStat.classList.remove('combo-active');
    }
  }

  /**
   * 遊戲結束
   */
  gameOver() {
    this.isPlaying = false;

    // 清除定時器
    clearInterval(this.gameTimer);
    clearInterval(this.moleTimer);

    // 移除所有地鼠
    this.holes.forEach(hole => {
      hole.classList.remove('active', 'hit');
    });

    // 計算準確率
    const totalAttempts = this.hits + this.misses;
    const accuracy = totalAttempts > 0
      ? Math.round((this.hits / totalAttempts) * 100)
      : 0;

    // 顯示結果
    document.getElementById('wam-final-score').textContent = this.score;
    document.getElementById('wam-hits').textContent = this.hits;
    document.getElementById('wam-max-combo').textContent = this.maxCombo;
    document.getElementById('wam-accuracy').textContent = accuracy;

    // 煙火慶祝
    if (this.score >= 200) {
      particleEffects.fireworkShow(3);
    } else if (this.score >= 100) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      particleEffects.confetti(centerX, centerY - 100, { count: 30 });
    }

    // 顯示彈窗
    setTimeout(() => {
      this.showModal();
    }, 500);

    // 恢復按鈕狀態
    document.getElementById('wam-start').disabled = false;
    document.getElementById('wam-reset').disabled = true;
    document.getElementById('wam-difficulty').disabled = false;
  }

  /**
   * 重置遊戲
   */
  reset() {
    this.isPlaying = false;
    this.score = 0;
    this.timeLeft = 30;
    this.combo = 0;
    this.maxCombo = 0;
    this.hits = 0;
    this.misses = 0;

    // 清除定時器
    clearInterval(this.gameTimer);
    clearInterval(this.moleTimer);

    // 重置顯示
    this.updateDisplay();
    this.timerDisplay.textContent = '30';
    this.timerDisplay.style.color = '';

    // 移除所有地鼠
    this.holes.forEach(hole => {
      hole.classList.remove('active', 'hit');
    });

    // 恢復按鈕狀態
    document.getElementById('wam-start').disabled = false;
    document.getElementById('wam-reset').disabled = true;
  }

  /**
   * 顯示彈窗
   */
  showModal() {
    const modal = document.getElementById('wam-modal');
    modal.style.display = 'flex';
  }

  /**
   * 隱藏彈窗
   */
  hideModal() {
    const modal = document.getElementById('wam-modal');
    modal.style.display = 'none';
  }

  /**
   * 顯示代碼
   */
  showCode() {
    const code = `
// 打地鼠核心代碼示例

// 1. 綁定點擊事件
hole.addEventListener('click', (event) => {
  // 防作弊檢測
  if (!event.isTrusted) {
    console.warn('檢測到非用戶操作！');
    return;
  }

  // 檢查是否擊中
  if (hole.classList.contains('active')) {
    // 加分
    score += 10;
    combo++;

    // 視覺反饋
    hole.classList.add('hit');

    // 粒子爆炸
    particleEffects.explode(x, y);
  }
});

// 2. 定時彈出地鼠
setInterval(() => {
  const randomHole = holes[Math.floor(Math.random() * 9)];
  randomHole.classList.add('active');

  // 自動縮回
  setTimeout(() => {
    randomHole.classList.remove('active');
  }, 1000);
}, 600);

// 3. 動畫結束回調
hole.addEventListener('transitionend', () => {
  hole.classList.remove('hit');
});
    `.trim();

    alert(code);
  }

  /**
   * 銷毀遊戲
   */
  destroy() {
    clearInterval(this.gameTimer);
    clearInterval(this.moleTimer);
    this.container.innerHTML = '';
  }
}
