/**
 * 音樂按鍵遊戲 (Music Keys)
 *
 * 學習目標:
 * - keydown / keyup - 鍵盤按下和釋放
 * - e.repeat - 檢測長按重複觸發
 * - Web Audio API - 音頻生成和播放
 * - 事件時序 - keydown/keyup 配對使用
 * - 碰撞檢測 - getBoundingClientRect
 *
 * 使用純 Vanilla JavaScript，無任何框架依賴
 * 使用 Web Audio API 生成音符，無需外部音頻文件
 */

import { particleEffects } from '../../ui/particleEffects.js';

export class MusicKeys {
  constructor(container) {
    this.container = container;

    // 音符配置（使用標準音階頻率）
    this.keys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'];
    this.notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    this.frequencies = {
      'C4': 261.63,
      'D4': 293.66,
      'E4': 329.63,
      'F4': 349.23,
      'G4': 392.00,
      'A4': 440.00,
      'B4': 493.88,
      'C5': 523.25
    };

    // 按鍵顏色
    this.keyColors = {
      'a': '#FF6B6B',
      's': '#FFA07A',
      'd': '#FFD93D',
      'f': '#4ECDC4',
      'g': '#45B7D1',
      'h': '#9B59B6',
      'j': '#E74C3C',
      'k': '#3498DB'
    };

    // Web Audio API
    this.audioContext = null;
    this.activeKeys = new Set();
    this.oscillators = new Map();

    // 遊戲狀態
    this.mode = 'free'; // 'free' or 'challenge'
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.hits = 0;
    this.misses = 0;
    this.isPlaying = false;

    // 挑戰模式
    this.fallingNotes = [];
    this.noteSpeed = 2;
    this.spawnInterval = null;
    this.gameLoop = null;

    // 鍵盤事件處理器
    this.handleKeyDown = null;
    this.handleKeyUp = null;

    // DOM 元素
    this.scoreDisplay = null;
    this.comboDisplay = null;

    this.init();
  }

  /**
   * 初始化遊戲
   */
  init() {
    this.initAudioContext();
    this.render();
    this.bindEvents();
  }

  /**
   * 初始化 Web Audio API
   */
  initAudioContext() {
    // AudioContext 需要用戶交互後才能啟動
    const initAudio = () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('✅ Audio Context 已初始化');
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
  }

