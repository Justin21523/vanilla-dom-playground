/**
 * 成就系統自動初始化腳本
 * 在任何學習模塊頁面中引入此腳本即可自動啟用成就系統
 *
 * 使用方式：
 * <script type="module" src="./js/learning/gamification/autoInit.js"></script>
 */

import { integrationHelper, autoTrackPage, MODULE_IDS, MODULE_CATEGORIES } from './integrationHelper.js';

// 自動初始化
integrationHelper.init();

// 自動追蹤頁面訪問
autoTrackPage();

// 記錄會話開始
integrationHelper.trackSessionStart();

// 暴露全局 API
window.achievementAPI = {
  /**
   * 記錄模塊完成
   * @param {string} moduleId - 模塊ID
   * @param {Object} data - 完成數據 { score, time }
   */
  complete: (moduleId, data = {}) => {
    const category = MODULE_CATEGORIES[moduleId];
    if (category) {
      integrationHelper.trackComplete(moduleId, category, data);
    }
  },

  /**
   * 記錄分數達成
   * @param {string} moduleId - 模塊ID
   * @param {number} score - 分數
   */
  score: (moduleId, score) => {
    integrationHelper.trackScore(moduleId, score);
  },

  /**
   * 獲取統計數據
   */
  getStats: () => {
    return integrationHelper.getUserStats();
  },

  /**
   * 獲取模塊進度
   * @param {string} moduleId - 模塊ID
   */
  getProgress: (moduleId) => {
    return integrationHelper.getModuleProgress(moduleId);
  }
};

// 在控制台顯示提示
console.log('🏆 Achievement System Auto-initialized');
console.log('💡 使用 window.achievementAPI 來追蹤成就');
console.log('');
console.log('示例：');
console.log('  achievementAPI.complete("whack-a-mole", { score: 150 })');
console.log('  achievementAPI.score("whack-a-mole", 200)');
console.log('  achievementAPI.getStats()');

// 導出供其他模塊使用
export { integrationHelper };
export default integrationHelper;
