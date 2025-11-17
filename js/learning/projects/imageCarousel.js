/**
 * 圖片輪播器 (Image Carousel)
 *
 * 學習目標:
 * - CSS transitions 和 transforms
 * - setInterval 和 setTimeout
 * - 鍵盤事件處理 (arrow keys)
 * - 觸控事件 (touch events)
 * - 指示器和縮圖導航
 * - 自動播放控制
 *
 * 使用純 Vanilla JavaScript，無任何框架依賴
 */

export class ImageCarousel {
  constructor(container) {
    this.container = container;

    // 狀態
    this.currentIndex = 0;
    this.isPlaying = true;
    this.autoPlayInterval = null;
    this.transitionDuration = 500; // ms
    this.autoPlayDelay = 3000; // ms
    this.touchStartX = 0;
    this.touchEndX = 0;

    // 示例圖片數據（使用漸變色代替真實圖片）
    this.slides = [
      {
        id: 1,
        title: '美麗的風景 1',
        description: '這是第一張圖片的描述',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        id: 2,
        title: '壯麗的山脈 2',
        description: '這是第二張圖片的描述',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        id: 3,
        title: '寧靜的海洋 3',
        description: '這是第三張圖片的描述',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        id: 4,
        title: '夢幻的森林 4',
        description: '這是第四張圖片的描述',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      },
      {
        id: 5,
        title: '燦爛的夕陽 5',
        description: '這是第五張圖片的描述',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      }
    ];

    this.init();
  }

  /**
   * 初始化輪播器
   */
  init() {
    this.render();
    this.bindEvents();
    this.startAutoPlay();
    this.updateSlide(0, false);
  }

