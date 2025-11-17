/**
 * 成就系統核心邏輯
 * 負責追蹤用戶行為、檢查成就條件、解鎖成就
 */

import { AchievementStorage, ProgressStorage } from './storage.js';

/**
 * 成就定義列表
 */
const ACHIEVEMENTS = [
  // ========== 遊戲類成就 ==========
  {
    id: 'first-game',
    category: 'games',
    name: '首次遊戲',
    description: '完成任意一個遊戲模塊',
    icon: '🎮',
    points: 10,
    condition: { type: 'complete-any-game', value: 1 },
    rarity: 'common'
  },
  {
    id: 'whack-a-mole-beginner',
    category: 'games',
    name: '打地鼠新手',
    description: '在打地鼠中得分達到 100',
    icon: '🦫',
    points: 15,
    condition: { type: 'score', target: 'whack-a-mole', value: 100 },
    rarity: 'common'
  },
  {
    id: 'puzzle-complete',
    category: 'games',
    name: '拼圖入門',
    description: '成功完成拖放拼圖',
    icon: '🧩',
    points: 20,
    condition: { type: 'complete', target: 'drag-puzzle', value: 1 },
    rarity: 'common'
  },
  {
    id: 'snake-apprentice',
    category: 'games',
    name: '貪吃蛇學徒',
    description: '在貪吃蛇中得分達到 50',
    icon: '🐍',
    points: 15,
    condition: { type: 'score', target: 'snake-game', value: 50 },
    rarity: 'common'
  },
  {
    id: 'form-expert',
    category: 'games',
    name: '表單專家',
    description: '完成表單驗證大師的所有驗證',
    icon: '📝',
    points: 25,
    condition: { type: 'complete', target: 'form-master', value: 1 },
    rarity: 'rare'
  },
  {
    id: 'music-novice',
    category: 'games',
    name: '音樂新手',
    description: '在音樂按鍵中彈奏一首完整旋律',
    icon: '🎹',
    points: 20,
    condition: { type: 'complete', target: 'music-keys', value: 1 },
    rarity: 'common'
  },
  {
    id: 'game-master',
    category: 'games',
    name: '遊戲達人',
    description: '完成所有 5 個遊戲',
    icon: '🏆',
    points: 50,
    condition: { type: 'complete-all-games', value: 5 },
    rarity: 'rare'
  },
  {
    id: 'whack-a-mole-master',
    category: 'games',
    name: '打地鼠大師',
    description: '在打地鼠中得分達到 200',
    icon: '🦫✨',
    points: 30,
    condition: { type: 'score', target: 'whack-a-mole', value: 200 },
    rarity: 'rare'
  },
  {
    id: 'snake-expert',
    category: 'games',
    name: '貪吃蛇高手',
    description: '在貪吃蛇中得分達到 100',
    icon: '🐍✨',
    points: 35,
    condition: { type: 'score', target: 'snake-game', value: 100 },
    rarity: 'rare'
  },
  {
    id: 'speed-king',
    category: 'games',
    name: '速度之王',
    description: '30 秒內完成拼圖',
    icon: '⚡',
    points: 40,
    condition: { type: 'time', target: 'drag-puzzle', value: 30 },
    rarity: 'epic'
  },

  // ========== 教程類成就 ==========
  {
    id: 'first-tutorial',
    category: 'tutorials',
    name: '事件學徒',
    description: '完成任意一個教程模塊',
    icon: '📚',
    points: 15,
    condition: { type: 'complete-any-tutorial', value: 1 },
    rarity: 'common'
  },
  {
    id: 'propagation-expert',
    category: 'tutorials',
    name: '傳播專家',
    description: '完成事件傳播可視化器',
    icon: '📡',
    points: 20,
    condition: { type: 'complete', target: 'event-propagation', value: 1 },
    rarity: 'common'
  },
  {
    id: 'inspector-master',
    category: 'tutorials',
    name: '偵探高手',
    description: '完成事件對象解析器',
    icon: '🔍',
    points: 20,
    condition: { type: 'complete', target: 'event-inspector', value: 1 },
    rarity: 'common'
  },
  {
    id: 'delegation-master',
    category: 'tutorials',
    name: '委託大師',
    description: '完成事件委託演示器',
    icon: '⚡',
    points: 25,
    condition: { type: 'complete', target: 'event-delegation', value: 1 },
    rarity: 'rare'
  },
  {
    id: 'custom-events-expert',
    category: 'tutorials',
    name: '自定義事件專家',
    description: '完成自定義事件工作坊',
    icon: '🎨',
    points: 30,
    condition: { type: 'complete', target: 'custom-events', value: 1 },
    rarity: 'rare'
  },
  {
    id: 'tutorial-complete',
    category: 'tutorials',
    name: '教程通關',
    description: '完成所有 4 個教程',
    icon: '🎓',
    points: 60,
    condition: { type: 'complete-all-tutorials', value: 4 },
    rarity: 'epic'
  },

  // ========== 項目類成就 ==========
  {
    id: 'first-project',
    category: 'projects',
    name: '項目啟動',
    description: '完成任意一個項目模塊',
    icon: '🚀',
    points: 20,
    condition: { type: 'complete-any-project', value: 1 },
    rarity: 'common'
  },
  {
    id: 'todo-master',
    category: 'projects',
    name: 'TODO 大師',
    description: '完成 TODO List Pro 項目',
    icon: '📋',
    points: 30,
    condition: { type: 'complete', target: 'todo-list', value: 1 },
    rarity: 'rare'
  },
  {
    id: 'carousel-expert',
    category: 'projects',
    name: '輪播專家',
    description: '完成圖片輪播器項目',
    icon: '🖼️',
    points: 30,
    condition: { type: 'complete', target: 'image-carousel', value: 1 },
    rarity: 'rare'
  },
  {
    id: 'dropdown-master',
    category: 'projects',
    name: '菜單大師',
    description: '完成下拉菜單系統項目',
    icon: '🎯',
    points: 35,
    condition: { type: 'complete', target: 'dropdown-menu', value: 1 },
    rarity: 'epic'
  },
  {
    id: 'project-complete',
    category: 'projects',
    name: '項目全通',
    description: '完成所有 3 個項目',
    icon: '💎',
    points: 70,
    condition: { type: 'complete-all-projects', value: 3 },
    rarity: 'epic'
  },

  // ========== 綜合成就 ==========
  {
    id: 'beginner',
    category: 'overall',
    name: '初學者',
    description: '總點數達到 50',
    icon: '🌟',
    points: 0,
    condition: { type: 'points', value: 50 },
    rarity: 'common'
  },
  {
    id: 'intermediate',
    category: 'overall',
    name: '進階學習者',
    description: '總點數達到 150',
    icon: '🌟🌟',
    points: 0,
    condition: { type: 'points', value: 150 },
    rarity: 'rare'
  },
  {
    id: 'advanced',
    category: 'overall',
    name: '專家',
    description: '總點數達到 300',
    icon: '🌟🌟🌟',
    points: 0,
    condition: { type: 'points', value: 300 },
    rarity: 'epic'
  },
  {
    id: 'dom-master',
    category: 'overall',
    name: 'DOM 大師',
    description: '完成所有 12 個模塊',
    icon: '👑',
    points: 100,
    condition: { type: 'complete-all-modules', value: 12 },
    rarity: 'legendary'
  },
  {
    id: 'perfectionist',
    category: 'overall',
    name: '完美主義者',
    description: '解鎖所有成就',
    icon: '💯',
    points: 150,
    condition: { type: 'all-achievements', value: 30 },
    rarity: 'legendary'
  },
  {
    id: 'consecutive-learner',
    category: 'overall',
    name: '連續學習',
    description: '連續 3 天訪問學習中心',
    icon: '🔥',
    points: 25,
    condition: { type: 'consecutive-days', value: 3 },
    rarity: 'rare'
  },
  {
    id: 'night-owl',
    category: 'overall',
    name: '夜貓子',
    description: '在凌晨 0:00-6:00 完成任意模塊',
    icon: '🦉',
    points: 15,
    condition: { type: 'night-completion', value: 1 },
    rarity: 'common'
  },
  {
    id: 'speed-challenge',
    category: 'overall',
    name: '速度挑戰',
    description: '一天內完成 5 個模塊',
    icon: '⚡⚡',
    points: 50,
    condition: { type: 'daily-complete', value: 5 },
    rarity: 'epic'
  },
  {
    id: 'explorer',
    category: 'overall',
    name: '探索者',
    description: '訪問所有 12 個模塊（不需完成）',
    icon: '🔭',
    points: 20,
    condition: { type: 'visit-all-modules', value: 12 },
    rarity: 'common'
  }
];

