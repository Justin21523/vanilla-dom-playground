/**
 * 成就彈窗組件
 * 當成就解鎖時顯示動畫彈窗
 */

/**
 * 稀有度配色
 */
const RARITY_COLORS = {
  common: {
    bg: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
    border: '#7f8c8d',
    glow: 'rgba(149, 165, 166, 0.5)'
  },
  rare: {
    bg: 'linear-gradient(135deg, #3498db, #2980b9)',
    border: '#2980b9',
    glow: 'rgba(52, 152, 219, 0.5)'
  },
  epic: {
    bg: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
    border: '#8e44ad',
    glow: 'rgba(155, 89, 182, 0.5)'
  },
  legendary: {
    bg: 'linear-gradient(135deg, #f39c12, #e67e22)',
    border: '#e67e22',
    glow: 'rgba(243, 156, 18, 0.5)'
  }
};

/**
 * 成就彈窗類
 */
export class AchievementPopup {
  constructor(options = {}) {
    this.options = {
      container: options.container || document.body,
      autoHide: options.autoHide !== false,
      hideDelay: options.hideDelay || 5000,
      sound: options.sound !== false,
      position: options.position || 'top-right', // top-right, top-left, bottom-right, bottom-left, center
      maxQueue: options.maxQueue || 5
    };

    this.queue = [];
    this.isShowing = false;
    this.currentPopup = null;
    this.animationTimer = null;

    this.init();
  }

  /**
   * 初始化彈窗容器
   */
  init() {
    // 創建彈窗容器
    this.container = document.createElement('div');
    this.container.className = 'achievement-popup-container';
    this.container.setAttribute('data-position', this.options.position);

    this.options.container.appendChild(this.container);

    // 注入樣式
    this.injectStyles();
  }

  /**
   * 顯示成就彈窗
   * @param {Object} achievement - 成就對象
   */
  show(achievement) {
    // 添加到隊列
    if (this.queue.length >= this.options.maxQueue) {
      this.queue.shift(); // 移除最舊的
    }
    this.queue.push(achievement);

    // 如果當前沒有顯示，立即顯示
    if (!this.isShowing) {
      this.showNext();
    }
  }

  /**
   * 顯示隊列中的下一個成就
   */
  showNext() {
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const achievement = this.queue.shift();

    // 創建彈窗元素
    const popup = this.createPopup(achievement);
    this.currentPopup = popup;
    this.container.appendChild(popup);

    // 播放音效
    if (this.options.sound) {
      this.playSound(achievement.rarity);
    }

    // 觸發進入動畫
    requestAnimationFrame(() => {
      popup.classList.add('show');
    });

    // 自動隱藏
    if (this.options.autoHide) {
      this.animationTimer = setTimeout(() => {
        this.hide();
      }, this.options.hideDelay);
    }
  }

  /**
   * 創建彈窗 DOM 元素
   */
  createPopup(achievement) {
    const popup = document.createElement('div');
    popup.className = `achievement-popup rarity-${achievement.rarity}`;

    const colors = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;

    popup.innerHTML = `
      <div class="achievement-popup-inner" style="background: ${colors.bg}; border-color: ${colors.border};">
        <div class="achievement-popup-glow" style="box-shadow: 0 0 30px ${colors.glow};"></div>

        <div class="achievement-popup-header">
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-badge">
            <span class="achievement-badge-text">成就解鎖！</span>
          </div>
        </div>

        <div class="achievement-popup-content">
          <h3 class="achievement-name">${achievement.name}</h3>
          <p class="achievement-description">${achievement.description}</p>
          <div class="achievement-footer">
            <span class="achievement-points">+${achievement.points} 點</span>
            <span class="achievement-rarity">${this.getRarityLabel(achievement.rarity)}</span>
          </div>
        </div>

        <button class="achievement-close" aria-label="關閉">×</button>
      </div>
    `;

    // 綁定關閉按鈕
    const closeBtn = popup.querySelector('.achievement-close');
    closeBtn.addEventListener('click', () => this.hide());

    return popup;
  }

  /**
   * 隱藏當前彈窗
   */
  hide() {
    if (!this.currentPopup) return;

    // 清除計時器
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }

    // 觸發退出動畫
    this.currentPopup.classList.remove('show');
    this.currentPopup.classList.add('hide');