  /**
   * 渲染 UI
   */
  render() {
    this.container.innerHTML = `
      <div class="carousel-app">
        <!-- 應用標題 -->
        <div class="carousel-header">
          <h1 class="carousel-title">🖼️ 圖片輪播器</h1>
          <p class="carousel-subtitle">完整功能的輪播組件 - 支持自動播放、鍵盤導航、觸控滑動</p>
        </div>

        <!-- 主輪播區域 -->
        <div class="carousel-main">
          <!-- 輪播容器 -->
          <div class="carousel-viewport">
            <div class="carousel-track" id="carousel-track">
              ${this.slides.map((slide, index) => `
                <div class="carousel-slide" data-index="${index}">
                  <div class="slide-content" style="background: ${slide.gradient}">
                    <div class="slide-overlay">
                      <h2 class="slide-title">${slide.title}</h2>
                      <p class="slide-description">${slide.description}</p>
                      <div class="slide-number">${index + 1} / ${this.slides.length}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- 前後導航按鈕 -->
            <button class="carousel-nav prev" id="prev-btn" aria-label="上一張">
              ❮
            </button>
            <button class="carousel-nav next" id="next-btn" aria-label="下一張">
              ❯
            </button>

            <!-- 指示器 -->
            <div class="carousel-indicators">
              ${this.slides.map((_, index) => `
                <button
                  class="indicator ${index === 0 ? 'active' : ''}"
                  data-index="${index}"
                  aria-label="跳到第 ${index + 1} 張"
                ></button>
              `).join('')}
            </div>
          </div>

          <!-- 控制面板 -->
          <div class="carousel-controls">
            <button class="control-btn" id="play-pause-btn">
              <span class="control-icon" id="play-icon">⏸</span>
              <span class="control-label">暫停</span>
            </button>

            <div class="speed-control">
              <label for="speed-slider">速度:</label>
              <input
                type="range"
                id="speed-slider"
                min="1000"
                max="5000"
                step="500"
                value="3000"
              />
              <span class="speed-value" id="speed-value">3.0s</span>
            </div>

            <button class="control-btn" id="reset-btn">
              <span class="control-icon">🔄</span>
              <span class="control-label">重置</span>
            </button>
          </div>
        </div>

        <!-- 縮圖導航 -->
        <div class="carousel-thumbnails">
          <h3>縮圖導航</h3>
          <div class="thumbnails-track">
            ${this.slides.map((slide, index) => `
              <div
                class="thumbnail ${index === 0 ? 'active' : ''}"
                data-index="${index}"
              >
                <div class="thumbnail-image" style="background: ${slide.gradient}"></div>
                <div class="thumbnail-label">${index + 1}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 學習提示 -->
        <div class="learning-tips">
          <h3>💡 涉及的技術點</h3>
          <div class="tips-grid">
            <div class="tip-item">
              <strong>CSS Transform:</strong>
              <p>translateX() 實現滑動效果</p>
            </div>
            <div class="tip-item">
              <strong>定時器:</strong>
              <p>setInterval() 自動播放、setTimeout() 延遲</p>
            </div>
            <div class="tip-item">
              <strong>鍵盤事件:</strong>
              <p>ArrowLeft/Right 鍵盤導航</p>
            </div>
            <div class="tip-item">
              <strong>觸控事件:</strong>
              <p>touchstart, touchmove, touchend</p>
            </div>
            <div class="tip-item">
              <strong>事件處理:</strong>
              <p>click, input, keydown</p>
            </div>
            <div class="tip-item">
              <strong>DOM 操作:</strong>
              <p>classList, style, dataset</p>
            </div>
          </div>

          <div class="keyboard-hints">
            <h4>⌨️ 鍵盤快捷鍵</h4>
            <div class="hints-list">
              <span class="hint-item"><kbd>←</kbd> 上一張</span>
              <span class="hint-item"><kbd>→</kbd> 下一張</span>
              <span class="hint-item"><kbd>Space</kbd> 播放/暫停</span>
              <span class="hint-item"><kbd>Home</kbd> 第一張</span>
              <span class="hint-item"><kbd>End</kbd> 最後一張</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 綁定事件
   */
  bindEvents() {
    // 前後導航按鈕
    document.getElementById('prev-btn').addEventListener('click', () => {
      this.prev();
    });

    document.getElementById('next-btn').addEventListener('click', () => {
      this.next();
    });

    // 播放/暫停按鈕
    const playPauseBtn = document.getElementById('play-pause-btn');
    playPauseBtn.addEventListener('click', () => {
      this.togglePlayPause();
    });

    // 重置按鈕
    document.getElementById('reset-btn').addEventListener('click', () => {
      this.reset();
    });

    // 速度滑桿
    const speedSlider = document.getElementById('speed-slider');
    speedSlider.addEventListener('input', (e) => {
      this.autoPlayDelay = parseInt(e.target.value);
      document.getElementById('speed-value').textContent = `${(this.autoPlayDelay / 1000).toFixed(1)}s`;

      // 重啟自動播放以應用新速度
      if (this.isPlaying) {
        this.stopAutoPlay();
        this.startAutoPlay();
      }
    });

    // 指示器點擊
    document.querySelectorAll('.indicator').forEach(indicator => {
      indicator.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.goToSlide(index);
      });
    });

    // 縮圖點擊
    document.querySelectorAll('.thumbnail').forEach(thumbnail => {
      thumbnail.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.goToSlide(index);
      });
    });

    // 鍵盤導航
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.prev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.next();
          break;
        case ' ':
          e.preventDefault();
          this.togglePlayPause();
          break;
        case 'Home':
          e.preventDefault();
          this.goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          this.goToSlide(this.slides.length - 1);
          break;
      }
    });

    // 觸控事件
    const viewport = document.querySelector('.carousel-viewport');

    viewport.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });

    // 滑鼠懸停時暫停自動播放
    viewport.addEventListener('mouseenter', () => {
      if (this.isPlaying) {
        this.stopAutoPlay();
      }
    });

    viewport.addEventListener('mouseleave', () => {
      if (this.isPlaying) {
        this.startAutoPlay();
      }
    });
  }

  /**
   * 處理滑動手勢
   */
  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // 向左滑動，顯示下一張
        this.next();
      } else {
        // 向右滑動，顯示上一張
        this.prev();
      }
    }
  }

  /**
   * 下一張
   */
  next() {
    const nextIndex = (this.currentIndex + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  /**
   * 上一張
   */
  prev() {
    const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }

  /**
   * 跳到指定幻燈片
   */
  goToSlide(index) {
    if (index === this.currentIndex) return;
    this.currentIndex = index;
    this.updateSlide(index, true);
  }

  /**
   * 更新幻燈片顯示
   */
  updateSlide(index, animated = true) {
    const track = document.getElementById('carousel-track');
    const offset = -index * 100;

    // 應用 transform
    if (animated) {
      track.style.transition = `transform ${this.transitionDuration}ms ease-in-out`;
    } else {
      track.style.transition = 'none';
    }

    track.style.transform = `translateX(${offset}%)`;

    // 更新指示器
    document.querySelectorAll('.indicator').forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });

    // 更新縮圖
    document.querySelectorAll('.thumbnail').forEach((thumbnail, i) => {
      thumbnail.classList.toggle('active', i === index);
    });

    // 確保活動縮圖在可視範圍內
    const activeThumbnail = document.querySelector('.thumbnail.active');
    if (activeThumbnail) {
      activeThumbnail.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }

  /**
   * 切換播放/暫停
   */
  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * 播放
   */
  play() {
    this.isPlaying = true;
    this.startAutoPlay();
    this.updatePlayPauseButton();
  }

  /**
   * 暫停
   */
  pause() {
    this.isPlaying = false;
    this.stopAutoPlay();
    this.updatePlayPauseButton();
  }

  /**
   * 更新播放/暫停按鈕
   */
  updatePlayPauseButton() {
    const icon = document.getElementById('play-icon');
    const label = document.querySelector('#play-pause-btn .control-label');

    if (this.isPlaying) {
      icon.textContent = '⏸';
      label.textContent = '暫停';
    } else {
      icon.textContent = '▶';
      label.textContent = '播放';
    }
  }

  /**
   * 開始自動播放
   */
  startAutoPlay() {
    this.stopAutoPlay(); // 先清除現有的定時器
    this.autoPlayInterval = setInterval(() => {
      this.next();
    }, this.autoPlayDelay);
  }

  /**
   * 停止自動播放
   */
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  /**
   * 重置
   */
  reset() {
    this.goToSlide(0);

    // 重置速度
    const speedSlider = document.getElementById('speed-slider');
    speedSlider.value = 3000;
    this.autoPlayDelay = 3000;
    document.getElementById('speed-value').textContent = '3.0s';

    // 重啟自動播放
    if (this.isPlaying) {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }

  /**
   * 銷毀輪播器
   */
  destroy() {
    this.stopAutoPlay();

    // 移除鍵盤事件監聽器
    document.removeEventListener('keydown', this.handleKeydown);

    this.container.innerHTML = '';
  }
}