  /**
   * 渲染遊戲 UI
   */
  render() {
    this.container.innerHTML = `
      <div class="music-keys-game">
        <!-- 遊戲標題 -->
        <div class="game-header">
          <h2 class="game-title">🎹 音樂按鍵</h2>
          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-label">得分</span>
              <span class="stat-value" id="mk-score">0</span>
            </div>
            <div class="stat-item combo-stat">
              <span class="stat-label">連擊</span>
              <span class="stat-value" id="mk-combo">0</span>x
            </div>
            <div class="stat-item">
              <span class="stat-label">準確率</span>
              <span class="stat-value" id="mk-accuracy">100</span>%
            </div>
          </div>
        </div>

        <!-- 遊戲模式提示 -->
        <div class="mode-indicator">
          <span id="mk-mode-text">🎵 自由演奏模式</span>
        </div>

        <!-- 遊戲區域 -->
        <div class="game-canvas">
          <!-- 挑戰模式：音符下落區 -->
          <div class="falling-notes-area" id="mk-falling-area" style="display: none;">
            <div class="hit-zone" id="mk-hit-zone">
              <div class="hit-zone-line"></div>
            </div>
          </div>

          <!-- 鍵盤區域 -->
          <div class="keyboard">
            ${this.createKeyboard()}
          </div>

          <!-- 按鍵說明 -->
          <div class="key-hints">
            <p>按下鍵盤 A-K 演奏音符 🎵</p>
            <p class="key-mapping">
              <kbd>A</kbd>=C <kbd>S</kbd>=D <kbd>D</kbd>=E <kbd>F</kbd>=F
              <kbd>G</kbd>=G <kbd>H</kbd>=A <kbd>J</kbd>=B <kbd>K</kbd>=C
            </p>
          </div>
        </div>

        <!-- 控制面板 -->
        <div class="game-controls">
          <button class="btn btn-primary" id="mk-free" disabled>🎵 自由模式</button>
          <button class="btn btn-secondary" id="mk-challenge">🎯 挑戰模式</button>
          <button class="btn btn-info" id="mk-code">查看代碼</button>
        </div>

        <!-- 學習要點 -->
        <div class="game-tips">
          <h3>💡 學習要點</h3>
          <ul>
            <li><code>keydown</code> - 按鍵按下時播放音符</li>
            <li><code>keyup</code> - 按鍵釋放時停止視覺效果</li>
            <li><code>e.repeat</code> - 檢測長按防止重複觸發</li>
            <li><code>Web Audio API</code> - OscillatorNode 生成音頻</li>
            <li><code>getBoundingClientRect()</code> - 碰撞檢測（挑戰模式）</li>
            <li><code>requestAnimationFrame</code> - 平滑動畫循環</li>
          </ul>
        </div>

        <!-- 遊戲結束彈窗 -->
        <div class="game-over-modal" id="mk-modal" style="display: none;">
          <div class="modal-content">
            <h2>🎉 挑戰結束！</h2>
            <div class="final-stats">
              <p>最終得分: <strong id="mk-final-score">0</strong></p>
              <p>最高連擊: <strong id="mk-final-combo">0</strong>x</p>
              <p>命中率: <strong id="mk-final-accuracy">0</strong>%</p>
              <p>評級: <strong id="mk-final-rating">⭐⭐⭐</strong></p>
            </div>
            <button class="btn btn-primary" id="mk-continue">繼續演奏</button>
          </div>
        </div>
      </div>
    `;

    // 獲取 DOM 元素引用
    this.scoreDisplay = document.getElementById('mk-score');
    this.comboDisplay = document.getElementById('mk-combo');
  }

  /**
   * 創建鍵盤 HTML
   */
  createKeyboard() {
    let html = '';

    this.keys.forEach((key, index) => {
      const note = this.notes[index];
      const color = this.keyColors[key];

      html += `
        <div class="piano-key" data-key="${key}" style="border-top-color: ${color};">
          <div class="key-label">${key.toUpperCase()}</div>
          <div class="note-label">${note}</div>
        </div>
      `;
    });

    return html;
  }

  /**
   * 綁定事件
   */
  bindEvents() {
    // 鍵盤事件
    this.handleKeyDown = (e) => this.onKeyDown(e);
    this.handleKeyUp = (e) => this.onKeyUp(e);

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);

    // 模式切換
    const freeBtn = document.getElementById('mk-free');
    freeBtn.addEventListener('click', () => this.setMode('free'));

    const challengeBtn = document.getElementById('mk-challenge');
    challengeBtn.addEventListener('click', () => this.setMode('challenge'));

    // 查看代碼
    const codeBtn = document.getElementById('mk-code');
    codeBtn.addEventListener('click', () => this.showCode());

