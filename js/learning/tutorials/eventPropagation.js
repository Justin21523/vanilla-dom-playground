/**
 * 事件傳播可視化器 (Event Propagation Visualizer)
 *
 * 學習目標:
 * - 理解事件傳播的三個階段：捕獲 → 目標 → 冒泡
 * - addEventListener 第三個參數 (useCapture)
 * - stopPropagation 和 stopImmediatePropagation
 * - event.eventPhase 屬性
 * - event.target vs event.currentTarget
 *
 * 使用純 Vanilla JavaScript，無任何框架依賴
 */

export class EventPropagation {
  constructor(container) {
    this.container = container;

    // 狀態
    this.listeners = [];
    this.eventLog = [];
    this.maxLogEntries = 20;
    this.isAnimating = false;

    // 配置
    this.animationSpeed = 800; // ms per phase

    this.init();
  }

  /**
   * 初始化教程
   */
  init() {
    this.render();
    this.bindEvents();
    this.setupDefaultListeners();
  }

  /**
   * 渲染 UI
   */
  render() {
    this.container.innerHTML = `
      <div class="event-propagation-tutorial">
        <!-- 教程標題 -->
        <div class="tutorial-header">
          <h2 class="tutorial-title">🎯 事件傳播可視化器</h2>
          <p class="tutorial-subtitle">理解捕獲、目標、冒泡三個階段</p>
        </div>

        <div class="tutorial-content">
          <!-- 左側：DOM 樹結構 -->
          <div class="left-panel">
            <h3>DOM 樹結構</h3>
            <div class="dom-tree">
              <div class="dom-node" data-level="0" id="ep-grandparent">
                <div class="node-label">
                  <span class="node-name">👴 祖父元素</span>
                  <span class="node-tag">&lt;div&gt;</span>
                </div>
                <div class="node-listeners" id="listeners-grandparent"></div>

                <div class="dom-node" data-level="1" id="ep-parent">
                  <div class="node-label">
                    <span class="node-name">👨 父元素</span>
                    <span class="node-tag">&lt;div&gt;</span>
                  </div>
                  <div class="node-listeners" id="listeners-parent"></div>

                  <div class="dom-node" data-level="2" id="ep-child">
                    <div class="node-label">
                      <span class="node-name">👶 子元素 (點擊我!)</span>
                      <span class="node-tag">&lt;button&gt;</span>
                    </div>
                    <div class="node-listeners" id="listeners-child"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 階段說明 -->
            <div class="phase-legend">
              <h4>事件傳播階段</h4>
              <div class="legend-item">
                <span class="phase-badge capture">1️⃣ 捕獲階段</span>
                <p>從 window → 目標元素</p>
              </div>
              <div class="legend-item">
                <span class="phase-badge target">2️⃣ 目標階段</span>
                <p>到達目標元素本身</p>
              </div>
              <div class="legend-item">
                <span class="phase-badge bubble">3️⃣ 冒泡階段</span>
                <p>從目標元素 → window</p>
              </div>
            </div>
          </div>

          <!-- 右側：控制面板和日誌 -->
          <div class="right-panel">
            <!-- 監聽器管理 -->
            <div class="listener-controls">
              <h3>添加事件監聽器</h3>
              <div class="control-group">
                <label>元素:</label>
                <select id="ep-element">
                  <option value="grandparent">👴 祖父元素</option>
                  <option value="parent">👨 父元素</option>
                  <option value="child" selected>👶 子元素</option>
                </select>
              </div>
              <div class="control-group">
                <label>階段:</label>
                <select id="ep-phase">
                  <option value="false">冒泡階段 (useCapture: false)</option>
                  <option value="true">捕獲階段 (useCapture: true)</option>
                </select>
              </div>
              <div class="control-group">
                <label>
                  <input type="checkbox" id="ep-stop-propagation">
                  調用 stopPropagation()
                </label>
              </div>
              <div class="control-group">
                <label>
                  <input type="checkbox" id="ep-stop-immediate">
                  調用 stopImmediatePropagation()
                </label>
              </div>
              <button class="btn btn-primary" id="ep-add-listener">
                ➕ 添加監聽器
              </button>
            </div>

            <!-- 當前監聽器列表 -->
            <div class="active-listeners">
              <h3>當前監聽器 <button class="btn-small" id="ep-clear-listeners">清除全部</button></h3>
              <div id="ep-listeners-list" class="listeners-list">
                <p class="empty-state">還沒有添加監聽器</p>
              </div>
            </div>

            <!-- 事件日誌 -->
            <div class="event-log">
              <h3>事件觸發日誌 <button class="btn-small" id="ep-clear-log">清除</button></h3>
              <div id="ep-log" class="log-content">
                <p class="empty-state">點擊子元素以觸發事件</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 學習要點 -->
        <div class="tutorial-tips">
          <h3>💡 核心概念</h3>
          <div class="tips-grid">
            <div class="tip-card">
              <h4>事件傳播順序</h4>
              <p>捕獲階段 (從外到內) → 目標階段 → 冒泡階段 (從內到外)</p>
              <code>window → document → html → body → ... → target → ... → body → html → document → window</code>
            </div>
            <div class="tip-card">
              <h4>addEventListener 第三參數</h4>
              <p><code>addEventListener(type, listener, useCapture)</code></p>
              <p><strong>false (默認)</strong>: 在冒泡階段觸發</p>
              <p><strong>true</strong>: 在捕獲階段觸發</p>
            </div>
            <div class="tip-card">
              <h4>event.target vs currentTarget</h4>
              <p><strong>target</strong>: 觸發事件的元素 (始終是子元素)</p>
              <p><strong>currentTarget</strong>: 當前處理事件的元素 (會變化)</p>
            </div>
            <div class="tip-card">
              <h4>停止傳播</h4>
              <p><code>stopPropagation()</code>: 停止事件繼續傳播</p>
              <p><code>stopImmediatePropagation()</code>: 立即停止，包括當前元素的其他監聽器</p>
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
    // 添加監聽器按鈕
    document.getElementById('ep-add-listener').addEventListener('click', () => {
      this.addListener();
    });

    // 清除監聽器
    document.getElementById('ep-clear-listeners').addEventListener('click', () => {
      this.clearAllListeners();
    });

    // 清除日誌
    document.getElementById('ep-clear-log').addEventListener('click', () => {
      this.clearLog();
    });

    // 點擊子元素觸發事件
    const child = document.getElementById('ep-child');
    child.addEventListener('click', (e) => {
      if (e.target === child || e.target.closest('.node-label')) {
        this.triggerEventFlow(e);
      }
    });
  }

  /**
   * 設置默認監聽器（示例）
   */
  setupDefaultListeners() {
    // 默認添加三個監聽器作為示例
    this.addListenerInternal('child', false, false, false);
    this.addListenerInternal('parent', false, false, false);
    this.addListenerInternal('grandparent', false, false, false);
  }

  /**
   * 添加監聽器
   */
  addListener() {
    const element = document.getElementById('ep-element').value;
    const useCapture = document.getElementById('ep-phase').value === 'true';
    const stopProp = document.getElementById('ep-stop-propagation').checked;
    const stopImmediate = document.getElementById('ep-stop-immediate').checked;

    this.addListenerInternal(element, useCapture, stopProp, stopImmediate);
  }

  /**
   * 內部添加監聽器方法
   */
  addListenerInternal(elementId, useCapture, stopProp, stopImmediate) {
    const element = document.getElementById(`ep-${elementId}`);
    const listenerId = `listener-${Date.now()}-${Math.random()}`;

    const handler = (event) => {
      this.logEvent(event, elementId, useCapture, stopProp, stopImmediate, listenerId);

      if (stopImmediate) {
        event.stopImmediatePropagation();
      } else if (stopProp) {
        event.stopPropagation();
      }
    };

    element.addEventListener('click', handler, useCapture);

    // 記錄監聽器
    this.listeners.push({
      id: listenerId,
      element: elementId,
      elementNode: element,
      handler: handler,
      useCapture: useCapture,
      stopPropagation: stopProp,
      stopImmediatePropagation: stopImmediate
    });

    this.updateListenersDisplay();
  }

  /**
   * 記錄事件
   */
  logEvent(event, elementId, useCapture, stopProp, stopImmediate, listenerId) {
    const phaseNames = ['', '捕獲', '目標', '冒泡'];
    const phaseName = phaseNames[event.eventPhase];

    const logEntry = {
      timestamp: new Date().toLocaleTimeString(),
      element: elementId,
      phase: event.eventPhase,
      phaseName: phaseName,
      target: event.target.id,
      currentTarget: event.currentTarget.id,
      useCapture: useCapture,
      stopPropagation: stopProp,
      stopImmediatePropagation: stopImmediate,
      listenerId: listenerId
    };

    this.eventLog.unshift(logEntry);

    // 限制日誌數量
    if (this.eventLog.length > this.maxLogEntries) {
      this.eventLog.pop();
    }

    this.updateLogDisplay();

    // 高亮當前處理的元素
    this.highlightElement(elementId, event.eventPhase);
  }

  /**
   * 觸發事件流動畫
   */
  triggerEventFlow(event) {
    if (this.isAnimating) return;

    this.isAnimating = true;

    // 清除之前的高亮
    document.querySelectorAll('.dom-node').forEach(node => {
      node.classList.remove('highlight-capture', 'highlight-target', 'highlight-bubble');
    });

    // 動畫演示事件流（簡化版）
    const animateFlow = async () => {
      // 捕獲階段
      await this.animatePhase('grandparent', 'capture');
      await this.sleep(200);
      await this.animatePhase('parent', 'capture');
      await this.sleep(200);

      // 目標階段
      await this.animatePhase('child', 'target');
      await this.sleep(300);

      // 冒泡階段
      await this.animatePhase('parent', 'bubble');
      await this.sleep(200);
      await this.animatePhase('grandparent', 'bubble');

      this.isAnimating = false;
    };

    // 不阻塞實際的事件處理
    setTimeout(() => animateFlow(), 0);
  }

  /**
   * 動畫演示某個階段
   */
  async animatePhase(elementId, phase) {
    const element = document.getElementById(`ep-${elementId}`);
    element.classList.add(`highlight-${phase}`);

    await this.sleep(300);

    element.classList.remove(`highlight-${phase}`);
  }

  /**
   * 高亮元素
   */
  highlightElement(elementId, eventPhase) {
    const element = document.getElementById(`ep-${elementId}`);
    const phaseClass = eventPhase === 1 ? 'capture' : eventPhase === 3 ? 'bubble' : 'target';

    element.classList.add(`flash-${phaseClass}`);

    setTimeout(() => {
      element.classList.remove(`flash-${phaseClass}`);
    }, 500);
  }

  /**
   * 更新監聽器顯示
   */
  updateListenersDisplay() {
    const listElement = document.getElementById('ep-listeners-list');

    if (this.listeners.length === 0) {
      listElement.innerHTML = '<p class="empty-state">還沒有添加監聽器</p>';
      return;
    }

    const elementNames = {
      grandparent: '👴 祖父',
      parent: '👨 父',
      child: '👶 子'
    };

    listElement.innerHTML = this.listeners.map((listener, index) => {
      const phaseText = listener.useCapture ? '捕獲' : '冒泡';
      const stopText = listener.stopImmediatePropagation
        ? 'stopImmediatePropagation'
        : listener.stopPropagation
        ? 'stopPropagation'
        : '無';

      return `
        <div class="listener-item">
          <div class="listener-info">
            <strong>${elementNames[listener.element]}</strong>
            <span class="badge ${listener.useCapture ? 'badge-capture' : 'badge-bubble'}">${phaseText}</span>
            ${stopText !== '無' ? `<span class="badge badge-stop">${stopText}</span>` : ''}
          </div>
          <button class="btn-remove" data-index="${index}">移除</button>
        </div>
      `;
    }).join('');

    // 綁定移除按鈕
    listElement.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.removeListener(index);
      });
    });

    // 更新節點上的監聽器標記
    this.updateNodeListeners();
  }

  /**
   * 更新節點監聽器標記
   */
  updateNodeListeners() {
    // 清除所有標記
    document.querySelectorAll('.node-listeners').forEach(el => {
      el.innerHTML = '';
    });

    // 統計每個元素的監聽器
    const counts = {
      grandparent: { capture: 0, bubble: 0 },
      parent: { capture: 0, bubble: 0 },
      child: { capture: 0, bubble: 0 }
    };

    this.listeners.forEach(listener => {
      const phase = listener.useCapture ? 'capture' : 'bubble';
      counts[listener.element][phase]++;
    });

    // 顯示標記
    Object.keys(counts).forEach(elementId => {
      const container = document.getElementById(`listeners-${elementId}`);
      const { capture, bubble } = counts[elementId];

      if (capture > 0 || bubble > 0) {
        container.innerHTML = `
          ${capture > 0 ? `<span class="listener-badge capture">${capture} 捕獲</span>` : ''}
          ${bubble > 0 ? `<span class="listener-badge bubble">${bubble} 冒泡</span>` : ''}
        `;
      }
    });
  }

  /**
   * 更新日誌顯示
   */
  updateLogDisplay() {
    const logElement = document.getElementById('ep-log');

    if (this.eventLog.length === 0) {
      logElement.innerHTML = '<p class="empty-state">點擊子元素以觸發事件</p>';
      return;
    }

    const elementIcons = {
      'ep-grandparent': '👴',
      'ep-parent': '👨',
      'ep-child': '👶'
    };

    logElement.innerHTML = this.eventLog.map(entry => {
      const phaseClass = entry.phase === 1 ? 'capture' : entry.phase === 3 ? 'bubble' : 'target';
      const icon = elementIcons[entry.currentTarget] || '📌';

      return `
        <div class="log-entry phase-${phaseClass}">
          <span class="log-time">${entry.timestamp}</span>
          <span class="log-icon">${icon}</span>
          <span class="log-element">${entry.element}</span>
          <span class="log-phase">${entry.phaseName}</span>
          ${entry.stopPropagation ? '<span class="badge badge-stop">已停止</span>' : ''}
        </div>
      `;
    }).join('');
  }

  /**
   * 移除監聽器
   */
  removeListener(index) {
    const listener = this.listeners[index];

    if (listener) {
      listener.elementNode.removeEventListener('click', listener.handler, listener.useCapture);
      this.listeners.splice(index, 1);
      this.updateListenersDisplay();
    }
  }

  /**
   * 清除所有監聽器
   */
  clearAllListeners() {
    this.listeners.forEach(listener => {
      listener.elementNode.removeEventListener('click', listener.handler, listener.useCapture);
    });

    this.listeners = [];
    this.updateListenersDisplay();
  }

  /**
   * 清除日誌
   */
  clearLog() {
    this.eventLog = [];
    this.updateLogDisplay();
  }

  /**
   * 延遲輔助函數
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 銷毀教程
   */
  destroy() {
    this.clearAllListeners();
    this.container.innerHTML = '';
  }
}
