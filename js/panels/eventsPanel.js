/**
 * 事件面板 - 綁定和管理元素事件
 */

import { eventBus } from '../core/eventBus.js';
import { appState } from '../core/state.js';
import { $, createElement, empty } from '../core/domUtils.js';

export class EventsPanel {
  constructor(stage) {
    this.stage = stage;
    this.panelEmpty = $('.panel-empty', $('#events-panel'));
    this.panelForm = $('#events-form');
    this.currentElement = null;

    // UI 元素
    this.eventType = $('#event-type');
    this.eventPreset = $('#event-preset');
    this.presetParams = $('#preset-params');
    this.eventsList = $('#events-list');
    this.btnAddEvent = $('#btn-add-event');
    this.eventDescription = $('#event-description');

    // 參數輸入欄位
    this.paramInputs = {
      className: $('#param-className'),
      addClassName: $('#param-addClassName'),
      removeClassName: $('#param-removeClassName'),
      color: $('#param-color'),
      target: $('#param-target'),
      text: $('#param-text'),
      sourceSelector: $('#param-sourceSelector'),
      displayTarget: $('#param-displayTarget'),
      message: $('#param-message'),
      customCode: $('#param-customCode')
    };

    // 選項
    this.eventCapture = $('#event-capture');
    this.eventOnce = $('#event-once');
    this.eventPassive = $('#event-passive');

    // 事件詳細說明數據庫
    this.eventDescriptions = this.initEventDescriptions();

    this.init();
  }

  init() {
    // 訂閱選取事件
    eventBus.subscribe('stage/element/selected', ({ ids }) => {
      if (ids.length === 0) {
        this.showEmpty();
      } else if (ids.length === 1) {
        this.showForm(ids[0]);
      } else {
        // 多選時隱藏
        this.showEmpty();
      }
    });

    // 監聽事件類型變更 - 顯示說明
    this.eventType.addEventListener('change', () => {
      this.updateEventDescription();
    });

    // 監聽範本選擇變更
    this.eventPreset.addEventListener('change', () => {
      this.updatePresetParams();
    });

    // 監聽綁定按鈕
    this.btnAddEvent.addEventListener('click', () => {
      this.handleAddEvent();
    });

    // 初始化事件說明
    this.updateEventDescription();
  }

  /**
   * 顯示空白狀態
   */
  showEmpty() {
    this.panelEmpty.style.display = 'block';
    this.panelForm.style.display = 'none';
    this.currentElement = null;
  }

  /**
   * 顯示表單
   */
  showForm(id) {
    this.panelEmpty.style.display = 'none';
    this.panelForm.style.display = 'block';
    this.currentElement = id;
    this.loadElementEvents(id);
  }

  /**
   * 載入元素的事件列表
   */
  loadElementEvents(id) {
    const element = appState.getElement(id);
    if (!element) return;

    // 清空列表
    empty(this.eventsList);

    const events = element.events || {};
    const eventKeys = Object.keys(events);

    if (eventKeys.length === 0) {
      this.eventsList.appendChild(createElement('p', {
        className: 'empty-hint',
        textContent: '尚未綁定任何事件'
      }));
      return;
    }

    // 顯示每個事件
    eventKeys.forEach(eventName => {
      const handlerSpec = events[eventName];
      const item = this.createEventItem(eventName, handlerSpec);
      this.eventsList.appendChild(item);
    });
  }

