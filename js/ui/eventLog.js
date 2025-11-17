/**
 * 事件日誌 - 記錄所有觸發的事件
 */

import { eventBus } from '../core/eventBus.js';
import { appState } from '../core/state.js';
import { $, createElement } from '../core/domUtils.js';

export class EventLog {
  constructor(stage) {
    this.stage = stage;
    this.logContent = $('#event-log-content');
    this.logCountEl = $('.event-log-count');
    this.clearBtn = $('#clear-log');
    this.pauseCheckbox = $('#log-pause');
    this.eventLogTab = $('[data-code-tab="eventlog"]');

    this.logs = [];
    this.isPaused = false;
    this.maxLogs = 100; // 最多保留 100 條記錄

    this.init();
  }

  init() {
    // 監聽標籤切換，顯示/隱藏清除按鈕和複製按鈕
    const codeTabs = document.querySelectorAll('.code-tab');
    const copyBtn = $('#copy-code');

    codeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const isEventLogTab = tab.dataset.codeTab === 'eventlog';
        this.clearBtn.style.display = isEventLogTab ? 'block' : 'none';
        copyBtn.style.display = isEventLogTab ? 'none' : 'block';
      });
    });

    // 清除日誌
    this.clearBtn.addEventListener('click', () => {
      this.clearLogs();
    });

    // 暫停/恢復記錄
    this.pauseCheckbox.addEventListener('change', (e) => {
      this.isPaused = e.target.checked;
    });

    // 訂閱事件 - 當事件被綁定到元素時，開始監聽
    eventBus.subscribe('stage/element/created', ({ id }) => {
      this.attachEventListeners(id);
    });

    eventBus.subscribe('stage/element/updated', ({ id, changes }) => {
      if (changes.events !== undefined) {
        this.attachEventListeners(id);
      }
    });

    // 初始化已存在的元素
    appState.elements.forEach((element, id) => {
      if (element.events && Object.keys(element.events).length > 0) {
        this.attachEventListeners(id);
      }
    });
  }

  /**
   * 為元素附加事件監聽器用於記錄
   */
  attachEventListeners(id) {
    const element = appState.getElement(id);
    const domEl = this.stage.getElementDOM(id);

    if (!element || !domEl || !element.events) return;

    // 為每個事件附加捕獲和冒泡階段的監聽器
    Object.keys(element.events).forEach(eventName => {
      // 移除舊的監聽器（如果存在）
      if (domEl._logHandlers && domEl._logHandlers[eventName]) {
        const { capture, bubble } = domEl._logHandlers[eventName];
        domEl.removeEventListener(eventName, capture, true);
        domEl.removeEventListener(eventName, bubble, false);
      }

      // 捕獲階段
      const captureHandler = (e) => {
        this.logEvent(eventName, domEl, 'capture', e);
      };

      // 冒泡階段
      const bubbleHandler = (e) => {
        this.logEvent(eventName, domEl, 'bubble', e);
      };

      // 綁定監聽器
      domEl.addEventListener(eventName, captureHandler, true);
      domEl.addEventListener(eventName, bubbleHandler, false);

      // 儲存引用以便後續移除
      if (!domEl._logHandlers) {
        domEl._logHandlers = {};
      }
      domEl._logHandlers[eventName] = { capture: captureHandler, bubble: bubbleHandler };
    });
  }

  /**
   * 記錄事件
   */
  logEvent(eventType, target, phase, event) {
    if (this.isPaused) return;

    const timestamp = new Date();
    const timeString = timestamp.toLocaleTimeString('zh-TW', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });

    const logEntry = {
      timestamp,
      timeString,
      eventType,
      targetId: target.id,
      targetTag: target.tagName.toLowerCase(),
      phase,
      details: this.getEventDetails(event)
    };

    this.logs.push(logEntry);

    // 限制日誌數量
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.renderLogEntry(logEntry);
    this.updateCount();
    this.autoScroll();
  }

  /**
   * 獲取事件詳情
   */
  getEventDetails(event) {
    const details = [];

    if (event.type === 'click' || event.type === 'dblclick') {
      details.push(`(${event.clientX}, ${event.clientY})`);
    }

    if (event.type === 'keydown') {
      details.push(`key: ${event.key}`);
    }

    if (event.type === 'input') {
      details.push(`value: ${event.target.value}`);
    }

    return details.join(', ');
  }

  /**
   * 渲染日誌條目
   */
  renderLogEntry(entry) {
    // 移除空提示
    const emptyHint = this.logContent.querySelector('.empty-hint');
    if (emptyHint) {
      emptyHint.remove();
    }

    const logEl = createElement('div', {
      className: 'event-log-entry new-entry',
      children: [
        createElement('span', {
          className: 'log-timestamp',
          textContent: entry.timeString
        }),
        createElement('span', {
          className: 'log-event-type',
          textContent: entry.eventType
        }),
        createElement('span', {
          className: 'log-target',
          textContent: `${entry.targetTag}#${entry.targetId}`,
          title: `${entry.targetTag}#${entry.targetId}`
        }),
        createElement('span', {
          className: `log-phase ${entry.phase}`,
          textContent: entry.phase
        }),
        createElement('span', {
          className: 'log-details',
          textContent: entry.details || '-'
        })
      ]
    });

    this.logContent.appendChild(logEl);

    // 移除動畫類別（在下次渲染循環）
    requestAnimationFrame(() => {
      logEl.classList.remove('new-entry');
    });
  }

  /**
   * 更新計數
   */
  updateCount() {
    const count = this.logs.length;
    this.logCountEl.textContent = `${count} event${count !== 1 ? 's' : ''}`;
  }

  /**
   * 自動滾動到底部
   */
  autoScroll() {
    this.logContent.scrollTop = this.logContent.scrollHeight;
  }

  /**
   * 清除日誌
   */
  clearLogs() {
    this.logs = [];
    this.logContent.innerHTML = '<div class="empty-hint">尚無事件觸發</div>';
    this.updateCount();
  }
}
