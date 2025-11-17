/**
 * 環形進度圖組件
 * 使用 SVG 繪製動畫環形進度條
 */

/**
 * 環形進度圖類
 */
export class ProgressRing {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error('ProgressRing: Container not found');
    }

    this.options = {
      size: options.size || 120,
      strokeWidth: options.strokeWidth || 10,
      progress: options.progress || 0,
      backgroundColor: options.backgroundColor || '#e9ecef',
      progressColor: options.progressColor || 'url(#gradient)',
      textColor: options.textColor || '#2c3e50',
      showText: options.showText !== false,
      showLabel: options.showLabel !== false,
      label: options.label || '完成度',
      animationDuration: options.animationDuration || 1000,
      gradient: options.gradient || [
        { offset: '0%', color: '#667eea' },
        { offset: '100%', color: '#764ba2' }
      ]
    };

    this.currentProgress = 0;
    this.targetProgress = this.options.progress;
    this.animationFrame = null;

    this.init();
  }

  /**
   * 初始化環形圖
   */
  init() {
    this.render();
    this.setProgress(this.options.progress, false);
  }

  /**
   * 渲染 SVG
   */
  render() {
    const { size, strokeWidth, backgroundColor } = this.options;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    this.container.innerHTML = `
      <div class="progress-ring-wrapper" style="width: ${size}px; height: ${size}px;">
        <svg class="progress-ring-svg" width="${size}" height="${size}">
          <!-- 定義漸變 -->
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              ${this.options.gradient.map(stop =>
                `<stop offset="${stop.offset}" style="stop-color:${stop.color};stop-opacity:1" />`
              ).join('')}
            </linearGradient>

            <!-- 發光效果 -->
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <!-- 背景圓環 -->
          <circle
            class="progress-ring-bg"
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            fill="none"
            stroke="${backgroundColor}"
            stroke-width="${strokeWidth}"
          />

          <!-- 進度圓環 -->
          <circle
            class="progress-ring-progress"
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            fill="none"
            stroke="${this.options.progressColor}"
            stroke-width="${strokeWidth}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference}"
            stroke-linecap="round"
            transform="rotate(-90 ${size / 2} ${size / 2})"
            filter="url(#glow)"
          />
        </svg>

        ${this.options.showText ? `
          <div class="progress-ring-text" style="color: ${this.options.textColor};">
            <div class="progress-ring-percentage">0%</div>
            ${this.options.showLabel ? `<div class="progress-ring-label">${this.options.label}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;

    this.progressCircle = this.container.querySelector('.progress-ring-progress');
    this.textElement = this.container.querySelector('.progress-ring-percentage');
    this.circumference = circumference;

    this.injectStyles();
  }

  /**
   * 設置進度值
   * @param {number} percentage - 進度百分比 (0-100)
   * @param {boolean} animate - 是否動畫
   */
  setProgress(percentage, animate = true) {
    // 限制範圍
    percentage = Math.max(0, Math.min(100, percentage));
    this.targetProgress = percentage;

    if (animate) {
      this.animateProgress(this.currentProgress, percentage);
    } else {
      this.updateProgress(percentage);
      this.currentProgress = percentage;
    }
  }

  /**
   * 更新進度顯示
   */
  updateProgress(percentage) {
    const offset = this.circumference - (percentage / 100) * this.circumference;
    this.progressCircle.style.strokeDashoffset = offset;

    if (this.textElement) {
      this.textElement.textContent = `${Math.round(percentage)}%`;
    }
  }

  /**
   * 動畫更新進度
   */
  animateProgress(from, to) {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const startTime = performance.now();
    const duration = this.options.animationDuration;
    const diff = to - from;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 使用 easeOutCubic 緩動函數
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = from + diff * eased;

      this.updateProgress(currentValue);
      this.currentProgress = currentValue;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.currentProgress = to;
        this.updateProgress(to);
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * 獲取當前進度
   */
  getProgress() {
    return this.currentProgress;
  }

  /**
   * 更新配置
   */
  updateOptions(options) {
    this.options = { ...this.options, ...options };
    this.render();
    this.setProgress(this.targetProgress, false);
  }

  /**
   * 銷毀組件
   */
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * 注入 CSS 樣式
   */
  injectStyles() {
    if (document.getElementById('progress-ring-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'progress-ring-styles';
    style.textContent = `
      .progress-ring-wrapper {
        position: relative;
        display: inline-block;
      }

      .progress-ring-svg {
        display: block;
      }

      .progress-ring-progress {
        transition: stroke-dashoffset 0.3s ease;
      }

      .progress-ring-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        pointer-events: none;
      }

      .progress-ring-percentage {
        font-size: 1.8rem;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 4px;
      }

      .progress-ring-label {
        font-size: 0.75rem;
        font-weight: 500;
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    `;

    document.head.appendChild(style);
  }
}

/**
 * 創建多環進度圖（顯示多個指標）
 */
export class MultiProgressRing {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error('MultiProgressRing: Container not found');
    }

    this.options = {
      size: options.size || 200,
      rings: options.rings || [],
      centerText: options.centerText || null
    };

    this.rings = [];
    this.init();
  }

  /**
   * 初始化多環圖
   */
  init() {
    this.render();
  }

  /**
   * 渲染多環圖
   */
  render() {
    const { size, rings, centerText } = this.options;

    this.container.innerHTML = `
      <div class="multi-progress-ring" style="width: ${size}px; height: ${size}px;">
        <svg width="${size}" height="${size}">
          <defs>
            ${rings.map((ring, index) => {
              const gradient = ring.gradient || [
                { offset: '0%', color: ring.color || '#667eea' },
                { offset: '100%', color: ring.color || '#764ba2' }
              ];
              return `
                <linearGradient id="gradient-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                  ${gradient.map(stop =>
                    `<stop offset="${stop.offset}" style="stop-color:${stop.color};stop-opacity:1" />`
                  ).join('')}
                </linearGradient>
              `;
            }).join('')}
          </defs>

          ${rings.map((ring, index) => {
            const strokeWidth = ring.strokeWidth || 8;
            const gap = ring.gap || 4;
            const radius = (size - strokeWidth) / 2 - index * (strokeWidth + gap);
            const circumference = 2 * Math.PI * radius;

            return `
              <!-- 背景環 ${index} -->
              <circle
                cx="${size / 2}"
                cy="${size / 2}"
                r="${radius}"
                fill="none"
                stroke="#e9ecef"
                stroke-width="${strokeWidth}"
              />

              <!-- 進度環 ${index} -->
              <circle
                class="multi-ring-progress"
                data-ring="${index}"
                cx="${size / 2}"
                cy="${size / 2}"
                r="${radius}"
                fill="none"
                stroke="url(#gradient-${index})"
                stroke-width="${strokeWidth}"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${circumference}"
                stroke-linecap="round"
                transform="rotate(-90 ${size / 2} ${size / 2})"
              />
            `;
          }).join('')}
        </svg>

        ${centerText ? `
          <div class="multi-ring-center-text">
            ${centerText}
          </div>
        ` : ''}
      </div>
    `;

    this.injectStyles();
  }

  /**
   * 設置某個環的進度
   */
  setRingProgress(ringIndex, percentage, animate = true) {
    const ring = this.container.querySelector(`[data-ring="${ringIndex}"]`);
    if (!ring) return;

    percentage = Math.max(0, Math.min(100, percentage));

    const radius = parseFloat(ring.getAttribute('r'));
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    if (animate) {
      ring.style.transition = 'stroke-dashoffset 1s ease';
    } else {
      ring.style.transition = 'none';
    }

    ring.style.strokeDashoffset = offset;
  }

  /**
   * 設置所有環的進度
   */
  setAllProgress(progressArray, animate = true) {
    progressArray.forEach((progress, index) => {
      this.setRingProgress(index, progress, animate);
    });
  }

  /**
   * 注入樣式
   */
  injectStyles() {
    if (document.getElementById('multi-progress-ring-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'multi-progress-ring-styles';
    style.textContent = `
      .multi-progress-ring {
        position: relative;
        display: inline-block;
      }

      .multi-ring-center-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        pointer-events: none;
      }
    `;

    document.head.appendChild(style);
  }
}

export default ProgressRing;