    // 繼續按鈕
    const continueBtn = document.getElementById('mk-continue');
    continueBtn.addEventListener('click', () => {
      this.hideModal();
      this.setMode('free');
    });
  }

  /**
   * 處理按鍵按下
   */
  onKeyDown(event) {
    const key = event.key.toLowerCase();

    // 檢查是否是有效按鍵
    if (!this.keys.includes(key)) return;

    // 防止長按重複觸發（重要！）
    if (event.repeat) {
      console.log('⚠️ 檢測到長按重複，已忽略');
      return;
    }

    // 防止默認行為
    event.preventDefault();

    // 播放音符
    this.playNote(key);

    // 挑戰模式：檢查命中
    if (this.mode === 'challenge' && this.isPlaying) {
      this.checkHit(key);
    }
  }

  /**
   * 處理按鍵釋放
   */
  onKeyUp(event) {
    const key = event.key.toLowerCase();

    if (!this.keys.includes(key)) return;

    // 停止視覺效果
    this.stopVisual(key);

    // 停止音符（可選，這裡使用自動衰減）
    // this.stopNote(key);
  }

  /**
   * 播放音符
   */
  playNote(key) {
    if (!this.audioContext) {
      this.initAudioContext();
      return;
    }

    const note = this.notes[this.keys.indexOf(key)];
    const frequency = this.frequencies[note];

    // 創建振盪器（Oscillator）
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // 設置音色（sine = 純音，square = 方波，sawtooth = 鋸齒波）
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // 音量包絡（ADSR）
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5); // Decay + Release

    // 連接節點
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 播放
    oscillator.start(now);
    oscillator.stop(now + 0.5);

    // 視覺反饋
    this.showVisual(key);

    // 粒子效果
    const keyElement = document.querySelector(`[data-key="${key}"]`);
    const rect = keyElement.getBoundingClientRect();
    const color = this.keyColors[key];

    particleEffects.explode(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      {
        count: 10,
        colors: [color],
        minSpeed: 1,
        maxSpeed: 3,
        minSize: 2,
        maxSize: 6
      }
    );
  }

  /**
   * 顯示視覺效果
   */
  showVisual(key) {
    const keyElement = document.querySelector(`[data-key="${key}"]`);
    keyElement.classList.add('active');
    this.activeKeys.add(key);
  }

  /**
   * 停止視覺效果
   */
  stopVisual(key) {
    const keyElement = document.querySelector(`[data-key="${key}"]`);
    keyElement.classList.remove('active');
    this.activeKeys.delete(key);
  }

  /**
   * 設置遊戲模式
   */
  setMode(mode) {
    this.mode = mode;

    const fallingArea = document.getElementById('mk-falling-area');
    const modeText = document.getElementById('mk-mode-text');
    const freeBtn = document.getElementById('mk-free');
    const challengeBtn = document.getElementById('mk-challenge');

    if (mode === 'free') {
      // 自由模式
      this.stopChallenge();
      fallingArea.style.display = 'none';
      modeText.textContent = '🎵 自由演奏模式';
      freeBtn.disabled = true;
      challengeBtn.disabled = false;
      this.resetStats();
    } else {
      // 挑戰模式
      this.startChallenge();
      fallingArea.style.display = 'block';
      modeText.textContent = '🎯 挑戰模式 - 按對應按鍵擊中音符！';
      freeBtn.disabled = false;
      challengeBtn.disabled = true;
    }
  }

  /**
   * 開始挑戰模式
   */
  startChallenge() {
    this.isPlaying = true;
    this.resetStats();

    // 定期生成下落音符
    this.spawnInterval = setInterval(() => {
      this.spawnFallingNote();
    }, 1000);

    // 遊戲循環（更新下落音符位置）
    const animate = () => {
      if (!this.isPlaying) return;

      this.updateFallingNotes();
      this.gameLoop = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * 停止挑戰模式
   */
  stopChallenge() {
    this.isPlaying = false;

    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }

    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }

    // 清除所有下落音符
    this.fallingNotes.forEach(note => {
      if (note.element && note.element.parentNode) {
        note.element.remove();
      }
    });
    this.fallingNotes = [];
  }

  /**
   * 生成下落音符
   */
  spawnFallingNote() {
    const randomKey = this.keys[Math.floor(Math.random() * this.keys.length)];
    const color = this.keyColors[randomKey];
    const note = this.notes[this.keys.indexOf(randomKey)];

    // 創建音符元素
    const noteElement = document.createElement('div');
    noteElement.className = 'falling-note';
    noteElement.dataset.key = randomKey;
    noteElement.style.backgroundColor = color;
    noteElement.textContent = note;

    // 隨機水平位置
    const keyIndex = this.keys.indexOf(randomKey);
    const leftPosition = (keyIndex * 12.5) + 6.25; // 對應鍵盤位置
    noteElement.style.left = leftPosition + '%';

    // 添加到容器
    const container = document.getElementById('mk-falling-area');
    container.appendChild(noteElement);

    // 記錄音符
    this.fallingNotes.push({
      element: noteElement,
      key: randomKey,
      y: 0,
      hit: false
    });
  }

  /**
   * 更新下落音符
   */
  updateFallingNotes() {
    const hitZone = document.getElementById('mk-hit-zone');
    const hitZoneRect = hitZone.getBoundingClientRect();

    for (let i = this.fallingNotes.length - 1; i >= 0; i--) {
      const note = this.fallingNotes[i];

      // 更新位置
      note.y += this.noteSpeed;
      note.element.style.top = note.y + 'px';

      const noteRect = note.element.getBoundingClientRect();

      // 檢查是否超出判定區域（Miss）
      if (noteRect.top > hitZoneRect.bottom + 50 && !note.hit) {
        this.handleMiss();
        note.element.remove();
        this.fallingNotes.splice(i, 1);
      }
      // 檢查是否完全掉出螢幕
      else if (noteRect.top > window.innerHeight) {
        note.element.remove();
        this.fallingNotes.splice(i, 1);
      }
    }
  }

  /**
   * 檢查命中
   */
  checkHit(key) {
    const hitZone = document.getElementById('mk-hit-zone');
    const hitZoneRect = hitZone.getBoundingClientRect();

    // 查找匹配的音符
    for (let i = 0; i < this.fallingNotes.length; i++) {
      const note = this.fallingNotes[i];

      if (note.key === key && !note.hit) {
        const noteRect = note.element.getBoundingClientRect();

        // 判定範圍
        const tolerance = 50;
        const hitCenter = hitZoneRect.top + hitZoneRect.height / 2;
        const noteCenter = noteRect.top + noteRect.height / 2;
        const distance = Math.abs(hitCenter - noteCenter);

        if (distance < tolerance) {
          // 命中！
          this.handleHit(note, distance);
          return;
        }
      }
    }

    // 沒有匹配的音符 = Miss
    // this.handleMiss();
  }

  /**
   * 處理命中
   */
  handleHit(note, distance) {
    note.hit = true;

    // 計算得分（距離越近得分越高）
    const baseScore = 10;
    const bonus = Math.max(0, 10 - Math.floor(distance / 5));
    const points = baseScore + bonus;

    this.score += points;
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.hits++;

    // 移除音符（帶動畫）
    note.element.classList.add('hit');
    setTimeout(() => {
      if (note.element && note.element.parentNode) {
        note.element.remove();
      }
    }, 200);

    const index = this.fallingNotes.indexOf(note);
    if (index > -1) {
      this.fallingNotes.splice(index, 1);
    }

    // 顯示反饋
    this.showHitFeedback(note.element, points, distance);

    // 更新顯示
    this.updateDisplay();

    // 連擊特效
    if (this.combo >= 5) {
      const rect = note.element.getBoundingClientRect();
      particleEffects.starFall(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        { count: 5 }
      );
    }
  }

  /**
   * 處理Miss
   */
  handleMiss() {
    this.combo = 0;
    this.misses++;
    this.updateDisplay();
  }

  /**
   * 顯示命中反饋
   */
  showHitFeedback(noteElement, points, distance) {
    const feedback = document.createElement('div');
    feedback.className = 'hit-feedback';

    // 判定評價
    let rating = 'GOOD';
    if (distance < 15) {
      rating = 'PERFECT!';
      feedback.style.color = '#FFD93D';
    } else if (distance < 30) {
      rating = 'GREAT!';
      feedback.style.color = '#4ECDC4';
    }

    feedback.textContent = `${rating} +${points}`;

    const rect = noteElement.getBoundingClientRect();
    feedback.style.cssText += `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top}px;
      transform: translate(-50%, -50%);
      font-size: 1.5rem;
      font-weight: bold;
      pointer-events: none;
      animation: floatUp 1s ease-out forwards;
      z-index: 1000;
    `;

    document.body.appendChild(feedback);

    setTimeout(() => feedback.remove(), 1000);
  }

  /**
   * 更新顯示
   */
  updateDisplay() {
    this.scoreDisplay.textContent = this.score;
    this.comboDisplay.textContent = this.combo;

    // 連擊高亮
    const comboStat = document.querySelector('.combo-stat');
    if (this.combo >= 5) {
      comboStat.classList.add('combo-active');
    } else {
      comboStat.classList.remove('combo-active');
    }

    // 準確率
    const total = this.hits + this.misses;
    const accuracy = total > 0 ? Math.round((this.hits / total) * 100) : 100;
    document.getElementById('mk-accuracy').textContent = accuracy;
  }

  /**
   * 重置統計
   */
  resetStats() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.hits = 0;
    this.misses = 0;
    this.updateDisplay();
  }

  /**
   * 顯示彈窗
   */
  showModal() {
    const modal = document.getElementById('mk-modal');

    // 計算評級
    const total = this.hits + this.misses;
    const accuracy = total > 0 ? Math.round((this.hits / total) * 100) : 0;

    let rating = '⭐';
    if (accuracy >= 95 && this.maxCombo >= 10) {
      rating = '⭐⭐⭐⭐⭐';
    } else if (accuracy >= 85) {
      rating = '⭐⭐⭐⭐';
    } else if (accuracy >= 70) {
      rating = '⭐⭐⭐';
    } else if (accuracy >= 50) {
      rating = '⭐⭐';
    }

    document.getElementById('mk-final-score').textContent = this.score;
    document.getElementById('mk-final-combo').textContent = this.maxCombo;
    document.getElementById('mk-final-accuracy').textContent = accuracy;
    document.getElementById('mk-final-rating').textContent = rating;

    modal.style.display = 'flex';
  }

  /**
   * 隱藏彈窗
   */
  hideModal() {
    const modal = document.getElementById('mk-modal');
    modal.style.display = 'none';
  }

  /**
   * 顯示代碼
   */
  showCode() {
    const code = `
// 音樂按鍵核心代碼示例

// 1. 鍵盤事件處理
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();

  // 防止長按重複觸發（重要！）
  if (e.repeat) {
    console.log('長按已忽略');
    return;
  }

  if (validKeys.includes(key)) {
    playNote(key);
  }
});

document.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  stopVisual(key);
});

// 2. Web Audio API 生成音符
function playNote(key) {
  const frequency = frequencies[key]; // 例如 440Hz (A4)

  // 創建振盪器
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine'; // 音色
  oscillator.frequency.value = frequency;

  // 音量包絡（淡入淡出）
  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  // 連接並播放
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.5);
}

// 3. 碰撞檢測（挑戰模式）
function checkHit(key) {
  const hitZone = document.getElementById('hit-zone');
  const hitZoneRect = hitZone.getBoundingClientRect();

  for (const note of fallingNotes) {
    if (note.key === key) {
      const noteRect = note.element.getBoundingClientRect();
      const distance = Math.abs(
        hitZoneRect.top - noteRect.top
      );

      if (distance < 50) {
        // 命中！
        score += 10;
        note.element.remove();
        return true;
      }
    }
  }
  return false;
}
    `.trim();

    alert(code);
  }

  /**
   * 銷毀遊戲
   */
  destroy() {
    this.stopChallenge();

    // 移除事件監聽器
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);

    // 關閉 Audio Context
    if (this.audioContext) {
      this.audioContext.close();
    }

    this.container.innerHTML = '';
  }
}
