/**
 * 事件委託演示 (Event Delegation Demo)
 *
 * 學習目標:
 * - 理解事件委託的原理和優勢
 * - 直接綁定 vs 委託綁定的性能對比
 * - 動態元素的事件處理
 * - event.target.matches() 的使用
 * - 實際應用場景
 *
 * 使用純 Vanilla JavaScript，無任何框架依賴
 */

export class EventDelegation {
  constructor(container) {
    this.container = container;

    // 狀態
    this.directListeners = [];
    this.delegatedListener = null;
    this.items = [];
    this.nextItemId = 1;
    this.clickCount = { direct: 0, delegated: 0 };
    this.performanceData = { direct: [], delegated: [] };

    this.init();
  }

  /**
   * 初始化教程
   */
  init() {
    this.render();
    this.bindEvents();
    this.addInitialItems();
  }

  /**
   * 渲染 UI
   */
  render() {
    this.container.innerHTML = `
      <div class="event-delegation-tutorial">
        <!-- 教程標題 -->
        <div class="tutorial-header">
          <h2 class="tutorial-title">🎯 事件委託演示</h2>
          <p class="tutorial-subtitle">比較直接綁定與委託綁定的差異</p>
        </div>

        <div class="tutorial-content">
          <!-- 左側：直接綁定 -->
          <div class="demo-panel">
            <div class="panel-header direct">
              <h3>❌ 直接綁定 (Direct Binding)</h3>
              <p>為每個元素單獨添加監聽器</p>
            </div>

            <div class="controls">
              <button class="btn btn-add" id="add-direct">➕ 添加項目</button>
              <button class="btn btn-remove" id="remove-direct">➖ 移除項目</button>
              <button class="btn btn-clear" id="clear-direct">🗑️ 清空所有</button>
            </div>

            <div class="stats-bar">
              <div class="stat">
                <span class="stat-label">監聽器數量:</span>
                <span class="stat-value" id="direct-listener-count">0</span>
              </div>
              <div class="stat">
                <span class="stat-label">點擊次數:</span>
                <span class="stat-value" id="direct-click-count">0</span>
              </div>
              <div class="stat">
                <span class="stat-label">平均響應時間:</span>
                <span class="stat-value" id="direct-avg-time">0ms</span>
              </div>
            </div>

            <div class="items-container" id="direct-container">
              <!-- 動態項目將插入這裡 -->
            </div>
          </div>

          <!-- 右側：委託綁定 -->
          <div class="demo-panel">
            <div class="panel-header delegated">
              <h3>✅ 委託綁定 (Event Delegation)</h3>
              <p>在父容器上添加單一監聽器</p>
            </div>

            <div class="controls">
              <button class="btn btn-add" id="add-delegated">➕ 添加項目</button>
              <button class="btn btn-remove" id="remove-delegated">➖ 移除項目</button>
              <button class="btn btn-clear" id="clear-delegated">🗑️ 清空所有</button>
            </div>

            <div class="stats-bar">
              <div class="stat">
                <span class="stat-label">監聽器數量:</span>
                <span class="stat-value" id="delegated-listener-count">1</span>
              </div>
              <div class="stat">
                <span class="stat-label">點擊次數:</span>
                <span class="stat-value" id="delegated-click-count">0</span>
              </div>
              <div class="stat">
                <span class="stat-label">平均響應時間:</span>
                <span class="stat-value" id="delegated-avg-time">0ms</span>
              </div>
            </div>

            <div class="items-container" id="delegated-container">
              <!-- 動態項目將插入這裡 -->
            </div>
          </div>
        </div>

        <!-- 性能對比圖 -->
        <div class="performance-comparison">
          <h3>📊 性能對比</h3>
          <div class="comparison-grid">
            <div class="comparison-card">
              <h4>記憶體使用</h4>
              <div class="comparison-bars">
                <div class="bar-group">
                  <span class="bar-label">直接綁定</span>
                  <div class="bar-track">
                    <div class="bar direct" id="memory-direct" style="width: 0%"></div>
                  </div>
                </div>
                <div class="bar-group">
                  <span class="bar-label">委託綁定</span>
                  <div class="bar-track">
                    <div class="bar delegated" id="memory-delegated" style="width: 0%"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="comparison-card">
              <h4>優勢對比</h4>
              <div class="advantages">
                <div class="advantage-item delegated">
                  <strong>✅ 委託綁定優勢:</strong>
                  <ul>
                    <li>記憶體消耗低（只有一個監聽器）</li>
                    <li>自動支持動態添加的元素</li>
                    <li>易於管理和維護</li>
                    <li>減少 DOM 操作開銷</li>
                  </ul>
                </div>
                <div class="advantage-item direct">
                  <strong>❌ 直接綁定劣勢:</strong>
                  <ul>
                    <li>每個元素都需要一個監聽器</li>
                    <li>動態元素需手動綁定</li>
                    <li>大量監聽器影響性能</li>
                    <li>移除元素需手動解綁</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 代碼示例 -->
        <div class="code-examples">
          <h3>💻 代碼示例</h3>
          <div class="code-grid">
            <div class="code-block">
              <h4>❌ 直接綁定</h4>
              <pre><code>// 為每個按鈕單獨添加監聽器
const buttons = document.querySelectorAll('.item-btn');
buttons.forEach(button => {
  button.addEventListener('click', (e) => {
    console.log('點擊了:', e.target);
  });
});

// ⚠️ 問題：
// 1. 新添加的按鈕不會有監聽器
// 2. 100個按鈕 = 100個監聽器
// 3. 需要手動清理監聽器</code></pre>
            </div>

            <div class="code-block">
              <h4>✅ 委託綁定</h4>
              <pre><code>// 在父容器上添加單一監聽器
const container = document.querySelector('.container');
container.addEventListener('click', (e) => {
  // 檢查點擊的是否為目標元素
  if (e.target.matches('.item-btn')) {
    console.log('點擊了:', e.target);
  }
});

// ✅ 優勢：
// 1. 新添加的按鈕自動工作
// 2. 只有1個監聽器
// 3. 自動處理清理</code></pre>
            </div>
          </div>
        </div>

        <!-- 學習要點 -->
        <div class="tutorial-tips">
          <h3>💡 核心概念</h3>
          <div class="tips-grid">
            <div class="tip-card">
              <h4>什麼是事件委託？</h4>
              <p>事件委託是利用事件冒泡的特性，將事件監聽器添加到父元素上，而不是每個子元素上。</p>
              <p>當子元素觸發事件時，事件會冒泡到父元素，父元素的監聽器可以捕獲並處理。</p>
            </div>

            <div class="tip-card">
              <h4>何時使用事件委託？</h4>
              <ul>
                <li>處理大量相似元素（如列表項）</li>
                <li>元素會動態添加/移除</li>
                <li>需要優化性能和記憶體</li>
                <li>簡化事件管理</li>
              </ul>
            </div>

            <div class="tip-card">
              <h4>實現要點</h4>
              <ul>
                <li><code>e.target</code> - 實際被點擊的元素</li>
                <li><code>e.target.matches(selector)</code> - 檢查是否匹配選擇器</li>
                <li><code>e.target.closest(selector)</code> - 找最近的祖先元素</li>
                <li>確保事件會冒泡（大部分事件都會）</li>
              </ul>
            </div>

            <div class="tip-card">
              <h4>注意事項</h4>
              <ul>
                <li>某些事件不冒泡（focus, blur, load 等）</li>
                <li>需要判斷 e.target 是否為目標元素</li>
                <li>避免過度使用（簡單場景直接綁定即可）</li>
                <li>注意 stopPropagation() 會中斷委託</li>
              </ul>
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
    // 直接綁定模式的控制按鈕
    document.getElementById('add-direct').addEventListener('click', () => {
      this.addItem('direct');
    });

    document.getElementById('remove-direct').addEventListener('click', () => {
      this.removeLastItem('direct');
    });

    document.getElementById('clear-direct').addEventListener('click', () => {
      this.clearAllItems('direct');
    });

    // 委託綁定模式的控制按鈕
    document.getElementById('add-delegated').addEventListener('click', () => {
      this.addItem('delegated');
    });

    document.getElementById('remove-delegated').addEventListener('click', () => {
      this.removeLastItem('delegated');
    });

    document.getElementById('clear-delegated').addEventListener('click', () => {
      this.clearAllItems('delegated');
    });

    // 設置委託綁定監聽器（只需要一個）
    this.setupDelegatedListener();
  }

  /**
   * 設置委託綁定監聽器
   */
  setupDelegatedListener() {
    const container = document.getElementById('delegated-container');

    this.delegatedListener = (e) => {
      const startTime = performance.now();

      // 檢查是否點擊了項目按鈕
      if (e.target.matches('.item-action')) {
        const action = e.target.dataset.action;
        const itemId = e.target.closest('.demo-item').dataset.itemId;

        this.handleItemAction(action, itemId, 'delegated');

        // 記錄性能
        const endTime = performance.now();
        const duration = endTime - startTime;
        this.performanceData.delegated.push(duration);
        this.clickCount.delegated++;
        this.updateStats();
      }
    };

    container.addEventListener('click', this.delegatedListener);
  }

  /**
   * 添加初始項目
   */
  addInitialItems() {
    // 添加3個初始項目到兩側
    for (let i = 0; i < 3; i++) {
      this.addItem('direct', false);
      this.addItem('delegated', false);
    }
    this.updateStats();
  }

  /**
   * 添加項目
   */
  addItem(mode, shouldAnimate = true) {
    const itemId = this.nextItemId++;
    const container = document.getElementById(`${mode}-container`);

    const item = document.createElement('div');
    item.className = 'demo-item';
    item.dataset.itemId = itemId;
    if (shouldAnimate) {
      item.classList.add('item-enter');
    }

    item.innerHTML = `
      <div class="item-content">
        <span class="item-icon">📄</span>
        <span class="item-text">項目 #${itemId}</span>
      </div>
      <div class="item-actions">
        <button class="item-action like" data-action="like" title="喜歡">❤️</button>
        <button class="item-action edit" data-action="edit" title="編輯">✏️</button>
        <button class="item-action delete" data-action="delete" title="刪除">🗑️</button>
      </div>
    `;

    container.appendChild(item);

    // 直接綁定模式：為每個按鈕添加監聽器
    if (mode === 'direct') {
      const buttons = item.querySelectorAll('.item-action');
      buttons.forEach(button => {
        const listener = (e) => {
          const startTime = performance.now();

          const action = button.dataset.action;
          this.handleItemAction(action, itemId, 'direct');

          // 記錄性能
          const endTime = performance.now();
          const duration = endTime - startTime;
          this.performanceData.direct.push(duration);
          this.clickCount.direct++;
          this.updateStats();
        };

        button.addEventListener('click', listener);

        // 保存監聽器引用以便後續移除
        this.directListeners.push({ button, listener });
      });
    }

    this.updateStats();
  }

  /**
   * 處理項目操作
   */
  handleItemAction(action, itemId, mode) {
    const containers = document.querySelectorAll('.items-container');
    let item = null;

    // 找到對應的項目
    containers.forEach(container => {
      const found = container.querySelector(`[data-item-id="${itemId}"]`);
      if (found) item = found;
    });

    if (!item) return;

    switch (action) {
      case 'like':
        item.classList.add('item-liked');
        setTimeout(() => item.classList.remove('item-liked'), 600);
        break;

      case 'edit':
        const textSpan = item.querySelector('.item-text');
        const newText = prompt('修改項目名稱:', textSpan.textContent);
        if (newText) {
          textSpan.textContent = newText;
          item.classList.add('item-edited');
          setTimeout(() => item.classList.remove('item-edited'), 600);
        }
        break;

      case 'delete':
        item.classList.add('item-exit');
        setTimeout(() => {
          // 如果是直接綁定模式，需要移除監聽器
          if (mode === 'direct') {
            const buttons = item.querySelectorAll('.item-action');
            buttons.forEach(button => {
              const index = this.directListeners.findIndex(l => l.button === button);
              if (index !== -1) {
                const { listener } = this.directListeners[index];
                button.removeEventListener('click', listener);
                this.directListeners.splice(index, 1);
              }
            });
          }

          item.remove();
          this.updateStats();
        }, 300);
        break;
    }
  }

  /**
   * 移除最後一個項目
   */
  removeLastItem(mode) {
    const container = document.getElementById(`${mode}-container`);
    const items = container.querySelectorAll('.demo-item');

    if (items.length === 0) return;

    const lastItem = items[items.length - 1];
    const itemId = lastItem.dataset.itemId;

    this.handleItemAction('delete', itemId, mode);
  }

  /**
   * 清空所有項目
   */
  clearAllItems(mode) {
    const container = document.getElementById(`${mode}-container`);

    // 直接綁定模式：移除所有監聽器
    if (mode === 'direct') {
      this.directListeners.forEach(({ button, listener }) => {
        button.removeEventListener('click', listener);
      });
      this.directListeners = [];
    }

    container.innerHTML = '';
    this.updateStats();
  }

  /**
   * 更新統計信息
   */
  updateStats() {
    // 更新監聽器數量
    document.getElementById('direct-listener-count').textContent = this.directListeners.length;
    document.getElementById('delegated-listener-count').textContent = '1';

    // 更新點擊次數
    document.getElementById('direct-click-count').textContent = this.clickCount.direct;
    document.getElementById('delegated-click-count').textContent = this.clickCount.delegated;

    // 計算平均響應時間
    const directAvg = this.calculateAverage(this.performanceData.direct);
    const delegatedAvg = this.calculateAverage(this.performanceData.delegated);

    document.getElementById('direct-avg-time').textContent = `${directAvg.toFixed(3)}ms`;
    document.getElementById('delegated-avg-time').textContent = `${delegatedAvg.toFixed(3)}ms`;

    // 更新記憶體對比條
    this.updateMemoryBars();
  }

  /**
   * 計算平均值
   */
  calculateAverage(arr) {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
  }

  /**
   * 更新記憶體對比條
   */
  updateMemoryBars() {
    const directCount = this.directListeners.length;
    const delegatedCount = 1;

    // 假設每個監聽器佔用相同的記憶體
    const maxCount = Math.max(directCount, 1);
    const directPercent = (directCount / maxCount) * 100;
    const delegatedPercent = (delegatedCount / maxCount) * 100;

    document.getElementById('memory-direct').style.width = `${directPercent}%`;
    document.getElementById('memory-delegated').style.width = `${delegatedPercent}%`;

    // 更新條上的文字
    document.getElementById('memory-direct').textContent = `${directCount} 個`;
    document.getElementById('memory-delegated').textContent = `${delegatedCount} 個`;
  }

  /**
   * 銷毀教程
   */
  destroy() {
    // 移除所有直接綁定的監聽器
    this.directListeners.forEach(({ button, listener }) => {
      button.removeEventListener('click', listener);
    });

    // 移除委託監聽器
    const container = document.getElementById('delegated-container');
    if (container && this.delegatedListener) {
      container.removeEventListener('click', this.delegatedListener);
    }

    this.container.innerHTML = '';
  }
}