  /**
   * 建立事件項目
   */
  createEventItem(eventName, handlerSpec) {
    const description = this.getEventDescription(handlerSpec);

    const item = createElement('div', {
      className: 'event-item'
    });

    const header = createElement('div', {
      className: 'event-item-header'
    });

    const title = createElement('div', {
      className: 'event-item-title',
      textContent: eventName
    });

    const actions = createElement('div', {
      className: 'event-item-actions'
    });

    const btnTest = createElement('button', {
      className: 'btn btn-xs',
      textContent: '測試'
    });
    btnTest.addEventListener('click', () => {
      this.testEvent(eventName);
    });

    const btnUnbind = createElement('button', {
      className: 'btn btn-xs btn-danger',
      textContent: '解除'
    });
    btnUnbind.addEventListener('click', () => {
      this.unbindEvent(eventName);
    });

    actions.appendChild(btnTest);
    actions.appendChild(btnUnbind);

    header.appendChild(title);
    header.appendChild(actions);

    const desc = createElement('div', {
      className: 'event-item-desc',
      textContent: description
    });

    item.appendChild(header);
    item.appendChild(desc);

    return item;
  }

  /**
   * 取得事件描述
   */
  getEventDescription(handlerSpec) {
    const { preset, args, custom, options } = handlerSpec;

    let desc = '';

    if (preset) {
      switch (preset) {
        case 'toggleClass':
          desc = `切換 class: ${args.className}`;
          break;
        case 'addClass':
          desc = `新增 class: ${args.className}`;
          break;
        case 'removeClass':
          desc = `移除 class: ${args.className}`;
          break;
        case 'changeColor':
          desc = `改變背景色為: ${args.color}`;
          break;
        case 'toggleVisibility':
          desc = '切換顯示/隱藏';
          break;
        case 'setText':
          desc = `設定 ${args.target} 的文字為: "${args.text}"`;
          break;
        case 'updateText':
          desc = `從 ${args.sourceSelector} 讀取並更新文字`;
          break;
        case 'getValue':
          desc = `讀取輸入值並顯示在 ${args.displayTarget}`;
          break;
        case 'alert':
          desc = `彈出訊息: "${args.message}"`;
          break;
      }
    } else if (custom) {
      desc = '自訂程式碼';
    }

    // 顯示選項
    const opts = [];
    if (options?.capture) opts.push('capture');
    if (options?.once) opts.push('once');
    if (options?.passive) opts.push('passive');

    if (opts.length > 0) {
      desc += ` (${opts.join(', ')})`;
    }

    return desc;
  }

  /**
   * 更新範本參數 UI
   */
  updatePresetParams() {
    const preset = this.eventPreset.value;

    // 隱藏所有參數
    this.presetParams.querySelectorAll('.form-row').forEach(row => {
      row.style.display = 'none';
    });

    if (!preset) {
      this.presetParams.style.display = 'none';
      return;
    }

    this.presetParams.style.display = 'block';

    // 顯示對應的參數
    const paramRow = $(`#param-${preset}`);
    if (paramRow) {
      paramRow.style.display = 'flex';
    }
  }

