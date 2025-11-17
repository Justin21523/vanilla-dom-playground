/**
 * 工具列模組 - 處理新增元素、撤銷重做、清空等操作
 */

import { eventBus } from '../core/eventBus.js';
import { appState } from '../core/state.js';
import { $ } from '../core/domUtils.js';

export class Toolbar {
  constructor() {
    this.toolbar = $('#toolbar');
    this.init();
  }

  init() {
    // 取得 undo/redo 按鈕
    this.undoBtn = $('[data-action="undo"]', this.toolbar);
    this.redoBtn = $('[data-action="redo"]', this.toolbar);

    // 監聽工具列按鈕點擊
    this.toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) {
        const action = btn.dataset.action;
        this.handleAction(action);
      }
    });

    // 監聽設定切換
    this.toolbar.addEventListener('change', (e) => {
      const input = e.target.closest('[data-setting]');
      if (input && input.type === 'checkbox') {
        const setting = input.dataset.setting;
        appState.updateSettings(setting, input.checked);
      }
    });

    // 訂閱歷史記錄變更
    eventBus.subscribe('history/changed', (info) => {
      this.updateUndoRedoButtons(info);
    });

    // 初始化按鈕狀態
    this.updateUndoRedoButtons(appState.history.getInfo());
  }

  /**
   * 處理工具列動作
   */
  handleAction(action) {
    switch (action) {
      case 'new-project':
        if (window.projectManager) {
          window.projectManager.newProject();
        }
        break;

      case 'save-project':
        if (window.projectManager) {
          window.projectManager.openModal('save');
        }
        break;

      case 'load-project':
        if (window.projectManager) {
          window.projectManager.openModal('load');
        }
        break;

      case 'add-div':
        this.addElement('div');
        break;

      case 'add-button':
        this.addElement('button');
        break;

      case 'add-p':
        this.addElement('p');
        break;

      case 'add-input':
        this.addElement('input');
        break;

      case 'add-img':
        this.addElement('img');
        break;

      case 'undo':
        eventBus.publish('history/undo');
        break;

      case 'redo':
        eventBus.publish('history/redo');
        break;

      case 'clear':
        this.clearStage();
        break;

      default:
        console.log('未知動作:', action);
    }
  }

  /**
   * 新增元素
   */
  addElement(tag) {
    // 計算預設位置（稍微偏移避免重疊）
    const count = appState.elements.size;
    const offset = count * 20;

    const defaultProps = {
      x: 100 + offset,
      y: 100 + offset,
      w: this.getDefaultWidth(tag),
      h: this.getDefaultHeight(tag)
    };

    // 根據標籤設定預設屬性
    if (tag === 'button') {
      defaultProps.attrs = { textContent: 'Button' };
      defaultProps.style = {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: 'pointer'
      };
    } else if (tag === 'p') {
      defaultProps.attrs = { textContent: '這是一段文字' };
      defaultProps.style = {
        padding: '8px'
      };
    } else if (tag === 'input') {
      defaultProps.attrs = {
        type: 'text',
        placeholder: '請輸入文字'
      };
      defaultProps.style = {
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px'
      };
    } else if (tag === 'img') {
      defaultProps.attrs = {
        src: 'https://via.placeholder.com/150',
        alt: '圖片'
      };
      defaultProps.w = 150;
      defaultProps.h = 150;
    } else if (tag === 'div') {
      defaultProps.style = {
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '4px'
      };
    }

    // 透過 state 新增元素（會發出 stage/element/created 事件）
    appState.addElement(tag, defaultProps);
  }

  /**
   * 取得預設寬度
   */
  getDefaultWidth(tag) {
    const widths = {
      'div': 160,
      'button': 120,
      'p': 200,
      'input': 200,
      'img': 150
    };
    return widths[tag] || 160;
  }

  /**
   * 取得預設高度
   */
  getDefaultHeight(tag) {
    const heights = {
      'div': 100,
      'button': 40,
      'p': 60,
      'input': 40,
      'img': 150
    };
    return heights[tag] || 60;
  }

  /**
   * 清空畫布
   */
  clearStage() {
    if (appState.elements.size === 0) return;

    if (confirm('確定要清空畫布嗎？此操作無法復原。')) {
      // 刪除所有元素
      const ids = Array.from(appState.elements.keys());
      ids.forEach(id => appState.deleteElement(id));
    }
  }

  /**
   * 更新撤銷/重做按鈕狀態
   */
  updateUndoRedoButtons(info) {
    if (!this.undoBtn || !this.redoBtn) return;

    // 更新 Undo 按鈕
    this.undoBtn.disabled = !info.canUndo;
    if (info.canUndo && info.lastUndo) {
      this.undoBtn.title = `復原: ${info.lastUndo}`;
    } else {
      this.undoBtn.title = '復原 (Ctrl+Z)';
    }

    // 更新 Redo 按鈕
    this.redoBtn.disabled = !info.canRedo;
    if (info.canRedo && info.lastRedo) {
      this.redoBtn.title = `重做: ${info.lastRedo}`;
    } else {
      this.redoBtn.title = '重做 (Ctrl+Shift+Z)';
    }
  }
}
