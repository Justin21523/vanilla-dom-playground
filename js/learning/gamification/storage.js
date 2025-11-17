/**
 * localStorage 封裝工具
 * 提供統一的數據存儲和讀取接口
 */

const STORAGE_KEYS = {
  ACHIEVEMENTS: 'vdp_achievements',
  PROGRESS: 'vdp_progress',
  LEADERBOARD: 'vdp_leaderboard',
  USER_STATS: 'vdp_user_stats',
  SETTINGS: 'vdp_settings'
};

/**
 * 存儲管理器
 */
export class StorageManager {
  /**
   * 保存數據到 localStorage
   * @param {string} key - 存儲鍵名
   * @param {any} data - 要存儲的數據
   * @returns {boolean} 是否成功
   */
  static save(key, data) {
    try {
      const jsonData = JSON.stringify(data);
      localStorage.setItem(key, jsonData);
      return true;
    } catch (error) {
      console.error(`Failed to save data to localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * 從 localStorage 讀取數據
   * @param {string} key - 存儲鍵名
   * @param {any} defaultValue - 默認值（讀取失敗時返回）
   * @returns {any} 讀取的數據或默認值
   */
  static load(key, defaultValue = null) {
    try {
      const jsonData = localStorage.getItem(key);
      if (jsonData === null) {
        return defaultValue;
      }
      return JSON.parse(jsonData);
    } catch (error) {
      console.error(`Failed to load data from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * 刪除指定鍵的數據
   * @param {string} key - 存儲鍵名
   * @returns {boolean} 是否成功
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove data from localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * 清空所有應用數據
   * @returns {boolean} 是否成功
   */
  static clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  /**
   * 檢查 localStorage 是否可用
   * @returns {boolean} 是否可用
   */
  static isAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error);
      return false;
    }
  }