  /**
   * 處理新增事件
   */
  handleAddEvent() {
    if (!this.currentElement) return;

    const eventName = this.eventType.value;
    const preset = this.eventPreset.value;

    if (!preset) {
      alert('請選擇動作範本');
      return;
    }

    // 收集參數
    const args = {};
    let custom = null;

    switch (preset) {
      case 'toggleClass':
        args.className = this.paramInputs.className.value.trim();
        if (!args.className) {
          alert('請輸入 Class 名稱');
          return;
        }
        break;

      case 'addClass':
        args.className = this.paramInputs.addClassName.value.trim();
        if (!args.className) {
          alert('請輸入 Class 名稱');
          return;
        }
        break;

      case 'removeClass':
        args.className = this.paramInputs.removeClassName.value.trim();
        if (!args.className) {
          alert('請輸入 Class 名稱');
          return;
        }
        break;

      case 'changeColor':
        args.color = this.paramInputs.color.value;
        break;

      case 'toggleVisibility':
        // 不需要參數
        break;

      case 'setText':
        args.target = this.paramInputs.target.value.trim();
        args.text = this.paramInputs.text.value;
        if (!args.target) {
          alert('請輸入目標選取器');
          return;
        }
        break;

      case 'updateText':
        args.sourceSelector = this.paramInputs.sourceSelector.value.trim();
        if (!args.sourceSelector) {
          alert('請輸入來源選取器');
          return;
        }
        break;

      case 'getValue':
        args.displayTarget = this.paramInputs.displayTarget.value.trim();
        if (!args.displayTarget) {
          alert('請輸入目標選取器');
          return;
        }
        break;

      case 'alert':
        args.message = this.paramInputs.message.value;
        if (!args.message) {
          alert('請輸入訊息內容');
          return;
        }
        break;

      case 'custom':
        custom = this.paramInputs.customCode.value.trim();
        if (!custom) {
          alert('請輸入自訂程式碼');
          return;
        }
        break;
    }

    // 收集選項
    const options = {};
    if (this.eventCapture.checked) options.capture = true;
    if (this.eventOnce.checked) options.once = true;
    if (this.eventPassive.checked) options.passive = true;

    // 建立 HandlerSpec
    const handlerSpec = {
      preset: preset === 'custom' ? null : preset,
      args: preset === 'custom' ? null : args,
      custom,
      options: Object.keys(options).length > 0 ? options : null
    };

    // 儲存到狀態
    const element = appState.getElement(this.currentElement);
    if (!element) return;

    const events = { ...element.events };
    events[eventName] = handlerSpec;

    appState.updateElement(this.currentElement, { events });

    // 綁定實際事件到 DOM
    this.bindEventToDOM(this.currentElement, eventName, handlerSpec);

    // 重新載入事件列表
    this.loadElementEvents(this.currentElement);

    // 重置表單
    this.resetForm();
  }

