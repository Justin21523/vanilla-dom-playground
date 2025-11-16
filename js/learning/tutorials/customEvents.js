/**
 * 自定義事件工作坊 (Custom Events Workshop)
 *
 * 學習目標:
 * - 創建和觸發自定義事件
 * - CustomEvent 構造函數和 detail 屬性
 * - dispatchEvent() 方法
 * - 事件通信模式（發布/訂閱）
 * - 組件間通信
 *
 * 使用純 Vanilla JavaScript，無任何框架依賴
 */

export class CustomEvents {
  constructor(container) {
    this.container = container;

    // 狀態
    this.eventLog = [];
    this.maxLogEntries = 15;
    this.components = {
      producer: null,
      consumer: null
    };

    this.init();
  }

  /**
   * 初始化教程
   */
  init() {
    this.render();
    this.bindEvents();
    this.setupComponents();
  }

  /**
   * 渲染 UI
   */
  render() {
    this.container.innerHTML = `
      <div class="custom-events-tutorial">
        <!-- 教程標題 -->
        <div class="tutorial-header">
          <h2 class="tutorial-title">🎨 自定義事件工作坊</h2>
          <p class="tutorial-subtitle">創建和使用自定義事件實現組件通信</p>
        </div>

        <div class="tutorial-content">
          <!-- 左側：事件創建器 -->
          <div class="left-panel">
            <h3>📤 事件發送器</h3>

            <!-- 快速測試 -->
            <div class="quick-test">
              <h4>快速測試</h4>
              <button class="test-btn quick" id="quick-greet">👋 發送問候</button>
              <button class="test-btn quick" id="quick-notify">📢 發送通知</button>
              <button class="test-btn quick" id="quick-update">🔄 發送更新</button>
            </div>

            <!-- 自定義事件創建器 -->
            <div class="event-creator">
              <h4>自定義事件創建器</h4>

              <div class="form-group">
                <label>事件名稱:</label>
                <input
                  type="text"
                  id="event-name"
                  class="form-input"
                  placeholder="例如: userLogin, dataUpdated..."
                  value="myCustomEvent"
                />
              </div>

              <div class="form-group">
                <label>detail 數據 (JSON):</label>
                <textarea
                  id="event-detail"
                  class="form-textarea"
                  rows="4"
                  placeholder='{ "message": "Hello", "value": 123 }'
                >{
  "message": "這是自定義數據",
  "timestamp": ${Date.now()},
  "user": "測試用戶"
}</textarea>
              </div>

              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" id="event-bubbles" checked>
                  <span>bubbles (事件冒泡)</span>
                </label>
                <label>
                  <input type="checkbox" id="event-cancelable" checked>
                  <span>cancelable (可取消)</span>
                </label>
                <label>
                  <input type="checkbox" id="event-composed">
                  <span>composed (穿透 Shadow DOM)</span>
                </label>
              </div>

              <button class="btn btn-primary" id="dispatch-event">
                🚀 觸發自定義事件
              </button>
            </div>

            <!-- 組件 A: 生產者 -->
            <div class="component-demo" id="producer-component">
              <h4>📦 組件 A (生產者)</h4>
              <div class="component-content">
                <div class="product-list">
                  <div class="product-item" data-id="1">
                    <span>📱 產品 A</span>
                    <button class="btn-select">選擇</button>
                  </div>
                  <div class="product-item" data-id="2">
                    <span>💻 產品 B</span>
                    <button class="btn-select">選擇</button>
                  </div>
                  <div class="product-item" data-id="3">
                    <span>⌚ 產品 C</span>
                    <button class="btn-select">選擇</button>
                  </div>
                </div>
                <p class="component-hint">點擊「選擇」發送 productSelected 事件</p>
              </div>
            </div>
          </div>

          <!-- 右側：事件監聽器和日誌 -->
          <div class="right-panel">
            <h3>📥 事件接收器</h3>

            <!-- 監聽器設置 -->
            <div class="listener-setup">
              <h4>監聽器設置</h4>
              <div class="listener-controls">
                <input
                  type="text"
                  id="listen-event-name"
                  class="form-input"
                  placeholder="要監聽的事件名稱..."
                  value="myCustomEvent"
                />
                <button class="btn btn-add" id="add-listener">➕ 添加監聽器</button>
              </div>

              <div class="active-listeners-list">
                <h5>當前監聽器:</h5>
                <div id="listeners-container">
                  <p class="empty-hint">還未添加任何監聽器</p>
                </div>
              </div>
            </div>

            <!-- 組件 B: 消費者 -->
            <div class="component-demo" id="consumer-component">
              <h4>🛒 組件 B (消費者)</h4>
              <div class="component-content">
                <div class="cart-display">
                  <div class="cart-header">購物車</div>
                  <div id="cart-items" class="cart-items">
                    <p class="empty-cart">購物車是空的</p>
                  </div>
                </div>
                <p class="component-hint">監聽 productSelected 事件並添加到購物車</p>
              </div>
            </div>

            <!-- 事件日誌 -->
            <div class="event-log-panel">
              <div class="log-header">
                <h4>📋 事件日誌</h4>
                <button class="btn-small" id="clear-log">清除</button>
              </div>
              <div id="event-log" class="log-container">
                <p class="empty-hint">還沒有事件觸發</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 代碼示例 -->
        <div class="code-examples">
          <h3>💻 代碼示例</h3>
          <div class="code-grid">
            <div class="code-block">
              <h4>1️⃣ 創建自定義事件</h4>
              <pre><code>// 使用 CustomEvent 構造函數
const event = new CustomEvent('userLogin', {
  detail: {
    username: 'alice',
    timestamp: Date.now()
  },
  bubbles: true,      // 事件冒泡
  cancelable: true,   // 可取消
  composed: false     // 不穿透 Shadow DOM
});

// 觸發事件
element.dispatchEvent(event);</code></pre>
            </div>

            <div class="code-block">
              <h4>2️⃣ 監聽自定義事件</h4>
              <pre><code>// 添加事件監聽器
element.addEventListener('userLogin', (e) => {
  // 通過 e.detail 訪問自定義數據
  console.log('用戶:', e.detail.username);
  console.log('時間:', e.detail.timestamp);

  // 可以阻止默認行為（如果 cancelable: true）
  // e.preventDefault();
});</code></pre>
            </div>

            <div class="code-block">
              <h4>3️⃣ 組件間通信</h4>
              <pre><code>// 組件 A: 觸發事件
class ComponentA {
  selectProduct(productId) {
    const event = new CustomEvent('productSelected', {
      detail: { productId },
      bubbles: true
    });
    this.element.dispatchEvent(event);
  }
}

// 組件 B: 監聽事件
class ComponentB {
  init() {
    document.addEventListener('productSelected', (e) => {
      this.addToCart(e.detail.productId);
    });
  }
}</code></pre>
            </div>

            <div class="code-block">
              <h4>4️⃣ Event vs CustomEvent</h4>
              <pre><code>// 標準 Event (無法傳遞數據)
const event1 = new Event('myEvent');

// CustomEvent (可傳遞 detail 數據)
const event2 = new CustomEvent('myEvent', {
  detail: { key: 'value' }  // ✅ 自定義數據
});

// ⚠️ 注意：舊瀏覽器可能不支持
// 可用 document.createEvent() 作為替代</code></pre>
            </div>
          </div>
        </div>

        <!-- 學習要點 -->
        <div class="tutorial-tips">
          <h3>💡 核心概念</h3>
          <div class="tips-grid">
            <div class="tip-card">
              <h4>CustomEvent 構造函數</h4>
              <p><code>new CustomEvent(type, options)</code></p>
              <ul>
                <li><code>type</code> - 事件名稱（字符串）</li>
                <li><code>detail</code> - 自定義數據對象</li>
                <li><code>bubbles</code> - 是否冒泡（默認 false）</li>
                <li><code>cancelable</code> - 是否可取消（默認 false）</li>
                <li><code>composed</code> - 是否穿透 Shadow DOM</li>
              </ul>
            </div>

            <div class="tip-card">
              <h4>使用場景</h4>
              <ul>
                <li>組件間通信（發布/訂閱模式）</li>
                <li>跨層級數據傳遞</li>
                <li>狀態變化通知</li>
                <li>模塊解耦</li>
                <li>自定義 UI 組件事件</li>
              </ul>
            </div>

            <div class="tip-card">
              <h4>最佳實踐</h4>
              <ul>
                <li>事件名稱使用小寫和駝峰式</li>
                <li>避免與原生事件重名</li>
                <li>合理使用 bubbles 選項</li>
                <li>detail 保持簡潔清晰</li>
                <li>在組件銷毀時移除監聽器</li>
              </ul>
            </div>

            <div class="tip-card">
              <h4>注意事項</h4>
              <ul>
                <li>IE9+ 支持 CustomEvent</li>
                <li>detail 數據不要過大</li>
                <li>避免過度使用（考慮回調函數）</li>
                <li>事件名稱要有描述性</li>
                <li>注意內存洩漏（未移除監聽器）</li>
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
    // 快速測試按鈕
    document.getElementById('quick-greet').addEventListener('click', () => {
      this.dispatchQuickEvent('greeting', { message: '你好！👋', sender: '系統' });
    });

    document.getElementById('quick-notify').addEventListener('click', () => {
      this.dispatchQuickEvent('notification', {
        title: '新消息',
        body: '你有一條新通知',
        priority: 'high'
      });
    });

    document.getElementById('quick-update').addEventListener('click', () => {
      this.dispatchQuickEvent('dataUpdate', {
        type: 'refresh',
        count: Math.floor(Math.random() * 100),
        timestamp: Date.now()
      });
    });

    // 自定義事件觸發
    document.getElementById('dispatch-event').addEventListener('click', () => {
      this.dispatchCustomEvent();
    });

    // 添加監聽器
    document.getElementById('add-listener').addEventListener('click', () => {
      this.addCustomListener();
    });

    // 清除日誌
    document.getElementById('clear-log').addEventListener('click', () => {
      this.clearLog();
    });
  }

  /**
   * 設置組件
   */
  setupComponents() {
    // 生產者組件：產品選擇
    const producerButtons = document.querySelectorAll('#producer-component .btn-select');
    producerButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productItem = e.target.closest('.product-item');
        const productId = productItem.dataset.id;
        const productName = productItem.querySelector('span').textContent;

        // 觸發自定義事件
        const event = new CustomEvent('productSelected', {
          detail: { productId, productName },
          bubbles: true
        });

        this.container.dispatchEvent(event);

        // 視覺反饋
        productItem.classList.add('selected');
        setTimeout(() => productItem.classList.remove('selected'), 500);
      });
    });

    // 消費者組件：監聽產品選擇事件
    this.container.addEventListener('productSelected', (e) => {
      this.addToCart(e.detail);
    });

    // 默認添加監聽器
    this.addCustomListener('myCustomEvent');
    this.addCustomListener('productSelected');
  }

  /**
   * 快速觸發事件
   */
  dispatchQuickEvent(eventName, detail) {
    const event = new CustomEvent(eventName, {
      detail: detail,
      bubbles: true,
      cancelable: true
    });

    this.container.dispatchEvent(event);
    this.logEvent(eventName, detail);
  }

  /**
   * 觸發自定義事件
   */
  dispatchCustomEvent() {
    const eventName = document.getElementById('event-name').value.trim();
    const detailText = document.getElementById('event-detail').value.trim();
    const bubbles = document.getElementById('event-bubbles').checked;
    const cancelable = document.getElementById('event-cancelable').checked;
    const composed = document.getElementById('event-composed').checked;

    if (!eventName) {
      alert('請輸入事件名稱');
      return;
    }

    let detail = {};
    try {
      detail = JSON.parse(detailText);
    } catch (e) {
      alert('detail 數據格式錯誤，請檢查 JSON 格式');
      return;
    }

    const event = new CustomEvent(eventName, {
      detail: detail,
      bubbles: bubbles,
      cancelable: cancelable,
      composed: composed
    });

    this.container.dispatchEvent(event);
    this.logEvent(eventName, detail, { bubbles, cancelable, composed });
  }

  /**
   * 添加自定義監聽器
   */
  addCustomListener(eventName = null) {
    const listenEventName = eventName || document.getElementById('listen-event-name').value.trim();

    if (!listenEventName) {
      alert('請輸入要監聽的事件名稱');
      return;
    }

    // 檢查是否已存在
    if (this.hasListener(listenEventName)) {
      alert(`已經在監聽事件: ${listenEventName}`);
      return;
    }

    // 添加監聽器
    const handler = (e) => {
      console.log(`✅ 捕獲到事件: ${listenEventName}`, e.detail);
      this.showEventReceived(listenEventName, e.detail);
    };

    this.container.addEventListener(listenEventName, handler);

    // 保存引用
    if (!this.components.listeners) {
      this.components.listeners = [];
    }

    this.components.listeners.push({ eventName: listenEventName, handler });

    this.updateListenersDisplay();
  }

  /**
   * 檢查是否已有監聽器
   */
  hasListener(eventName) {
    if (!this.components.listeners) return false;
    return this.components.listeners.some(l => l.eventName === eventName);
  }

  /**
   * 更新監聽器顯示
   */
  updateListenersDisplay() {
    const container = document.getElementById('listeners-container');

    if (!this.components.listeners || this.components.listeners.length === 0) {
      container.innerHTML = '<p class="empty-hint">還未添加任何監聽器</p>';
      return;
    }

    container.innerHTML = this.components.listeners.map((listener, index) => `
      <div class="listener-tag">
        <span class="listener-name">📡 ${listener.eventName}</span>
        <button class="btn-remove-listener" data-index="${index}">✕</button>
      </div>
    `).join('');

    // 綁定移除按鈕
    container.querySelectorAll('.btn-remove-listener').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.removeListener(index);
      });
    });
  }

  /**
   * 移除監聽器
   */
  removeListener(index) {
    const listener = this.components.listeners[index];
    this.container.removeEventListener(listener.eventName, listener.handler);
    this.components.listeners.splice(index, 1);
    this.updateListenersDisplay();
  }

  /**
   * 添加到購物車
   */
  addToCart(product) {
    const cartItems = document.getElementById('cart-items');

    // 移除空提示
    const emptyHint = cartItems.querySelector('.empty-cart');
    if (emptyHint) {
      emptyHint.remove();
    }

    // 添加項目
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <span>${product.productName}</span>
      <span class="cart-item-badge">新</span>
    `;

    cartItems.appendChild(item);

    // 動畫
    setTimeout(() => {
      item.querySelector('.cart-item-badge').remove();
    }, 2000);
  }

