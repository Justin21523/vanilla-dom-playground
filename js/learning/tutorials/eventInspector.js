/**
 * 事件對象解析器 (Event Inspector)
 *
 * 學習目標:
 * - 探索 Event 對象的所有屬性和方法
 * - 理解不同事件類型的特有屬性
 * - MouseEvent, KeyboardEvent, InputEvent 等差異
 * - event.preventDefault() 和 event.defaultPrevented
 * - event.isTrusted 屬性
 *
 * 使用純 Vanilla JavaScript，無任何框架依賴
 */

export class EventInspector {
  constructor(container) {
    this.container = container;

    // 狀態
    this.currentEvent = null;
    this.eventHistory = [];
    this.maxHistory = 10;

    // 事件類型配置
    this.eventTypes = {
      mouse: ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseenter', 'mouseleave'],
      keyboard: ['keydown', 'keyup', 'keypress'],
      form: ['input', 'change', 'focus', 'blur', 'submit'],
      other: ['scroll', 'resize', 'contextmenu']
    };

    this.init();
  }

  /**
   * 初始化教程
   */
  init() {
    this.render();
    this.bindEvents();
  }

  /**
   * 渲染 UI
   */
  render() {
    this.container.innerHTML = `
      <div class="event-inspector-tutorial">
        <!-- 教程標題 -->
        <div class="tutorial-header">
          <h2 class="tutorial-title">🔍 事件對象解析器</h2>
          <p class="tutorial-subtitle">深入探索 Event 對象的所有屬性</p>
        </div>

        <div class="tutorial-content">
          <!-- 左側：測試區域 -->
          <div class="left-panel">
            <h3>互動測試區</h3>

            <!-- 滑鼠事件測試 -->
            <div class="test-section">
              <h4>🖱️ 滑鼠事件</h4>
              <div class="test-area mouse-test" id="mouse-area">
                <p>在這裡移動滑鼠、點擊、雙擊、右鍵點擊</p>
                <button id="test-button" class="test-btn">可點擊的按鈕</button>
              </div>
            </div>

            <!-- 鍵盤事件測試 -->
            <div class="test-section">
              <h4>⌨️ 鍵盤事件</h4>
              <input
                type="text"
                id="keyboard-input"
                class="test-input"
                placeholder="在這裡輸入文字..."
              />
            </div>

            <!-- 表單事件測試 -->
            <div class="test-section">
              <h4>📝 表單事件</h4>
              <form id="test-form" class="test-form">
                <input
                  type="email"
                  id="email-input"
                  class="test-input"
                  placeholder="輸入郵箱..."
                  required
                />
                <select id="test-select" class="test-select">
                  <option value="">選擇一個選項</option>
                  <option value="option1">選項 1</option>
                  <option value="option2">選項 2</option>
                  <option value="option3">選項 3</option>
                </select>
                <button type="submit" class="test-btn">提交表單</button>
              </form>
            </div>

            <!-- 捲動事件測試 -->
            <div class="test-section">
              <h4>📜 捲動事件</h4>
              <div id="scroll-area" class="scroll-test">
                <div class="scroll-content">
                  <p>捲動這個區域來觸發 scroll 事件</p>
                  <p>這是一些填充內容...</p>
                  <p>繼續捲動...</p>
                  <p>更多內容...</p>
                  <p>幾乎到底了...</p>
                  <p>已到底部！</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 右側：事件詳情 -->
          <div class="right-panel">
            <!-- 當前事件詳情 -->
            <div class="event-details">
              <h3>當前事件詳情 <span id="event-type-badge" class="type-badge"></span></h3>
              <div id="event-properties" class="properties-grid">
                <p class="empty-state">觸發任何事件以查看詳細信息</p>
              </div>
            </div>

            <!-- 事件歷史 -->
            <div class="event-history">
              <h3>事件歷史 <button class="btn-small" id="clear-history">清除</button></h3>
              <div id="history-list" class="history-list">
                <p class="empty-state">還沒有觸發任何事件</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 學習要點 -->
        <div class="tutorial-tips">
          <h3>💡 事件對象屬性分類</h3>
          <div class="tips-grid">
            <div class="tip-card">
              <h4>通用屬性 (所有事件)</h4>
              <ul>
                <li><code>type</code> - 事件類型名稱</li>
                <li><code>target</code> - 觸發事件的元素</li>
                <li><code>currentTarget</code> - 綁定監聽器的元素</li>
                <li><code>eventPhase</code> - 傳播階段 (1/2/3)</li>
                <li><code>bubbles</code> - 是否冒泡</li>
                <li><code>cancelable</code> - 是否可取消</li>
                <li><code>defaultPrevented</code> - 是否已阻止默認行為</li>
                <li><code>isTrusted</code> - 是否由用戶操作觸發</li>
                <li><code>timeStamp</code> - 事件創建時間戳</li>
              </ul>
            </div>

            <div class="tip-card">
              <h4>MouseEvent 特有屬性</h4>
              <ul>
                <li><code>clientX/clientY</code> - 相對視口座標</li>
                <li><code>pageX/pageY</code> - 相對文檔座標</li>
                <li><code>screenX/screenY</code> - 相對螢幕座標</li>
                <li><code>offsetX/offsetY</code> - 相對目標元素座標</li>
                <li><code>button</code> - 按下的滑鼠按鈕 (0/1/2)</li>
                <li><code>buttons</code> - 當前按下的所有按鈕</li>
                <li><code>ctrlKey/shiftKey/altKey/metaKey</code> - 修飾鍵</li>
                <li><code>relatedTarget</code> - 相關元素</li>
              </ul>
            </div>

            <div class="tip-card">
              <h4>KeyboardEvent 特有屬性</h4>
              <ul>
                <li><code>key</code> - 按鍵字符值 (推薦)</li>
                <li><code>code</code> - 物理按鍵代碼</li>
                <li><code>keyCode</code> - 按鍵代碼 (已廢棄)</li>
                <li><code>charCode</code> - 字符代碼 (已廢棄)</li>
                <li><code>repeat</code> - 是否長按重複</li>
                <li><code>ctrlKey/shiftKey/altKey/metaKey</code> - 修飾鍵</li>
                <li><code>isComposing</code> - 是否處於輸入法組合狀態</li>
              </ul>
            </div>

            <div class="tip-card">
              <h4>InputEvent 特有屬性</h4>
              <ul>
                <li><code>data</code> - 插入的數據</li>
                <li><code>inputType</code> - 輸入類型</li>
                <li><code>isComposing</code> - 是否處於輸入法組合</li>
              </ul>
              <h4 style="margin-top: 15px;">其他事件類型</h4>
              <ul>
                <li><strong>FocusEvent:</strong> relatedTarget</li>
                <li><strong>WheelEvent:</strong> deltaX, deltaY, deltaZ</li>
                <li><strong>DragEvent:</strong> dataTransfer</li>
                <li><strong>ScrollEvent:</strong> scrollTop, scrollLeft</li>
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
    // 滑鼠事件
    const mouseArea = document.getElementById('mouse-area');
    ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseenter', 'mouseleave', 'contextmenu'].forEach(eventType => {
      mouseArea.addEventListener(eventType, (e) => {
        if (eventType === 'contextmenu') e.preventDefault();
        this.handleEvent(e);
      });
    });

    // 測試按鈕
    const testButton = document.getElementById('test-button');
    testButton.addEventListener('click', (e) => {
      this.handleEvent(e);
    });

    // 鍵盤事件
    const keyboardInput = document.getElementById('keyboard-input');
    ['keydown', 'keyup', 'input'].forEach(eventType => {
      keyboardInput.addEventListener(eventType, (e) => {
        this.handleEvent(e);
      });
    });

    // 表單事件
    const emailInput = document.getElementById('email-input');
    const testSelect = document.getElementById('test-select');
    const testForm = document.getElementById('test-form');

    ['input', 'change', 'focus', 'blur'].forEach(eventType => {
      emailInput.addEventListener(eventType, (e) => {
        this.handleEvent(e);
      });
    });

    testSelect.addEventListener('change', (e) => {
      this.handleEvent(e);
    });

    testForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleEvent(e);
    });

    // 捲動事件
    const scrollArea = document.getElementById('scroll-area');
    scrollArea.addEventListener('scroll', (e) => {
      this.handleEvent(e);
    });

    // 清除歷史
    document.getElementById('clear-history').addEventListener('click', () => {
      this.clearHistory();
    });
  }

  /**
   * 處理事件
   */
  handleEvent(event) {
    this.currentEvent = event;

    // 添加到歷史
    this.eventHistory.unshift({
      type: event.type,
      timestamp: new Date().toLocaleTimeString(),
      isTrusted: event.isTrusted
    });

    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.pop();
    }

    this.displayEventDetails(event);
    this.updateHistory();
  }

  /**
   * 顯示事件詳情
   */
  displayEventDetails(event) {
    const badge = document.getElementById('event-type-badge');
    badge.textContent = event.type;
    badge.className = `type-badge ${this.getEventCategory(event.type)}`;

    const properties = this.extractEventProperties(event);
    const propertiesContainer = document.getElementById('event-properties');

    propertiesContainer.innerHTML = Object.entries(properties)
      .map(([category, props]) => {
        return `
          <div class="property-category">
            <h4>${category}</h4>
            <div class="property-list">
              ${Object.entries(props).map(([key, value]) => {
                const valueStr = this.formatValue(value);
                const isImportant = this.isImportantProperty(key);
                return `
                  <div class="property-item ${isImportant ? 'important' : ''}">
                    <span class="property-key">${key}</span>
                    <span class="property-value">${valueStr}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');
  }

  /**
   * 提取事件屬性
   */
  extractEventProperties(event) {
    const properties = {
      '基本屬性': {
        type: event.type,
        target: this.getElementDescription(event.target),
        currentTarget: this.getElementDescription(event.currentTarget),
        eventPhase: `${event.eventPhase} (${['', '捕獲', '目標', '冒泡'][event.eventPhase]})`,
        bubbles: event.bubbles,
        cancelable: event.cancelable,
        defaultPrevented: event.defaultPrevented,
        isTrusted: event.isTrusted,
        timeStamp: `${event.timeStamp.toFixed(2)} ms`
      }
    };

    // MouseEvent 特有屬性
    if (event instanceof MouseEvent) {
      properties['滑鼠屬性'] = {
        clientX: event.clientX,
        clientY: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY,
        screenX: event.screenX,
        screenY: event.screenY,
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        button: `${event.button} (${['左鍵', '中鍵', '右鍵'][event.button] || '未知'})`,
        buttons: event.buttons,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        relatedTarget: this.getElementDescription(event.relatedTarget)
      };
    }

    // KeyboardEvent 特有屬性
    if (event instanceof KeyboardEvent) {
      properties['鍵盤屬性'] = {
        key: event.key,
        code: event.code,
        keyCode: `${event.keyCode} (已廢棄)`,
        charCode: `${event.charCode} (已廢棄)`,
        repeat: event.repeat,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        isComposing: event.isComposing
      };
    }

    // InputEvent 特有屬性
    if (event instanceof InputEvent) {
      properties['輸入屬性'] = {
        data: event.data,
        inputType: event.inputType,
        isComposing: event.isComposing
      };
    }

    // FocusEvent 特有屬性
    if (event instanceof FocusEvent) {
      properties['焦點屬性'] = {
        relatedTarget: this.getElementDescription(event.relatedTarget)
      };
    }

    // UIEvent 特有屬性 (scroll, resize 等)
    if (event instanceof UIEvent && event.type === 'scroll') {
      const target = event.target;
      properties['捲動屬性'] = {
        scrollTop: target.scrollTop,
        scrollLeft: target.scrollLeft,
        scrollHeight: target.scrollHeight,
        scrollWidth: target.scrollWidth,
        clientHeight: target.clientHeight,
        clientWidth: target.clientWidth
      };
    }

    return properties;
  }

  /**
   * 獲取元素描述
   */
  getElementDescription(element) {
    if (!element) return 'null';

    const tagName = element.tagName?.toLowerCase() || 'unknown';
    const id = element.id ? `#${element.id}` : '';
    const className = element.className ? `.${element.className.split(' ')[0]}` : '';

    return `<${tagName}${id}${className}>`;
  }

  /**
   * 格式化值
   */
  formatValue(value) {
    if (value === null) return '<span class="null">null</span>';
    if (value === undefined) return '<span class="undefined">undefined</span>';
    if (typeof value === 'boolean') {
      return `<span class="boolean ${value ? 'true' : 'false'}">${value}</span>`;
    }
    if (typeof value === 'number') {
      return `<span class="number">${value}</span>`;
    }
    if (typeof value === 'string') {
      return `<span class="string">"${this.escapeHtml(value)}"</span>`;
    }
    return String(value);
  }

  /**
   * 轉義 HTML
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * 判斷是否為重要屬性
   */
  isImportantProperty(key) {
    const important = ['type', 'target', 'currentTarget', 'key', 'code', 'button', 'clientX', 'clientY', 'isTrusted'];
    return important.includes(key);
  }

  /**
   * 獲取事件類別
   */
  getEventCategory(eventType) {
    if (this.eventTypes.mouse.includes(eventType)) return 'mouse';
    if (this.eventTypes.keyboard.includes(eventType)) return 'keyboard';
    if (this.eventTypes.form.includes(eventType)) return 'form';
    return 'other';
  }

  /**
   * 更新歷史記錄
   */
  updateHistory() {
    const historyList = document.getElementById('history-list');

    if (this.eventHistory.length === 0) {
      historyList.innerHTML = '<p class="empty-state">還沒有觸發任何事件</p>';
      return;
    }

    historyList.innerHTML = this.eventHistory.map((entry, index) => {
      const category = this.getEventCategory(entry.type);
      return `
        <div class="history-item ${category}">
          <span class="history-type">${entry.type}</span>
          <span class="history-time">${entry.timestamp}</span>
          ${entry.isTrusted ? '<span class="trusted-badge">✓ Trusted</span>' : '<span class="untrusted-badge">✗ Synthetic</span>'}
        </div>
      `;
    }).join('');
  }

  /**
   * 清除歷史記錄
   */
  clearHistory() {
    this.eventHistory = [];
    this.updateHistory();
  }

  /**
   * 銷毀教程
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