  /**
   * 獲取存儲使用情況
   * @returns {Object} 使用情況統計
   */
  static getUsageStats() {
    let totalSize = 0;
    const stats = {};

    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const data = localStorage.getItem(key);
      const size = data ? data.length : 0;
      stats[name] = {
        key,
        size,
        sizeKB: (size / 1024).toFixed(2)
      };
      totalSize += size;
    });

    return {
      items: stats,
      totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  }

  /**
   * 導出所有數據為 JSON
   * @returns {string} JSON 字符串
   */
  static exportData() {
    const exportData = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const data = this.load(key);
      if (data !== null) {
        exportData[name] = data;
      }
    });
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 從 JSON 導入數據
   * @param {string} jsonData - JSON 數據字符串
   * @returns {boolean} 是否成功
   */
  static importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      Object.entries(data).forEach(([name, value]) => {
        const key = STORAGE_KEYS[name];
        if (key) {
          this.save(key, value);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

/**
 * 成就數據管理器
 */
export class AchievementStorage {
  /**
   * 保存成就數據
   * @param {Array} achievements - 成就列表
   */
  static save(achievements) {
    return StorageManager.save(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }

  /**
   * 讀取成就數據
   * @returns {Array} 成就列表
   */
  static load() {
    return StorageManager.load(STORAGE_KEYS.ACHIEVEMENTS, []);
  }

  /**
   * 更新單個成就
   * @param {string} achievementId - 成就ID
   * @param {Object} updates - 更新內容
   */
  static updateAchievement(achievementId, updates) {
    const achievements = this.load();
    const index = achievements.findIndex(a => a.id === achievementId);

    if (index !== -1) {
      achievements[index] = { ...achievements[index], ...updates };
      this.save(achievements);
      return true;
    }
    return false;
  }

  /**
   * 解鎖成就
   * @param {string} achievementId - 成就ID
   */
  static unlockAchievement(achievementId) {
    return this.updateAchievement(achievementId, {
      unlocked: true,
      unlockedAt: Date.now()
    });
  }
}

/**
 * 進度數據管理器
 */
export class ProgressStorage {
  /**
   * 獲取默認進度數據
   */
  static getDefaultProgress() {
    return {
      userId: 'local-user',
      totalPoints: 0,
      achievements: [],
      modules: {},
      stats: {
        gamesCompleted: 0,
        tutorialsCompleted: 0,
        projectsCompleted: 0,
        totalPlayTime: 0,
        totalSessions: 0,
        lastVisit: Date.now(),
        firstVisit: Date.now()
      }
    };
  }

  /**
   * 保存進度數據
   */
  static save(progress) {
    return StorageManager.save(STORAGE_KEYS.PROGRESS, progress);
  }

  /**
   * 讀取進度數據
   */
  static load() {
    return StorageManager.load(STORAGE_KEYS.PROGRESS, this.getDefaultProgress());
  }

  /**
   * 更新模塊進度
   * @param {string} moduleId - 模塊ID
   * @param {Object} moduleData - 模塊數據
   */
  static updateModule(moduleId, moduleData) {
    const progress = this.load();

    if (!progress.modules[moduleId]) {
      progress.modules[moduleId] = {
        completed: false,
        firstCompletedAt: null,
        lastCompletedAt: null,
        playCount: 0,
        bestScore: 0
      };
    }

    progress.modules[moduleId] = {
      ...progress.modules[moduleId],
      ...moduleData,
      playCount: (progress.modules[moduleId].playCount || 0) + 1,
      lastCompletedAt: Date.now()
    };

    // 第一次完成
    if (moduleData.completed && !progress.modules[moduleId].firstCompletedAt) {
      progress.modules[moduleId].firstCompletedAt = Date.now();
    }

    this.save(progress);
    return progress;
  }

  /**
   * 添加成就點數
   */
  static addPoints(points) {
    const progress = this.load();
    progress.totalPoints += points;
    this.save(progress);
    return progress.totalPoints;
  }

  /**
   * 添加已解鎖成就ID
   */
  static addUnlockedAchievement(achievementId) {
    const progress = this.load();
    if (!progress.achievements.includes(achievementId)) {
      progress.achievements.push(achievementId);
      this.save(progress);
    }
  }

  /**
   * 更新統計數據
   */
  static updateStats(stats) {
    const progress = this.load();
    progress.stats = { ...progress.stats, ...stats };
    this.save(progress);
  }
}

/**
 * 排行榜數據管理器
 */
export class LeaderboardStorage {
  /**
   * 保存排行榜數據
   */
  static save(leaderboard) {
    return StorageManager.save(STORAGE_KEYS.LEADERBOARD, leaderboard);
  }

  /**
   * 讀取排行榜數據
   */
  static load() {
    return StorageManager.load(STORAGE_KEYS.LEADERBOARD, []);
  }

  /**
   * 添加分數記錄
   * @param {Object} entry - 分數記錄
   */
  static addEntry(entry) {
    const leaderboard = this.load();
    leaderboard.push({
      ...entry,
      timestamp: Date.now()
    });

    // 按分數排序（降序）
    leaderboard.sort((a, b) => b.points - a.points);

    // 只保留前 100 條記錄
    const trimmed = leaderboard.slice(0, 100);
    this.save(trimmed);
    return trimmed;
  }

  /**
   * 清空排行榜
   */
  static clear() {
    return this.save([]);
  }
}

/**
 * 設置數據管理器
 */
export class SettingsStorage {
  /**
   * 獲取默認設置
   */
  static getDefaultSettings() {
    return {
      sound: true,
      notifications: true,
      theme: 'light',
      language: 'zh-TW'
    };
  }

  /**
   * 保存設置
   */
  static save(settings) {
    return StorageManager.save(STORAGE_KEYS.SETTINGS, settings);
  }

  /**
   * 讀取設置
   */
  static load() {
    return StorageManager.load(STORAGE_KEYS.SETTINGS, this.getDefaultSettings());
  }

  /**
   * 更新單個設置
   */
  static updateSetting(key, value) {
    const settings = this.load();
    settings[key] = value;
    this.save(settings);
  }
}

// 導出存儲鍵常量
export { STORAGE_KEYS };

// 默認導出
export default StorageManager;