  /**
   * 顯示事件接收
   */
  showEventReceived(eventName, detail) {
    // 在右側面板顯示接收提示
    const rightPanel = document.querySelector('.right-panel');
    const notification = document.createElement('div');
    notification.className = 'event-notification';
    notification.textContent = `✅ 接收到: ${eventName}`;

    rightPanel.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  /**
   * 記錄事件
   */
  logEvent(eventName, detail, options = {}) {
    const entry = {
      eventName,
      detail,
      options,
      timestamp: new Date().toLocaleTimeString()
    };

    this.eventLog.unshift(entry);

    if (this.eventLog.length > this.maxLogEntries) {
      this.eventLog.pop();
    }

    this.updateLog();
  }

  /**
   * 更新日誌顯示
   */
  updateLog() {
    const logContainer = document.getElementById('event-log');

    if (this.eventLog.length === 0) {
      logContainer.innerHTML = '<p class="empty-hint">還沒有事件觸發</p>';
      return;
    }

    logContainer.innerHTML = this.eventLog.map(entry => `
      <div class="log-entry">
        <div class="log-entry-header">
          <span class="log-event-name">${entry.eventName}</span>
          <span class="log-time">${entry.timestamp}</span>
        </div>
        <div class="log-entry-detail">
          <pre>${JSON.stringify(entry.detail, null, 2)}</pre>
        </div>
      </div>
    `).join('');
  }

  /**
   * 清除日誌
   */
  clearLog() {
    this.eventLog = [];
    this.updateLog();
  }

  /**
   * 銷毀教程
   */
  destroy() {
    // 移除所有自定義監聽器
    if (this.components.listeners) {
      this.components.listeners.forEach(({ eventName, handler }) => {
        this.container.removeEventListener(eventName, handler);
      });
    }

    this.container.innerHTML = '';
  }
}
