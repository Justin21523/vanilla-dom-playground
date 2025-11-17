/**
 * 成就系統整合助手
 * 提供簡化的 API 用於在學習模塊中整合成就系統
 */

import { achievementSystem } from './achievements.js';
import { AchievementPopup } from './achievementPopup.js';
import { progressTracker } from './progress.js';

/**
 * 整合助手類
 */
class IntegrationHelper {
  constructor() {
    this.popup = null;
    this.initialized = false;
  }

  /**
   * 初始化成就系統（在模塊載入時調用）
   */
  init() {
    if (this.initialized) {
      return;
    }

    // 初始化成就系統
    achievementSystem.init();
    progressTracker.init();

    // 創建成就彈窗
    this.popup = new AchievementPopup({
      position: 'top-right',
      autoHide: true,
      hideDelay: 5000
    });

    // 監聽成就解鎖事件
    achievementSystem.on('achievement-unlocked', (achievement) => {
      this.popup.show(achievement);
      console.log('🏆 Achievement Unlocked:', achievement.name);
    });

    this.initialized = true;
    console.log('✅ Achievement System Integration initialized');
  }

  /**
   * 記錄模塊訪問
   * @param {string} moduleId - 模塊ID
   */
  trackVisit(moduleId) {
    if (!this.initialized) {
      this.init();
    }

    achievementSystem.trackEvent('module-visit', { moduleId });
    progressTracker.visitModule(moduleId);
  }

  /**
   * 記錄模塊完成
   * @param {string} moduleId - 模塊ID
   * @param {string} category - 分類（games/tutorials/projects）
   * @param {Object} data - 完成數據
   */
  trackComplete(moduleId, category, data = {}) {
    if (!this.initialized) {
      this.init();
    }

    const { score, time } = data;

    // 追蹤成就系統事件
    achievementSystem.trackEvent('module-complete', {
      moduleId,
      category,
      score,
      time,
      timestamp: Date.now()
    });

    // 更新進度追蹤
    progressTracker.completeModule(moduleId, { score, time });

    console.log(`✅ Module completed: ${moduleId}`, { score, time });
  }

  /**
   * 記錄分數達成
   * @param {string} moduleId - 模塊ID
   * @param {number} score - 分數
   */
  trackScore(moduleId, score) {
    if (!this.initialized) {
      this.init();
    }

    achievementSystem.trackEvent('score-achieved', {
      moduleId,
      score,
      timestamp: Date.now()
    });
  }

  /**
   * 記錄會話開始
   */
  trackSessionStart() {
    if (!this.initialized) {
      this.init();
    }

    achievementSystem.trackEvent('session-start', {
      timestamp: Date.now()
    });
  }

  /**
   * 獲取用戶統計
   */
  getUserStats() {
    if (!this.initialized) {
      this.init();
    }

    return achievementSystem.getUserStats();
  }

  /**
   * 獲取模塊進度
   */
  getModuleProgress(moduleId) {
    if (!this.initialized) {
      this.init();
    }

    return progressTracker.getModuleProgress(moduleId);
  }
}

/**
 * 創建全局實例
 */
export const integrationHelper = new IntegrationHelper();

/**
 * 快捷函數：記錄模塊訪問
 */
export function trackVisit(moduleId) {
  integrationHelper.trackVisit(moduleId);
}

/**
 * 快捷函數：記錄模塊完成
 */
export function trackComplete(moduleId, category, data = {}) {
  integrationHelper.trackComplete(moduleId, category, data);
}

/**
 * 快捷函數：記錄分數
 */
export function trackScore(moduleId, score) {
  integrationHelper.trackScore(moduleId, score);
}

/**
 * 快捷函數：記錄會話開始
 */
export function trackSessionStart() {
  integrationHelper.trackSessionStart();
}

/**
 * 模塊ID映射（HTML 文件名 -> 模塊ID）
 */
export const MODULE_IDS = {
  // 遊戲
  'game-test.html': 'whack-a-mole',
  'puzzle-test.html': 'drag-puzzle',
  'snake-test.html': 'snake-game',
  'form-test.html': 'form-master',
  'music-test.html': 'music-keys',

  // 教程
  'propagation-test.html': 'event-propagation',
  'inspector-test.html': 'event-inspector',
  'delegation-test.html': 'event-delegation',
  'custom-events-test.html': 'custom-events',

  // 項目
  'todo-test.html': 'todo-list',
  'carousel-test.html': 'image-carousel',
  'dropdown-test.html': 'dropdown-menu'
};

/**
 * 模塊分類映射
 */
export const MODULE_CATEGORIES = {
  'whack-a-mole': 'games',
  'drag-puzzle': 'games',
  'snake-game': 'games',
  'form-master': 'games',
  'music-keys': 'games',

  'event-propagation': 'tutorials',
  'event-inspector': 'tutorials',
  'event-delegation': 'tutorials',
  'custom-events': 'tutorials',

  'todo-list': 'projects',
  'image-carousel': 'projects',
  'dropdown-menu': 'projects'
};

/**
 * 自動檢測當前頁面並追蹤訪問
 */
export function autoTrackPage() {
  const fileName = window.location.pathname.split('/').pop();
  const moduleId = MODULE_IDS[fileName];

  if (moduleId) {
    integrationHelper.trackVisit(moduleId);
    console.log(`📊 Auto-tracked visit: ${moduleId}`);
  }
}

/**
 * 創建成就提示UI（可選）
 * 在頁面上顯示當前模塊的成就提示
 */
export function createAchievementHint(container, moduleId) {
  const category = MODULE_CATEGORIES[moduleId];
  if (!category) return;

  // 獲取與此模塊相關的成就
  const allAchievements = achievementSystem.getAllAchievements();
  const relatedAchievements = allAchievements.filter(a => {
    const condition = a.condition;
    return (
      condition.target === moduleId ||
      (category === 'games' && condition.type.includes('game')) ||
      (category === 'tutorials' && condition.type.includes('tutorial')) ||
      (category === 'projects' && condition.type.includes('project'))
    );
  }).filter(a => !a.unlocked);

  if (relatedAchievements.length === 0) {
    return;
  }

  const containerEl = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!containerEl) return;

  const hintHTML = `
    <div class="achievement-hint-panel" style="
      margin-top: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      color: white;
    ">
      <div style="font-weight: 600; margin-bottom: 10px;">
        🎯 可獲得的成就 (${relatedAchievements.length})
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${relatedAchievements.slice(0, 3).map(a => `
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            font-size: 0.9rem;
          ">
            <span style="font-size: 1.5rem;">${a.icon}</span>
            <div style="flex: 1;">
              <div style="font-weight: 600;">${a.name}</div>
              <div style="font-size: 0.85rem; opacity: 0.9;">${a.description}</div>
            </div>
            <div style="font-weight: 700;">+${a.points}</div>
          </div>
        `).join('')}
        ${relatedAchievements.length > 3 ? `
          <div style="text-align: center; font-size: 0.85rem; opacity: 0.8;">
            還有 ${relatedAchievements.length - 3} 個成就...
          </div>
        ` : ''}
      </div>
    </div>
  `;

  containerEl.insertAdjacentHTML('beforeend', hintHTML);
}

export default integrationHelper;
