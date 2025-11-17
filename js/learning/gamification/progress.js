/**
 * 進度追蹤系統
 * 管理和顯示學習進度
 */

import { ProgressStorage } from './storage.js';
import { ProgressRing } from './progressRing.js';

/**
 * 模塊定義
 */
const MODULES = {
  games: [
    { id: 'whack-a-mole', name: '打地鼠', icon: '🦫' },
    { id: 'drag-puzzle', name: '拖放拼圖', icon: '🧩' },
    { id: 'snake-game', name: '貪吃蛇', icon: '🐍' },
    { id: 'form-master', name: '表單驗證大師', icon: '📝' },
    { id: 'music-keys', name: '音樂按鍵', icon: '🎹' }
  ],
  tutorials: [
    { id: 'event-propagation', name: '事件傳播可視化器', icon: '📡' },
    { id: 'event-inspector', name: '事件對象解析器', icon: '🔍' },
    { id: 'event-delegation', name: '事件委託演示器', icon: '⚡' },
    { id: 'custom-events', name: '自定義事件工作坊', icon: '🎨' }
  ],
  projects: [
    { id: 'todo-list', name: 'TODO List Pro', icon: '📋' },
    { id: 'image-carousel', name: '圖片輪播器', icon: '🖼️' },
    { id: 'dropdown-menu', name: '下拉菜單系統', icon: '🎯' }
  ]
};

/**
 * 進度追蹤器類
 */
export class ProgressTracker {
  constructor() {
    this.progress = null;
    this.rings = {};
    this.listeners = [];
  }

  /**
   * 初始化
   */
  init() {
    this.progress = ProgressStorage.load();
    console.log('✅ Progress Tracker initialized', this.progress);
  }

  /**
   * 記錄模塊完成
   * @param {string} moduleId - 模塊ID
   * @param {Object} data - 完成數據（score, time 等）
   */
  completeModule(moduleId, data = {}) {
    const { score, time } = data;

    // 更新進度數據
    const updatedProgress = ProgressStorage.updateModule(moduleId, {
      completed: true,
      bestScore: score || 0,
      bestTime: time || 0
    });

    this.progress = updatedProgress;

    // 觸發事件
    this.emit('module-completed', { moduleId, data });

    console.log(`📊 Module completed: ${moduleId}`, data);

    return updatedProgress;
  }

  /**
   * 記錄模塊訪問
   */
  visitModule(moduleId) {
    const visitedModules = this.progress.visitedModules || [];
    if (!visitedModules.includes(moduleId)) {
      visitedModules.push(moduleId);
      ProgressStorage.updateStats({ visitedModules });
      this.progress = ProgressStorage.load();
      this.emit('module-visited', { moduleId });
    }
  }

  /**
   * 獲取模塊進度
   */
  getModuleProgress(moduleId) {
    return this.progress.modules[moduleId] || {
      completed: false,
      playCount: 0,
      bestScore: 0,
      bestTime: 0
    };
  }

  /**
   * 獲取總體進度百分比
   */
  getOverallProgress() {
    const totalModules = this.getTotalModulesCount();
    const completedCount = this.getCompletedModulesCount();
    return totalModules > 0 ? (completedCount / totalModules * 100) : 0;
  }

  /**
   * 獲取分類進度
   */
  getCategoryProgress(category) {
    const categoryModules = MODULES[category] || [];
    const completedCount = categoryModules.filter(m =>
      this.progress.modules[m.id]?.completed
    ).length;

    return {
      total: categoryModules.length,
      completed: completedCount,
      percentage: categoryModules.length > 0
        ? (completedCount / categoryModules.length * 100)
        : 0
    };
  }

  /**
   * 獲取所有分類進度
   */
  getAllCategoriesProgress() {
    return {
      games: this.getCategoryProgress('games'),
      tutorials: this.getCategoryProgress('tutorials'),
      projects: this.getCategoryProgress('projects')
    };
  }

  /**
   * 獲取已完成模塊數量
   */
  getCompletedModulesCount() {
    return Object.values(this.progress.modules).filter(m => m.completed).length;
  }

  /**
   * 獲取總模塊數量
   */
  getTotalModulesCount() {
    return MODULES.games.length + MODULES.tutorials.length + MODULES.projects.length;
  }

  /**
   * 獲取統計數據
   */
  getStats() {
    return {
      ...this.progress.stats,
      totalPoints: this.progress.totalPoints,
      overallProgress: this.getOverallProgress(),
      categories: this.getAllCategoriesProgress()
    };
  }

  /**
   * 渲染進度面板
   */
  renderProgressPanel(container) {
    const containedElement = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!containedElement) {
      console.error('Progress panel container not found');
      return;
    }

    const stats = this.getStats();
    const overallProgress = this.getOverallProgress();