/**
 * 成就系統類
 */
export class AchievementSystem {
  constructor() {
    this.achievements = [];
    this.progress = null;
    this.listeners = [];
    this.initialized = false;
  }

  /**
   * 初始化成就系統
   */
  init() {
    if (this.initialized) {
      return;
    }

    // 載入或初始化成就數據
    let savedAchievements = AchievementStorage.load();

    if (savedAchievements.length === 0) {
      // 首次運行，初始化成就
      this.achievements = ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: false,
        unlockedAt: null
      }));
      AchievementStorage.save(this.achievements);
    } else {
      // 合併新增的成就
      this.achievements = this.mergeAchievements(savedAchievements, ACHIEVEMENTS);
      AchievementStorage.save(this.achievements);
    }

    // 載入進度數據
    this.progress = ProgressStorage.load();

    this.initialized = true;
    console.log('✅ Achievement System initialized', {
      totalAchievements: this.achievements.length,
      unlockedCount: this.achievements.filter(a => a.unlocked).length,
      totalPoints: this.progress.totalPoints
    });
  }

  /**
   * 合併成就列表（處理新增成就）
   */
  mergeAchievements(saved, definitions) {
    const merged = [...saved];
    const savedIds = new Set(saved.map(a => a.id));

    // 添加新成就
    definitions.forEach(def => {
      if (!savedIds.has(def.id)) {
        merged.push({
          ...def,
          unlocked: false,
          unlockedAt: null
        });
      }
    });

    return merged;
  }

  /**
   * 記錄事件（自動檢查成就）
   * @param {string} eventType - 事件類型
   * @param {Object} data - 事件數據
   */
  trackEvent(eventType, data) {
    if (!this.initialized) {
      this.init();
    }

    console.log('📊 Track Event:', eventType, data);

    // 更新進度數據
    this.updateProgress(eventType, data);

    // 檢查並解鎖成就
    this.checkAchievements();
  }

  /**
   * 更新進度數據
   */
  updateProgress(eventType, data) {
    switch (eventType) {
      case 'module-complete':
        this.handleModuleComplete(data);
        break;
      case 'module-visit':
        this.handleModuleVisit(data);
        break;
      case 'score-achieved':
        this.handleScoreAchieved(data);
        break;
      case 'session-start':
        this.handleSessionStart(data);
        break;
      default:
        console.warn('Unknown event type:', eventType);
    }
  }

  /**
   * 處理模塊完成事件
   */
  handleModuleComplete(data) {
    const { moduleId, category, score, time } = data;

    // 更新模塊數據
    ProgressStorage.updateModule(moduleId, {
      completed: true,
      bestScore: score || 0,
      bestTime: time || 0
    });

    // 更新分類統計
    const stats = {};
    if (category === 'games') stats.gamesCompleted = (this.progress.stats.gamesCompleted || 0) + 1;
    if (category === 'tutorials') stats.tutorialsCompleted = (this.progress.stats.tutorialsCompleted || 0) + 1;
    if (category === 'projects') stats.projectsCompleted = (this.progress.stats.projectsCompleted || 0) + 1;

    ProgressStorage.updateStats(stats);

    // 重新載入進度
    this.progress = ProgressStorage.load();
  }

  /**
   * 處理模塊訪問事件
   */
  handleModuleVisit(data) {
    const { moduleId } = data;

    // 記錄訪問
    const visitedModules = this.progress.visitedModules || [];
    if (!visitedModules.includes(moduleId)) {
      visitedModules.push(moduleId);
      ProgressStorage.updateStats({ visitedModules });
      this.progress = ProgressStorage.load();
    }
  }

  /**
   * 處理分數達成事件
   */
  handleScoreAchieved(data) {
    const { moduleId, score } = data;

    // 更新最高分
    const module = this.progress.modules[moduleId];
    if (!module || score > (module.bestScore || 0)) {
      ProgressStorage.updateModule(moduleId, {
        bestScore: score
      });
      this.progress = ProgressStorage.load();
    }
  }

  /**
   * 處理會話開始事件
   */
  handleSessionStart(data) {
    const stats = {
      totalSessions: (this.progress.stats.totalSessions || 0) + 1,
      lastVisit: Date.now()
    };
    ProgressStorage.updateStats(stats);
    this.progress = ProgressStorage.load();
  }

  /**
   * 檢查並解鎖成就
   */
  checkAchievements() {
    const unlockedAchievements = [];

    this.achievements.forEach(achievement => {
      if (achievement.unlocked) {
        return; // 已解鎖，跳過
      }

      if (this.checkCondition(achievement.condition)) {
        this.unlockAchievement(achievement.id);
        unlockedAchievements.push(achievement);
      }
    });

    return unlockedAchievements;
  }

  /**
   * 檢查成就條件是否滿足
   */
  checkCondition(condition) {
    const { type, target, value } = condition;

    switch (type) {
      case 'complete':
        return this.progress.modules[target]?.completed === true;

      case 'complete-any-game':
        return this.progress.stats.gamesCompleted >= value;

      case 'complete-any-tutorial':
        return this.progress.stats.tutorialsCompleted >= value;

      case 'complete-any-project':
        return this.progress.stats.projectsCompleted >= value;

      case 'complete-all-games':
        return this.progress.stats.gamesCompleted >= value;

      case 'complete-all-tutorials':
        return this.progress.stats.tutorialsCompleted >= value;

      case 'complete-all-projects':
        return this.progress.stats.projectsCompleted >= value;

      case 'complete-all-modules':
        const totalCompleted = (this.progress.stats.gamesCompleted || 0) +
                               (this.progress.stats.tutorialsCompleted || 0) +
                               (this.progress.stats.projectsCompleted || 0);
        return totalCompleted >= value;

      case 'score':
        return (this.progress.modules[target]?.bestScore || 0) >= value;

      case 'time':
        return (this.progress.modules[target]?.bestTime || Infinity) <= value;

      case 'points':
        return this.progress.totalPoints >= value;

      case 'visit-all-modules':
        return (this.progress.visitedModules || []).length >= value;

      case 'all-achievements':
        return this.achievements.filter(a => a.unlocked).length >= value;

      case 'night-completion':
        // 檢查是否有在 0:00-6:00 完成的模塊
        return Object.values(this.progress.modules).some(m => {
          if (!m.completed) return false;
          const hour = new Date(m.lastCompletedAt).getHours();
          return hour >= 0 && hour < 6;
        });

      default:
        console.warn('Unknown condition type:', type);
        return false;
    }
  }

  /**
   * 解鎖成就
   */
  unlockAchievement(achievementId) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked) {
      return false;
    }

    // 標記為已解鎖
    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();

    // 保存成就數據
    AchievementStorage.save(this.achievements);

    // 添加點數
    if (achievement.points > 0) {
      ProgressStorage.addPoints(achievement.points);
      this.progress = ProgressStorage.load();
    }

    // 記錄已解鎖成就
    ProgressStorage.addUnlockedAchievement(achievementId);

    // 觸發事件
    this.emit('achievement-unlocked', achievement);

    console.log('🏆 Achievement Unlocked:', achievement.name, `+${achievement.points} points`);

    return true;
  }

  /**
   * 獲取所有成就
   */
  getAllAchievements() {
    return [...this.achievements];
  }

  /**
   * 獲取已解鎖成就
   */
  getUnlockedAchievements() {
    return this.achievements.filter(a => a.unlocked);
  }

  /**
   * 獲取未解鎖成就
   */
  getLockedAchievements() {
    return this.achievements.filter(a => !a.unlocked);
  }

  /**
   * 按分類獲取成就
   */
  getAchievementsByCategory(category) {
    return this.achievements.filter(a => a.category === category);
  }

  /**
   * 按稀有度獲取成就
   */
  getAchievementsByRarity(rarity) {
    return this.achievements.filter(a => a.rarity === rarity);
  }

  /**
   * 獲取用戶統計
   */
  getUserStats() {
    if (!this.initialized) {
      this.init();
    }

    const totalAchievements = this.achievements.length;
    const unlockedCount = this.achievements.filter(a => a.unlocked).length;
    const completionRate = (unlockedCount / totalAchievements * 100).toFixed(1);

    return {
      totalPoints: this.progress.totalPoints,
      achievements: {
        total: totalAchievements,
        unlocked: unlockedCount,
        locked: totalAchievements - unlockedCount,
        completionRate: parseFloat(completionRate)
      },
      modules: {
        gamesCompleted: this.progress.stats.gamesCompleted || 0,
        tutorialsCompleted: this.progress.stats.tutorialsCompleted || 0,
        projectsCompleted: this.progress.stats.projectsCompleted || 0,
        total: (this.progress.stats.gamesCompleted || 0) +
               (this.progress.stats.tutorialsCompleted || 0) +
               (this.progress.stats.projectsCompleted || 0)
      },
      sessions: this.progress.stats.totalSessions || 0,
      lastVisit: this.progress.stats.lastVisit,
      firstVisit: this.progress.stats.firstVisit
    };
  }

  /**
   * 重置所有進度
   */
  resetProgress() {
    if (confirm('確定要重置所有進度嗎？此操作無法撤銷！')) {
      // 重置成就
      this.achievements = ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: false,
        unlockedAt: null
      }));
      AchievementStorage.save(this.achievements);

      // 重置進度
      this.progress = ProgressStorage.getDefaultProgress();
      ProgressStorage.save(this.progress);

      console.log('🔄 Progress reset');
      this.emit('progress-reset');
      return true;
    }
    return false;
  }

  /**
   * 註冊事件監聽器
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
}

// 創建全局單例
export const achievementSystem = new AchievementSystem();

// 自動初始化
if (typeof window !== 'undefined') {
  window.achievementSystem = achievementSystem;
}

export default AchievementSystem;
