/**
 * 排行榜系統
 * 顯示和管理用戶排名
 */

import { LeaderboardStorage, ProgressStorage } from './storage.js';

/**
 * 排行榜類
 */
export class Leaderboard {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error('Leaderboard: Container not found');
    }

    this.options = {
      maxEntries: options.maxEntries || 10,
      showCurrentUser: options.showCurrentUser !== false,
      sortBy: options.sortBy || 'points', // points, achievements, time
      title: options.title || '🏆 排行榜'
    };

    this.entries = [];
    this.currentUserEntry = null;

    this.init();
  }

  /**
   * 初始化
   */
  init() {
    this.loadEntries();
    this.render();
  }

  /**
   * 載入排行榜數據
   */
  loadEntries() {
    this.entries = LeaderboardStorage.load();

    // 獲取當前用戶數據
    const progress = ProgressStorage.load();
    this.currentUserEntry = {
      name: '我',
      points: progress.totalPoints,
      achievements: progress.achievements.length,
      timestamp: Date.now(),
      isCurrentUser: true
    };
  }

  /**
   * 添加分數記錄
   */
  addScore(name, points, achievementsCount) {
    const entry = {
      name,
      points,
      achievements: achievementsCount,
      timestamp: Date.now()
    };

    this.entries = LeaderboardStorage.addEntry(entry);
    this.render();
  }

  /**
   * 獲取排行榜（帶排名）
   */
  getLeaderboard(limit = this.options.maxEntries) {
    // 按指定條件排序
    const sorted = [...this.entries].sort((a, b) => {
      if (this.options.sortBy === 'achievements') {
        return b.achievements - a.achievements;
      }
      return b.points - a.points; // 默認按點數排序
    });

    // 添加排名
    return sorted.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }

  /**
   * 獲取當前用戶排名
   */
  getCurrentUserRank() {
    const allEntries = [...this.entries, this.currentUserEntry];
    const sorted = allEntries.sort((a, b) => b.points - a.points);
    const userIndex = sorted.findIndex(e => e.isCurrentUser);
    return userIndex !== -1 ? userIndex + 1 : null;
  }

  /**
   * 渲染排行榜
   */
  render() {
    const leaderboard = this.getLeaderboard();
    const currentUserRank = this.getCurrentUserRank();

    this.container.innerHTML = `
      <div class="leaderboard">
        <div class="leaderboard-header">
          <h3 class="leaderboard-title">${this.options.title}</h3>
          <div class="leaderboard-controls">
            <button class="leaderboard-btn" id="refresh-leaderboard" title="刷新">
              🔄
            </button>
            <button class="leaderboard-btn" id="clear-leaderboard" title="清空">
              🗑️
            </button>
          </div>
        </div>

        ${this.options.showCurrentUser && this.currentUserEntry ? `
          <div class="current-user-card">
            <div class="current-user-info">
              <span class="current-user-label">你的排名</span>
              <span class="current-user-rank">#${currentUserRank || '-'}</span>
            </div>
            <div class="current-user-stats">
              <div class="stat">
                <span class="stat-value">${this.currentUserEntry.points}</span>
                <span class="stat-label">點數</span>
              </div>
              <div class="stat">
                <span class="stat-value">${this.currentUserEntry.achievements}</span>
                <span class="stat-label">成就</span>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="leaderboard-list">
          ${leaderboard.length > 0 ? this.renderEntries(leaderboard) : this.renderEmpty()}
        </div>
      </div>
    `;

    this.bindEvents();
    this.injectStyles();
  }

  /**
   * 渲染排行榜條目
   */
  renderEntries(entries) {
    return entries.map(entry => {
      const medal = this.getMedal(entry.rank);
      const timeAgo = this.getTimeAgo(entry.timestamp);

      return `
        <div class="leaderboard-entry rank-${entry.rank}">
          <div class="entry-rank">
            ${medal ? `<span class="entry-medal">${medal}</span>` : `<span class="entry-rank-number">${entry.rank}</span>`}
          </div>

          <div class="entry-info">
            <div class="entry-name">${this.escapeHtml(entry.name)}</div>
            <div class="entry-time">${timeAgo}</div>
          </div>

          <div class="entry-stats">
            <div class="entry-stat">
              <span class="entry-stat-value">${entry.points}</span>
              <span class="entry-stat-label">點數</span>
            </div>
            <div class="entry-stat">
              <span class="entry-stat-value">${entry.achievements}</span>
              <span class="entry-stat-label">成就</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * 渲染空狀態
   */
  renderEmpty() {
    return `
      <div class="leaderboard-empty">
        <div class="empty-icon">📊</div>
        <div class="empty-text">尚無排行榜數據</div>
        <div class="empty-hint">完成模塊以開始競爭！</div>
      </div>
    `;
  }

  /**
   * 獲取獎牌圖標
   */
  getMedal(rank) {
    const medals = {
      1: '🥇',
      2: '🥈',
      3: '🥉'
    };
    return medals[rank] || null;
  }

  /**
   * 獲取相對時間
   */
  getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} 天前`;
    if (hours > 0) return `${hours} 小時前`;
    if (minutes > 0) return `${minutes} 分鐘前`;
    return '剛剛';
  }

  /**
   * HTML 轉義
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 綁定事件
   */
  bindEvents() {
    // 刷新按鈕
    const refreshBtn = this.container.querySelector('#refresh-leaderboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refresh();
      });
    }

    // 清空按鈕
    const clearBtn = this.container.querySelector('#clear-leaderboard');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clear();
      });
    }
  }

  /**
   * 刷新排行榜
   */
  refresh() {
    this.loadEntries();
    this.render();
  }

  /**
   * 清空排行榜
   */
  clear() {
    if (confirm('確定要清空排行榜嗎？此操作無法撤銷！')) {
      LeaderboardStorage.clear();
      this.entries = [];
      this.render();
    }
  }

  /**
   * 注入樣式
   */
  injectStyles() {
    if (document.getElementById('leaderboard-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'leaderboard-styles';
    style.textContent = `
      .leaderboard {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .leaderboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
        color: white;
      }

      .leaderboard-title {
        margin: 0;
        font-size: 1.3rem;
        font-weight: 600;
      }

      .leaderboard-controls {
        display: flex;
        gap: 8px;
      }

      .leaderboard-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 1rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .leaderboard-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      .current-user-card {
        margin: 20px;
        padding: 15px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px;
        color: white;
      }

      .current-user-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .current-user-label {
        font-size: 0.9rem;
        opacity: 0.9;
      }

      .current-user-rank {
        font-size: 1.5rem;
        font-weight: 700;
      }

      .current-user-stats {
        display: flex;
        gap: 20px;
      }

      .current-user-stats .stat {
        flex: 1;
        text-align: center;
      }

      .stat-value {
        display: block;
        font-size: 1.3rem;
        font-weight: 700;
        margin-bottom: 2px;
      }

      .stat-label {
        display: block;
        font-size: 0.8rem;
        opacity: 0.9;
      }

      .leaderboard-list {
        padding: 20px;
      }

      .leaderboard-entry {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px;
        margin-bottom: 10px;
        background: #f8f9fa;
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      .leaderboard-entry:hover {
        background: #e9ecef;
        transform: translateX(4px);
      }

      .leaderboard-entry.rank-1,
      .leaderboard-entry.rank-2,
      .leaderboard-entry.rank-3 {
        background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%);
        border: 2px solid #f39c12;
      }

      .entry-rank {
        width: 40px;
        text-align: center;
      }

      .entry-medal {
        font-size: 1.8rem;
        line-height: 1;
      }

      .entry-rank-number {
        display: inline-block;
        width: 32px;
        height: 32px;
        line-height: 32px;
        background: #95a5a6;
        color: white;
        font-weight: 700;
        border-radius: 50%;
        font-size: 0.9rem;
      }

      .entry-info {
        flex: 1;
      }

      .entry-name {
        font-size: 1rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 2px;
      }

      .entry-time {
        font-size: 0.8rem;
        color: #7f8c8d;
      }

      .entry-stats {
        display: flex;
        gap: 15px;
      }

      .entry-stat {
        text-align: center;
        min-width: 50px;
      }

      .entry-stat-value {
        display: block;
        font-size: 1.1rem;
        font-weight: 700;
        color: #2c3e50;
      }

      .entry-stat-label {
        display: block;
        font-size: 0.7rem;
        color: #95a5a6;
        text-transform: uppercase;
      }

      .leaderboard-empty {
        text-align: center;
        padding: 40px 20px;
      }

      .empty-icon {
        font-size: 4rem;
        margin-bottom: 15px;
        opacity: 0.3;
      }

      .empty-text {
        font-size: 1.1rem;
        color: #7f8c8d;
        margin-bottom: 8px;
      }

      .empty-hint {
        font-size: 0.9rem;
        color: #95a5a6;
      }

      @media (max-width: 768px) {
        .entry-stats {
          flex-direction: column;
          gap: 5px;
        }

        .entry-stat {
          min-width: auto;
        }
      }
    `;

    document.head.appendChild(style);
  }
}

/**
 * 創建全局排行榜實例
 */
export function createLeaderboard(container, options) {
  return new Leaderboard(container, options);
}

export default Leaderboard;