    containedElement.innerHTML = `
      <div class="progress-panel">
        <div class="progress-panel-header">
          <h3 class="progress-panel-title">📊 學習進度</h3>
        </div>

        <div class="progress-panel-body">
          <!-- 總體進度環形圖 -->
          <div class="progress-overall">
            <div id="overall-progress-ring"></div>
            <div class="progress-stats">
              <div class="stat-item">
                <span class="stat-label">已完成</span>
                <span class="stat-value">${this.getCompletedModulesCount()} / ${this.getTotalModulesCount()}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">總點數</span>
                <span class="stat-value">${stats.totalPoints}</span>
              </div>
            </div>
          </div>

          <!-- 分類進度 -->
          <div class="progress-categories">
            <div class="category-progress">
              <div class="category-header">
                <span class="category-icon">🎮</span>
                <span class="category-name">遊戲</span>
                <span class="category-count">${stats.categories.games.completed} / ${stats.categories.games.total}</span>
              </div>
              <div class="category-bar">
                <div class="category-bar-fill" style="width: ${stats.categories.games.percentage}%;"></div>
              </div>
            </div>

            <div class="category-progress">
              <div class="category-header">
                <span class="category-icon">🎓</span>
                <span class="category-name">教程</span>
                <span class="category-count">${stats.categories.tutorials.completed} / ${stats.categories.tutorials.total}</span>
              </div>
              <div class="category-bar">
                <div class="category-bar-fill" style="width: ${stats.categories.tutorials.percentage}%;"></div>
              </div>
            </div>

            <div class="category-progress">
              <div class="category-header">
                <span class="category-icon">🚀</span>
                <span class="category-name">項目</span>
                <span class="category-count">${stats.categories.projects.completed} / ${stats.categories.projects.total}</span>
              </div>
              <div class="category-bar">
                <div class="category-bar-fill" style="width: ${stats.categories.projects.percentage}%;"></div>
              </div>
            </div>
          </div>

          <!-- 詳細模塊列表 -->
          <div class="progress-modules">
            ${this.renderModulesList()}
          </div>
        </div>
      </div>
    `;

    // 創建環形進度圖
    this.rings.overall = new ProgressRing('#overall-progress-ring', {
      size: 140,
      strokeWidth: 12,
      progress: overallProgress,
      label: '總進度'
    });

    this.injectStyles();
  }

  /**
   * 渲染模塊列表
   */
  renderModulesList() {
    let html = '';

    Object.entries(MODULES).forEach(([category, modules]) => {
      const categoryName = {
        games: '🎮 遊戲',
        tutorials: '🎓 教程',
        projects: '🚀 項目'
      }[category];

      html += `
        <div class="modules-category">
          <h4 class="modules-category-title">${categoryName}</h4>
          <div class="modules-list">
            ${modules.map(module => {
              const progress = this.getModuleProgress(module.id);
              const completed = progress.completed;

              return `
                <div class="module-item ${completed ? 'completed' : ''}">
                  <span class="module-icon">${module.icon}</span>
                  <span class="module-name">${module.name}</span>
                  <span class="module-status">
                    ${completed ? '✓' : '○'}
                  </span>
                  ${progress.playCount > 0 ? `
                    <span class="module-plays">${progress.playCount} 次</span>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    return html;
  }

  /**
   * 更新進度顯示
   */
  updateProgress() {
    const overallProgress = this.getOverallProgress();
    if (this.rings.overall) {
      this.rings.overall.setProgress(overallProgress);
    }
  }

  /**
   * 註冊事件監聽
   */
  on(event, callback) {
    this.listeners.push({ event, callback });
  }

  /**
   * 觸發事件
   */
  emit(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => l.callback(data));
  }

  /**
   * 注入樣式
   */
  injectStyles() {
    if (document.getElementById('progress-tracker-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'progress-tracker-styles';
    style.textContent = `
      .progress-panel {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .progress-panel-header {
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .progress-panel-title {
        margin: 0;
        font-size: 1.3rem;
        font-weight: 600;
      }

      .progress-panel-body {
        padding: 20px;
      }

      .progress-overall {
        display: flex;
        align-items: center;
        gap: 30px;
        margin-bottom: 30px;
        padding-bottom: 30px;
        border-bottom: 2px solid #e9ecef;
      }

      .progress-stats {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .stat-label {
        font-size: 0.95rem;
        color: #7f8c8d;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #2c3e50;
      }

      .progress-categories {
        margin-bottom: 30px;
      }

      .category-progress {
        margin-bottom: 20px;
      }

      .category-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }

      .category-icon {
        font-size: 1.2rem;
      }

      .category-name {
        flex: 1;
        font-weight: 600;
        color: #2c3e50;
      }

      .category-count {
        font-size: 0.9rem;
        color: #7f8c8d;
      }

      .category-bar {
        height: 8px;
        background: #e9ecef;
        border-radius: 4px;
        overflow: hidden;
      }

      .category-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        transition: width 0.5s ease;
      }

      .progress-modules {
        margin-top: 30px;
      }

      .modules-category {
        margin-bottom: 25px;
      }

      .modules-category-title {
        margin: 0 0 12px 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #2c3e50;
      }

      .modules-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .module-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: #f8f9fa;
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      .module-item:hover {
        background: #e9ecef;
        transform: translateX(4px);
      }

      .module-item.completed {
        background: #d4edda;
      }

      .module-icon {
        font-size: 1.2rem;
      }

      .module-name {
        flex: 1;
        font-size: 0.95rem;
        color: #2c3e50;
      }

      .module-status {
        font-size: 1.2rem;
        color: #95a5a6;
      }

      .module-item.completed .module-status {
        color: #27ae60;
      }

      .module-plays {
        font-size: 0.8rem;
        color: #7f8c8d;
        background: rgba(0, 0, 0, 0.05);
        padding: 2px 8px;
        border-radius: 10px;
      }

      @media (max-width: 768px) {
        .progress-overall {
          flex-direction: column;
        }

        .progress-stats {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }
}

/**
 * 創建全局進度追蹤器
 */
export const progressTracker = new ProgressTracker();

export default ProgressTracker;