  /**
   * 綁定事件到 DOM 元素
   */
  bindEventToDOM(id, eventName, handlerSpec) {
    const domEl = this.stage.getElementDOM(id);
    if (!domEl) return;

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

      case 'alert':
        alert(args.message);
        break;
    }
  }

  /**
   * 測試事件
   */
  testEvent(eventName) {
    if (!this.currentElement) return;

    const domEl = this.stage.getElementDOM(this.currentElement);
    if (!domEl) return;

    // 手動觸發事件
    const event = new Event(eventName, { bubbles: true });
    domEl.dispatchEvent(event);
  }

  /**
   * 解除綁定事件
   */
  unbindEvent(eventName) {
    if (!this.currentElement) return;

    // 從狀態移除
    const element = appState.getElement(this.currentElement);
    if (!element) return;

    const events = { ...element.events };
    delete events[eventName];

    appState.updateElement(this.currentElement, { events });

    // 從 DOM 解除綁定
    const domEl = this.stage.getElementDOM(this.currentElement);
    if (domEl && domEl._eventHandlers && domEl._eventHandlers[eventName]) {
      const handler = domEl._eventHandlers[eventName];
      domEl.removeEventListener(eventName, handler);
      delete domEl._eventHandlers[eventName];
    }

    // 重新載入事件列表
    this.loadElementEvents(this.currentElement);
  }

  /**
   * 重置表單
   */
  resetForm() {
    this.eventPreset.value = '';
    this.paramInputs.className.value = '';
    this.paramInputs.target.value = '';
    this.paramInputs.text.value = '';
    this.paramInputs.message.value = '';
    this.paramInputs.customCode.value = '';
    this.eventCapture.checked = false;
    this.eventOnce.checked = false;
    this.eventPassive.checked = false;
    this.updatePresetParams();
  }

  /**
   * 更新事件說明顯示
   */
  updateEventDescription() {
    const eventType = this.eventType.value;
    const desc = this.eventDescriptions[eventType];

    if (desc) {
      this.eventDescription.style.display = 'block';
      this.eventDescription.innerHTML = `
        <strong>${desc.name}</strong><br>
        ${desc.description}<br>
        <span style="color: #666; font-size: 0.8rem;">
          ${desc.bubbles ? '🔵 冒泡' : '🔴 不冒泡'} |
          ${desc.cancelable ? '可取消' : '不可取消'} |
          ${desc.useCase}
        </span>
      `;
    } else {
      this.eventDescription.style.display = 'none';
    }
  }

  /**
   * 初始化事件說明數據庫
   */
  initEventDescriptions() {
    return {
      // 🖱️ 鼠標事件
      'click': {
        name: 'click - 點擊',
        description: '當用戶點擊元素時觸發（完整的按下+釋放）',
        bubbles: true,
        cancelable: true,
        useCase: '用於按鈕、連結等可點擊元素'
      },
      'dblclick': {
        name: 'dblclick - 雙擊',
        description: '當用戶雙擊元素時觸發',
        bubbles: true,
        cancelable: true,
        useCase: '用於快速操作，如打開文件'
      },
      'contextmenu': {
        name: 'contextmenu - 右鍵菜單',
        description: '當用戶點擊右鍵時觸發，可 preventDefault 阻止默認菜單',
        bubbles: true,
        cancelable: true,
        useCase: '自定義右鍵菜單'
      },
      'mousedown': {
        name: 'mousedown - 鼠標按下',
        description: '當鼠標按鈕被按下時觸發（早於 click）',
        bubbles: true,
        cancelable: true,
        useCase: '拖拽起點、自定義按鈕行為'
      },
      'mouseup': {
        name: 'mouseup - 鼠標釋放',
        description: '當鼠標按鈕被釋放時觸發',
        bubbles: true,
        cancelable: true,
        useCase: '拖拽終點、繪圖結束'
      },
      'mousemove': {
        name: 'mousemove - 鼠標移動',
        description: '當鼠標在元素上移動時持續觸發（高頻事件，建議節流）',
        bubbles: true,
        cancelable: true,
        useCase: '鼠標跟隨效果、繪圖、拖拽'
      },
      'mouseenter': {
        name: 'mouseenter - 鼠標移入',
        description: '當鼠標進入元素時觸發一次，不冒泡',
        bubbles: false,
        cancelable: false,
        useCase: '懸停卡片、工具提示'
      },
      'mouseleave': {
        name: 'mouseleave - 鼠標移出',
        description: '當鼠標離開元素時觸發一次，不冒泡',
        bubbles: false,
        cancelable: false,
        useCase: '隱藏懸停內容'
      },
      'mouseover': {
        name: 'mouseover - 鼠標懸停',
        description: '與 mouseenter 類似，但會冒泡，子元素也會觸發',
        bubbles: true,
        cancelable: true,
        useCase: '需要事件委託的懸停效果'
      },
      'mouseout': {
        name: 'mouseout - 鼠標離開',
        description: '與 mouseleave 類似，但會冒泡',
        bubbles: true,
        cancelable: true,
        useCase: '需要事件委託的離開效果'
      },
      'wheel': {
        name: 'wheel - 鼠標滾輪',
        description: '當鼠標滾輪滾動時觸發，event.deltaY 表示方向',
        bubbles: true,
        cancelable: true,
        useCase: '自定義滾動、縮放控制'
      },

      // ⌨️ 鍵盤事件
      'keydown': {
        name: 'keydown - 按鍵按下',
        description: '當鍵盤按鍵被按下時觸發，長按會重複觸發（e.repeat）',
        bubbles: true,
        cancelable: true,
        useCase: '方向鍵控制、快捷鍵、遊戲操作'
      },
      'keyup': {
        name: 'keyup - 按鍵釋放',
        description: '當鍵盤按鍵被釋放時觸發',
        bubbles: true,
        cancelable: true,
        useCase: '與 keydown 配合，檢測按鍵持續時間'
      },
      'keypress': {
        name: 'keypress - 按鍵（已廢棄）',
        description: '已廢棄，僅用於教學對比。推薦使用 keydown',
        bubbles: true,
        cancelable: true,
        useCase: '教學用途，了解舊 API'
      },

      // 📝 表單事件
      'input': {
        name: 'input - 輸入值改變',
        description: '當輸入框的值改變時立即觸發（實時）',
        bubbles: true,
        cancelable: false,
        useCase: '實時搜索、表單驗證、字數統計'
      },
      'change': {
        name: 'change - 值改變並失焦',
        description: '當輸入框值改變且失去焦點時觸發（或 select/checkbox 變更）',
        bubbles: true,
        cancelable: false,
        useCase: '下拉選單、複選框、單選框'
      },
      'submit': {
        name: 'submit - 表單提交',
        description: '當表單提交時觸發，可 preventDefault 阻止默認提交',
        bubbles: true,
        cancelable: true,
        useCase: 'AJAX 提交、表單驗證攔截'
      },
      'reset': {
        name: 'reset - 表單重置',
        description: '當表單重置時觸發',
        bubbles: true,
        cancelable: true,
        useCase: '表單清空確認'
      },
      'focus': {
        name: 'focus - 獲得焦點',
        description: '當元素獲得焦點時觸發，不冒泡',
        bubbles: false,
        cancelable: false,
        useCase: '輸入框高亮、顯示提示'
      },
      'blur': {
        name: 'blur - 失去焦點',
        description: '當元素失去焦點時觸發，不冒泡',
        bubbles: false,
        cancelable: false,
        useCase: '表單驗證、自動保存'
      },
      'focusin': {
        name: 'focusin - 獲得焦點（冒泡）',
        description: '與 focus 相同，但會冒泡，可用於事件委託',
        bubbles: true,
        cancelable: false,
        useCase: '父容器監聽子元素焦點'
      },
      'focusout': {
        name: 'focusout - 失去焦點（冒泡）',
        description: '與 blur 相同，但會冒泡',
        bubbles: true,
        cancelable: false,
        useCase: '父容器監聽子元素失焦'
      },
      'select': {
        name: 'select - 選中文本',
        description: '當用戶選中文本時觸發',
        bubbles: true,
        cancelable: false,
        useCase: '文本編輯器、複製提示'
      },
      'invalid': {
        name: 'invalid - 驗證失敗',
        description: '當 HTML5 表單驗證失敗時觸發（需在捕獲階段監聽）',
        bubbles: false,
        cancelable: true,
        useCase: '自定義驗證提示'
      },

      // 🎨 拖放事件
      'dragstart': {
        name: 'dragstart - 開始拖動',
        description: '當用戶開始拖動元素時觸發，設置 dataTransfer',
        bubbles: true,
        cancelable: true,
        useCase: '拖放拼圖、文件拖拽、排序'
      },
      'drag': {
        name: 'drag - 拖動中',
        description: '當元素被拖動時持續觸發（高頻）',
        bubbles: true,
        cancelable: true,
        useCase: '拖動過程的視覺反饋'
      },
      'dragend': {
        name: 'dragend - 拖動結束',
        description: '當拖動操作結束時觸發（無論成功或取消）',
        bubbles: true,
        cancelable: false,
        useCase: '清理拖動狀態'
      },
      'dragenter': {
        name: 'dragenter - 拖入目標',
        description: '當被拖動元素進入放置目標時觸發',
        bubbles: true,
        cancelable: true,
        useCase: '高亮放置區域'
      },
      'dragover': {
        name: 'dragover - 在目標上方',
        description: '當被拖動元素在放置目標上方時持續觸發，必須 preventDefault 才能 drop',
        bubbles: true,
        cancelable: true,
        useCase: '允許放置，設置 dropEffect'
      },
      'dragleave': {
        name: 'dragleave - 離開目標',
        description: '當被拖動元素離開放置目標時觸發',
        bubbles: true,
        cancelable: true,
        useCase: '移除高亮'
      },
      'drop': {
        name: 'drop - 放下',
        description: '當被拖動元素在放置目標上放下時觸發，獲取 dataTransfer',
        bubbles: true,
        cancelable: true,
        useCase: '執行放置邏輯'
      },

      // 📱 觸摸事件
      'touchstart': {
        name: 'touchstart - 觸摸開始',
        description: '當手指觸摸屏幕時觸發，event.touches 包含觸摸點',
        bubbles: true,
        cancelable: true,
        useCase: '移動端拖拽、手勢識別'
      },
      'touchmove': {
        name: 'touchmove - 觸摸移動',
        description: '當手指在屏幕上移動時持續觸發',
        bubbles: true,
        cancelable: true,
        useCase: '滑動操作、繪圖'
      },
      'touchend': {
        name: 'touchend - 觸摸結束',
        description: '當手指離開屏幕時觸發',
        bubbles: true,
        cancelable: true,
        useCase: '完成觸摸操作'
      },
      'touchcancel': {
        name: 'touchcancel - 觸摸取消',
        description: '當觸摸被系統中斷時觸發（如來電）',
        bubbles: true,
        cancelable: false,
        useCase: '清理觸摸狀態'
      },

      // 🪟 窗口/文檔事件
      'load': {
        name: 'load - 資源加載完成',
        description: '當整個頁面及所有資源（圖片、腳本等）加載完成時觸發',
        bubbles: false,
        cancelable: false,
        useCase: '頁面初始化、圖片加載檢測'
      },
      'DOMContentLoaded': {
        name: 'DOMContentLoaded - DOM 解析完成',
        description: '當 DOM 完全解析完成時觸發，早於 load（不等資源）',
        bubbles: true,
        cancelable: false,
        useCase: 'DOM 操作初始化（推薦）'
      },
      'resize': {
        name: 'resize - 窗口大小改變',
        description: '當窗口大小改變時觸發（高頻，建議防抖）',
        bubbles: false,
        cancelable: false,
        useCase: '響應式布局調整'
      },
      'scroll': {
        name: 'scroll - 滾動',
        description: '當元素或窗口滾動時觸發（高頻，建議節流）',
        bubbles: false,
        cancelable: false,
        useCase: '無限滾動、返回頂部按鈕'
      },
      'beforeunload': {
        name: 'beforeunload - 即將離開頁面',
        description: '當用戶即將離開頁面時觸發，可提示保存',
        bubbles: false,
        cancelable: true,
        useCase: '未保存提醒'
      },
      'unload': {
        name: 'unload - 頁面卸載',
        description: '當頁面卸載時觸發',
        bubbles: false,
        cancelable: false,
        useCase: '清理資源、發送統計'
      },

      // 🎬 動畫/過渡事件
      'animationstart': {
        name: 'animationstart - CSS 動畫開始',
        description: '當 CSS 動畫開始時觸發，event.animationName 為動畫名稱',
        bubbles: true,
        cancelable: false,
        useCase: '動畫開始回調'
      },
      'animationend': {
        name: 'animationend - CSS 動畫結束',
        description: '當 CSS 動畫結束時觸發',
        bubbles: true,
        cancelable: false,
        useCase: '動畫結束後執行操作'
      },
      'animationiteration': {
        name: 'animationiteration - CSS 動畫重複',
        description: '當 CSS 動畫重複一次時觸發',
        bubbles: true,
        cancelable: false,
        useCase: '循環動畫計數'
      },
      'transitionend': {
        name: 'transitionend - CSS 過渡結束',
        description: '當 CSS transition 完成時觸發，event.propertyName 為屬性名',
        bubbles: true,
        cancelable: true,
        useCase: '過渡完成後續操作'
      },

      // 📋 剪貼板事件
      'copy': {
        name: 'copy - 複製',
        description: '當用戶複製內容時觸發，可通過 event.clipboardData 自定義',
        bubbles: true,
        cancelable: true,
        useCase: '自定義複製內容'
      },
      'cut': {
        name: 'cut - 剪切',
        description: '當用戶剪切內容時觸發',
        bubbles: true,
        cancelable: true,
        useCase: '攔截剪切操作'
      },
      'paste': {
        name: 'paste - 粘貼',
        description: '當用戶粘貼內容時觸發，可獲取 clipboardData',
        bubbles: true,
        cancelable: true,
        useCase: '自定義粘貼處理'
      },

      // 🎥 媒體事件
      'play': {
        name: 'play - 播放',
        description: '當音頻/視頻開始播放時觸發',
        bubbles: false,
        cancelable: false,
        useCase: '視頻播放統計'
      },
      'pause': {
        name: 'pause - 暫停',
        description: '當音頻/視頻暫停時觸發',
        bubbles: false,
        cancelable: false,
        useCase: '暫停時顯示控件'
      },
      'ended': {
        name: 'ended - 播放結束',
        description: '當音頻/視頻播放完畢時觸發',
        bubbles: false,
        cancelable: false,
        useCase: '自動播放下一個'
      },
      'volumechange': {
        name: 'volumechange - 音量改變',
        description: '當音量改變時觸發',
        bubbles: false,
        cancelable: false,
        useCase: '同步音量控件'
      },
      'timeupdate': {
        name: 'timeupdate - 播放時間更新',
        description: '播放時持續觸發，更新 currentTime',
        bubbles: false,
        cancelable: false,
        useCase: '進度條更新'
      },
      'loadeddata': {
        name: 'loadeddata - 數據加載',
        description: '當媒體數據加載完成時觸發',
        bubbles: false,
        cancelable: false,
        useCase: '顯示播放器'
      },
      'canplay': {
        name: 'canplay - 可以播放',
        description: '當瀏覽器可以開始播放時觸發',
        bubbles: false,
        cancelable: false,
        useCase: '隱藏加載動畫'
      },
      'seeking': {
        name: 'seeking - 跳轉中',
        description: '當用戶拖動進度條時觸發',
        bubbles: false,
        cancelable: false,
        useCase: '顯示緩衝'
      },

      // 🌐 網絡/其他事件
      'error': {
        name: 'error - 資源加載錯誤',
        description: '當資源加載失敗時觸發（圖片、腳本等）',
        bubbles: false,
        cancelable: false,
        useCase: '顯示錯誤占位圖'
      },
      'abort': {
        name: 'abort - 資源加載中止',
        description: '當資源加載被中止時觸發',
        bubbles: false,
        cancelable: false,
        useCase: '清理加載狀態'
      },
      'online': {
        name: 'online - 恢復網絡連接',
        description: '當網絡從離線恢復時觸發',
        bubbles: false,
        cancelable: false,
        useCase: '重新連接、同步數據'
      },
      'offline': {
        name: 'offline - 失去網絡連接',
        description: '當網絡斷開時觸發',
        bubbles: false,
        cancelable: false,
        useCase: '顯示離線提示'
      },
      'storage': {
        name: 'storage - LocalStorage 改變',
        description: '當 localStorage 在其他標籤頁改變時觸發',
        bubbles: false,
        cancelable: false,
        useCase: '多標籤頁同步'
      },
      'message': {
        name: 'message - postMessage 接收',
        description: '當收到 postMessage 消息時觸發',
        bubbles: false,
        cancelable: false,
        useCase: 'iframe 通信、Web Worker'
      },
      'hashchange': {
        name: 'hashchange - URL hash 改變',
        description: '當 URL 的 hash 部分改變時觸發',
        bubbles: false,
        cancelable: false,
        useCase: '單頁應用路由'
      },
      'popstate': {
        name: 'popstate - 歷史記錄改變',
        description: '當瀏覽器前進/後退時觸發',
        bubbles: false,
        cancelable: false,
        useCase: 'SPA 路由管理'
      }
    };
  }
}
