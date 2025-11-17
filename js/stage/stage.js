/**
 * 畫布控制器 - 管理 Stage 上的元素建立、選取、拖曳
 */

import { eventBus } from '../core/eventBus.js';
import { appState } from '../core/state.js';
import { $, createStageElement, setStyles, createElement } from '../core/domUtils.js';
import { snapToGrid, calculateSmartGuides, rectsIntersect } from '../core/geometry.js';
import { Snaplines } from './snaplines.js';

export class Stage {
  constructor() {
    this.stageEl = $('#stage');
    this.elementMap = new Map(); // id -> DOM element
    this.dragState = null;
    this.marqueeState = null;
    this.marqueeBox = null;
    this.snaplines = new Snaplines(this.stageEl);
    this.init();
  }

  init() {
    // 訂閱元素事件
    eventBus.subscribe('stage/element/created', ({ id }) => {
      this.createElement(id);
    });

    eventBus.subscribe('stage/element/deleted', ({ id }) => {
      this.deleteElement(id);
    });

    eventBus.subscribe('stage/element/updated', ({ id, changes }) => {
      this.updateElement(id, changes);
    });

    eventBus.subscribe('panel/properties/change', ({ id, prop, value }) => {
      this.handlePropertyChange(id, prop, value);
    });

    eventBus.subscribe('stage/element/zorder-changed', () => {
      this.updateZOrder();
    });

    // 訂閱項目載入/清空事件
    eventBus.subscribe('app/state/restored', () => {
      this.rebuildStage();
    });

    eventBus.subscribe('app/state/cleared', () => {
      this.clearStage();
    });

    // 監聽 Stage 上的點擊（選取元素）
    this.stageEl.addEventListener('mousedown', (e) => {
      this.handleMouseDown(e);
    });

    // 監聽拖曳
    document.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });

    document.addEventListener('mouseup', (e) => {
      this.handleMouseUp(e);
    });

    // 點擊空白處取消選取
    this.stageEl.addEventListener('click', (e) => {
      if (e.target === this.stageEl) {
        appState.clearSelection();
      }
    });
  }

  /**
   * 建立元素並加入 Stage
   */
  createElement(id) {
    const elementNode = appState.getElement(id);
    if (!elementNode) return;

    const domEl = createStageElement(elementNode);

    // 儲存對應關係
    this.elementMap.set(id, domEl);

    // 加入 Stage
    this.stageEl.appendChild(domEl);

    // 綁定事件（如果有）
    if (elementNode.events) {
      Object.entries(elementNode.events).forEach(([eventName, handlerSpec]) => {
        this.bindEvent(domEl, eventName, handlerSpec);
      });
    }

    // 顯示事件標記
    this.updateEventBadges(id);

    // 自動選取新建立的元素
    appState.selectElement(id);
  }

  /**
   * 刪除元素
   */
  deleteElement(id) {
    const domEl = this.elementMap.get(id);
    if (domEl) {
      domEl.remove();
      this.elementMap.delete(id);
    }
  }

  /**
   * 更新元素
   */
  updateElement(id, changes) {
    const domEl = this.elementMap.get(id);
    const elementNode = appState.getElement(id);
    if (!domEl || !elementNode) return;

    // 更新樣式
    if (changes.style) {
      setStyles(domEl, changes.style);
    }

    // 更新位置與尺寸
    if (changes.frame) {
      const { x, y, w, h } = elementNode.frame;
      setStyles(domEl, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`
      });
    }

    // 更新屬性
    if (changes.attrs) {
      Object.entries(changes.attrs).forEach(([key, value]) => {
        if (key === 'textContent') {
          domEl.textContent = value;
        } else {
          domEl.setAttribute(key, value);
        }
      });
    }

    // 更新事件標記
    if (changes.events !== undefined) {
      this.updateEventBadges(id);
    }
  }

  /**
   * 處理屬性面板的變更
   */
  handlePropertyChange(id, prop, value) {
    const elementNode = appState.getElement(id);
    if (!elementNode) return;

    const changes = {};

    // 根據屬性類型更新對應的值
    if (['x', 'y', 'w', 'h'].includes(prop)) {
      changes.frame = { ...elementNode.frame };

      if (prop === 'x') changes.frame.x = parseFloat(value);
      if (prop === 'y') changes.frame.y = parseFloat(value);
      if (prop === 'w') changes.frame.w = parseFloat(value);
      if (prop === 'h') changes.frame.h = parseFloat(value);
    } else if (['backgroundColor', 'bgColor', 'color', 'textColor', 'fontSize', 'borderRadius',
                'opacity', 'zIndex', 'display', 'overflow', 'cursor',
                'fontFamily', 'fontWeight', 'fontStyle', 'textAlign', 'textDecoration',
                'lineHeight', 'letterSpacing',
                'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
                'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
                'borderWidth', 'borderStyle', 'borderColor',
                'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
                'boxShadow'].includes(prop)) {
      changes.style = {};

      // 處理簡寫屬性名稱
      const styleMap = {
        'bgColor': 'backgroundColor',
        'textColor': 'color'
      };
      const styleProp = styleMap[prop] || prop;

      if (prop === 'fontSize') {
        changes.style.fontSize = `${value}px`;
      } else if (prop === 'borderRadius') {
        changes.style.borderRadius = `${value}px`;
      } else if (prop === 'letterSpacing') {
        changes.style.letterSpacing = value ? `${value}px` : '';
      } else if (['padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
                  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'].includes(prop)) {
        // 間距屬性，加上 px 單位
        changes.style[styleProp] = value ? `${value}px` : '';
      } else if (['borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'].includes(prop)) {
        // 邊框寬度，加上 px 單位
        changes.style[styleProp] = value ? `${value}px` : '';
      } else if (prop === 'opacity' || prop === 'zIndex' || prop === 'lineHeight') {
        // 數值屬性，不加單位
        changes.style[styleProp] = value;
      } else {
        changes.style[styleProp] = value;
      }
    } else if (prop === 'textContent') {
      changes.attrs = { textContent: value };
    }

    // 更新狀態（會觸發 stage/element/updated 事件）
    appState.updateElement(id, changes);
  }

  /**
   * 滑鼠按下 - 開始拖曳或框選
   */
  handleMouseDown(e) {
    const target = e.target.closest('.stage-element');

    if (target) {
      // 點擊到元素 - 開始拖曳
      e.preventDefault();

      // 找到元素 ID
      const id = target.id;

      // 選取元素（Shift 多選）
      appState.selectElement(id, e.shiftKey);

      // 開始拖曳
      const elementNode = appState.getElement(id);
      if (!elementNode) return;

      this.dragState = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        elementStartX: elementNode.frame.x,
        elementStartY: elementNode.frame.y
      };
    } else if (e.target === this.stageEl) {
      // 點擊空白處 - 開始框選
      e.preventDefault();

      const rect = this.stageEl.getBoundingClientRect();
      const startX = e.clientX - rect.left + this.stageEl.scrollLeft;
      const startY = e.clientY - rect.top + this.stageEl.scrollTop;

      this.marqueeState = {
        startX,
        startY,
        currentX: startX,
        currentY: startY
      };

      // 建立框選框
      this.marqueeBox = createElement('div', {
        className: 'marquee-box',
        style: {
          left: `${startX}px`,
          top: `${startY}px`,
          width: '0px',
          height: '0px'
        }
      });

      this.stageEl.appendChild(this.marqueeBox);

      // 如果沒按 Shift，清除現有選取
      if (!e.shiftKey) {
        appState.clearSelection();
      }
    }
  }

  /**
   * 滑鼠移動 - 拖曳或框選中
   */
  handleMouseMove(e) {
    // 處理框選
    if (this.marqueeState) {
      const rect = this.stageEl.getBoundingClientRect();
      const currentX = e.clientX - rect.left + this.stageEl.scrollLeft;
      const currentY = e.clientY - rect.top + this.stageEl.scrollTop;

      this.marqueeState.currentX = currentX;
      this.marqueeState.currentY = currentY;

      // 計算框選框的位置與尺寸
      const x = Math.min(this.marqueeState.startX, currentX);
      const y = Math.min(this.marqueeState.startY, currentY);
      const w = Math.abs(currentX - this.marqueeState.startX);
      const h = Math.abs(currentY - this.marqueeState.startY);

      // 更新框選框
      setStyles(this.marqueeBox, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`
      });

      return;
    }

    // 處理拖曳
    if (!this.dragState) return;

    const dx = e.clientX - this.dragState.startX;
    const dy = e.clientY - this.dragState.startY;

    let newX = this.dragState.elementStartX + dx;
    let newY = this.dragState.elementStartY + dy;

    // 取得當前元素
    const elementNode = appState.getElement(this.dragState.id);
    if (!elementNode) return;

    const settings = appState.settings;

    // 暫時的框架用於吸附計算
    const tempFrame = {
      ...elementNode.frame,
      x: Math.max(0, newX),
      y: Math.max(0, newY)
    };

    // Alt 鍵停用吸附
    const disableSnap = e.altKey;

    if (!disableSnap) {
      // 智慧輔助線（優先）
      if (settings.showGuides) {
        // 取得其他元素的框架
        const otherFrames = Array.from(appState.elements.values())
          .filter(el => el.id !== this.dragState.id)
          .map(el => el.frame);

        const { snapX, snapY, guides } = calculateSmartGuides(tempFrame, otherFrames);

        if (snapX !== null) {
          newX = snapX;
        }
        if (snapY !== null) {
          newY = snapY;
        }

        // 顯示輔助線
        if (guides.length > 0) {
          this.snaplines.show(guides);
        } else {
          this.snaplines.clear();
        }
      }

      // 網格吸附
      if (settings.snapToGrid && !settings.showGuides) {
        newX = snapToGrid(newX, settings.gridSize);
        newY = snapToGrid(newY, settings.gridSize);
      }
    }

    // 更新位置
    appState.updateElement(this.dragState.id, {
      frame: {
        ...elementNode.frame,
        x: Math.max(0, newX),
        y: Math.max(0, newY)
      }
    });
  }

  /**
   * 滑鼠放開 - 結束拖曳或框選
   */
  handleMouseUp(e) {
    // 處理框選結束
    if (this.marqueeState) {
      // 計算框選框的矩形
      const x = Math.min(this.marqueeState.startX, this.marqueeState.currentX);
      const y = Math.min(this.marqueeState.startY, this.marqueeState.currentY);
      const w = Math.abs(this.marqueeState.currentX - this.marqueeState.startX);
      const h = Math.abs(this.marqueeState.currentY - this.marqueeState.startY);

      const marqueeRect = { x, y, w, h };

      // 找出與框選框相交的所有元素
      const selectedIds = [];
      appState.elements.forEach((element, id) => {
        if (rectsIntersect(marqueeRect, element.frame)) {
          selectedIds.push(id);
        }
      });

      // 選取相交的元素
      if (selectedIds.length > 0) {
        // 如果按住 Shift，添加到現有選取
        if (e.shiftKey) {
          selectedIds.forEach(id => {
            appState.selectElement(id, true);
          });
        } else {
          // 否則替換選取
          appState.clearSelection();
          selectedIds.forEach(id => {
            appState.selectElement(id, true);
          });
        }
      }

      // 移除框選框
      if (this.marqueeBox) {
        this.marqueeBox.remove();
        this.marqueeBox = null;
      }

      this.marqueeState = null;
      return;
    }

    // 處理拖曳結束
    if (this.dragState) {
      this.dragState = null;
      // 清除輔助線
      this.snaplines.clear();
    }
  }

  /**
   * 取得指定元素的 DOM 節點
   */
  getElementDOM(id) {
    return this.elementMap.get(id);
  }

  /**
   * 更新 Z 軸順序（重新排列 DOM）
   */
  updateZOrder() {
    appState.zOrder.forEach(id => {
      const domEl = this.elementMap.get(id);
      if (domEl) {
        // 移除後重新加入，確保順序正確
        this.stageEl.appendChild(domEl);
      }
    });
  }

  /**
   * 綁定事件到 DOM 元素
   */
  bindEvent(domEl, eventName, handlerSpec) {
    // 建立處理函數
    const handler = (e) => {
      this.executeHandler(e, domEl, handlerSpec);
    };

    // 取得選項
    const options = handlerSpec.options || {};

    // 綁定事件
    domEl.addEventListener(eventName, handler, options);

    // 儲存處理函數引用（用於解除綁定）
    if (!domEl._eventHandlers) {
      domEl._eventHandlers = {};
    }
    domEl._eventHandlers[eventName] = handler;
  }

  /**
   * 執行事件處理器
   */
  executeHandler(e, el, handlerSpec) {
    const { preset, args, custom } = handlerSpec;

    if (preset) {
      this.executePreset(e, el, preset, args);
    } else if (custom) {
      try {
        // 提供 e 和 el 變數給自訂程式碼
        const func = new Function('e', 'el', custom);
        func(e, el);
      } catch (error) {
        console.error('自訂程式碼執行錯誤:', error);
      }
    }
  }

  /**
   * 執行預設動作
   */
  executePreset(e, el, preset, args) {
    switch (preset) {
      case 'toggleClass':
        el.classList.toggle(args.className);
        break;

      case 'addClass':
        el.classList.add(args.className);
        break;

      case 'removeClass':
        el.classList.remove(args.className);
        break;

      case 'changeColor':
        el.style.backgroundColor = args.color;
        break;

      case 'toggleVisibility':
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
        break;

      case 'setText':
        const target = document.querySelector(args.target);
        if (target) {
          target.textContent = args.text;
        }
        break;

      case 'updateText':
        const sourceEl = document.querySelector(args.sourceSelector);
        if (sourceEl) {
          el.textContent = sourceEl.value || sourceEl.textContent;
        }
        break;

      case 'getValue':
        const displayEl = document.querySelector(args.displayTarget);
        if (displayEl) {
          displayEl.textContent = el.value || el.textContent;
        }
        break;

      case 'alert':
        alert(args.message);
        break;
    }
  }

  /**
   * 更新元素上的事件標記
   */
  updateEventBadges(id) {
    const domEl = this.elementMap.get(id);
    const elementNode = appState.getElement(id);
    if (!domEl || !elementNode) return;

    // 移除舊的標記容器
    const existingContainer = domEl.querySelector('.event-badges-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // 如果沒有事件，不顯示標記
    const events = elementNode.events;
    if (!events || Object.keys(events).length === 0) {
      return;
    }

    // 建立標記容器
    const container = createElement('div', {
      className: 'event-badges-container'
    });

    // 事件圖示對應
    const eventIcons = {
      'click': '👆',
      'dblclick': '👆👆',
      'input': '⌨️',
      'mouseenter': '🖱️',
      'mouseleave': '🚀',
      'keydown': '⌨️',
      'focus': '🎯',
      'blur': '💫',
      'contextmenu': '📋',
      'change': '🔄',
      'submit': '📤',
      'scroll': '📜',
      'resize': '↔️',
      'load': '⚡'
    };

    // 為每個事件建立標記
    Object.keys(events).forEach(eventName => {
      const badge = createElement('span', {
        className: 'event-badge',
        textContent: eventIcons[eventName] || '⚡',
        title: `Event: ${eventName}`
      });
      badge.setAttribute('data-event', eventName);
      container.appendChild(badge);
    });

    // 將標記容器加入元素
    domEl.appendChild(container);
  }

  /**
   * 重建整個 Stage（用於載入項目）
   */
  rebuildStage() {
    // 清空現有元素
    this.stageEl.innerHTML = '';
    this.elementsMap.clear();

    // 根據 appState 重新創建所有元素
    const elements = appState.getElementsInOrder();
    elements.forEach(element => {
      this.createElement(element.id);
    });

    // 更新程式碼預覽
    eventBus.publish('code/regenerate');
  }

  /**
   * 清空 Stage（用於新建項目）
   */
  clearStage() {
    this.stageEl.innerHTML = '';
    this.elementsMap.clear();

    // 更新程式碼預覽
    eventBus.publish('code/regenerate');
  }
}