    // 動畫結束後移除元素
    setTimeout(() => {
      if (this.currentPopup && this.currentPopup.parentNode) {
        this.currentPopup.parentNode.removeChild(this.currentPopup);
      }
      this.currentPopup = null;

      // 顯示下一個
      this.showNext();
    }, 300);
  }

  /**
   * 獲取稀有度標籤
   */
  getRarityLabel(rarity) {
    const labels = {
      common: '普通',
      rare: '稀有',
      epic: '史詩',
      legendary: '傳說'
    };
    return labels[rarity] || '普通';
  }

  /**
   * 播放音效
   */
  playSound(rarity) {
    // 使用 Web Audio API 生成簡單的提示音
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 根據稀有度設置不同的音調
      const frequencies = {
        common: [523.25, 659.25],      // C5, E5
        rare: [523.25, 659.25, 783.99], // C5, E5, G5
        epic: [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6
        legendary: [523.25, 659.25, 783.99, 1046.50, 1318.51] // C5, E5, G5, C6, E6
      };

      const notes = frequencies[rarity] || frequencies.common;
      let currentTime = audioContext.currentTime;

      notes.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = freq;
        osc.type = 'sine';

        gain.gain.setValueAtTime(0, currentTime);
        gain.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
        gain.gain.linearRampToValueAtTime(0, currentTime + 0.15);

        osc.start(currentTime);
        osc.stop(currentTime + 0.15);

        currentTime += 0.1;
      });
    } catch (error) {
      console.warn('Failed to play achievement sound:', error);
    }
  }

  /**
   * 清空隊列
   */
  clearQueue() {
    this.queue = [];
  }

  /**
   * 銷毀彈窗
   */
  destroy() {
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.queue = [];
    this.isShowing = false;
    this.currentPopup = null;
  }

  /**
   * 注入 CSS 樣式
   */
  injectStyles() {
    if (document.getElementById('achievement-popup-styles')) {
      return; // 已經注入過了
    }

    const style = document.createElement('style');
    style.id = 'achievement-popup-styles';
    style.textContent = `
      /* 成就彈窗容器 */
      .achievement-popup-container {
        position: fixed;
        z-index: 10000;
        pointer-events: none;
      }

      .achievement-popup-container[data-position="top-right"] {
        top: 20px;
        right: 20px;
      }

      .achievement-popup-container[data-position="top-left"] {
        top: 20px;
        left: 20px;
      }

      .achievement-popup-container[data-position="bottom-right"] {
        bottom: 20px;
        right: 20px;
      }

      .achievement-popup-container[data-position="bottom-left"] {
        bottom: 20px;
        left: 20px;
      }

      .achievement-popup-container[data-position="center"] {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      /* 成就彈窗 */
      .achievement-popup {
        pointer-events: auto;
        margin-bottom: 15px;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      .achievement-popup.show {
        opacity: 1;
        transform: translateX(0);
      }

      .achievement-popup.hide {
        opacity: 0;
        transform: translateX(400px) scale(0.8);
      }

      /* 彈窗內容 */
      .achievement-popup-inner {
        position: relative;
        min-width: 320px;
        max-width: 400px;
        padding: 20px;
        border-radius: 12px;
        border: 3px solid;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        50% {
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
        }
      }

      .achievement-popup-glow {
        position: absolute;
        top: -50%;
        left: -50%;
        right: -50%;
        bottom: -50%;
        animation: rotate-glow 4s linear infinite;
        pointer-events: none;
      }

      @keyframes rotate-glow {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      /* 頭部 */
      .achievement-popup-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
        position: relative;
        z-index: 1;
      }

      .achievement-icon {
        font-size: 3.5rem;
        line-height: 1;
        animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      @keyframes bounce-in {
        0% {
          transform: scale(0) rotate(-180deg);
        }
        50% {
          transform: scale(1.2) rotate(10deg);
        }
        100% {
          transform: scale(1) rotate(0deg);
        }
      }

      .achievement-badge {
        flex: 1;
      }

      .achievement-badge-text {
        display: inline-block;
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.95);
        color: #2c3e50;
        font-weight: 700;
        font-size: 0.85rem;
        border-radius: 20px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      /* 內容 */
      .achievement-popup-content {
        position: relative;
        z-index: 1;
      }

      .achievement-name {
        margin: 0 0 8px 0;
        color: white;
        font-size: 1.4rem;
        font-weight: 700;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      }

      .achievement-description {
        margin: 0 0 12px 0;
        color: rgba(255, 255, 255, 0.95);
        font-size: 0.95rem;
        line-height: 1.5;
      }

      .achievement-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.3);
      }

      .achievement-points {
        font-size: 1.1rem;
        font-weight: 700;
        color: #fff;
        background: rgba(0, 0, 0, 0.2);
        padding: 4px 10px;
        border-radius: 12px;
      }

      .achievement-rarity {
        font-size: 0.85rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* 關閉按鈕 */
      .achievement-close {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 1.5rem;
        line-height: 1;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .achievement-close:hover {
        background: rgba(0, 0, 0, 0.5);
        transform: rotate(90deg);
      }

      /* 稀有度特殊效果 */
      .achievement-popup.rarity-legendary .achievement-popup-inner {
        animation: legendary-pulse 1.5s ease-in-out infinite;
      }

      @keyframes legendary-pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.02);
        }
      }

      .achievement-popup.rarity-legendary .achievement-icon {
        animation: legendary-spin 3s linear infinite, bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      @keyframes legendary-spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      /* 響應式設計 */
      @media (max-width: 480px) {
        .achievement-popup-container {
          left: 10px !important;
          right: 10px !important;
          top: 10px !important;
        }

        .achievement-popup-inner {
          min-width: auto;
          max-width: none;
        }

        .achievement-icon {
          font-size: 2.5rem;
        }

        .achievement-name {
          font-size: 1.2rem;
        }
      }
    `;

    document.head.appendChild(style);
  }
}

/**
 * 創建全局彈窗實例
 */
export function createAchievementPopup(options = {}) {
  return new AchievementPopup(options);
}

export default AchievementPopup;
