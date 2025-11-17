/**
 * 主入口 - 初始化所有模組
 */

import { Toolbar } from './ui/toolbar.js';
import { Stage } from './stage/stage.js';
import { Selection } from './stage/selection.js';
import { PropertiesPanel } from './panels/propertiesPanel.js';
import { EventsPanel } from './panels/eventsPanel.js';
import { AnimationsPanel } from './panels/animationsPanel.js';
import { CodePreview } from './ui/codePreview.js';
import { ContextMenu } from './ui/contextMenu.js';
import { EventLog } from './ui/eventLog.js';
import { ProjectManager } from './ui/projectManager.js';
import { $, $$ } from './core/domUtils.js';

class App {
  constructor() {
    this.init();
  }

  init() {
    console.log('🚀 Vanilla DOM Playground 正在啟動...');

    // 初始化工具列
    this.toolbar = new Toolbar();

    // 初始化畫布
    this.stage = new Stage();

    // 初始化選取系統
    this.selection = new Selection(this.stage);

    // 初始化屬性面板
    this.propertiesPanel = new PropertiesPanel();

    // 初始化事件面板
    this.eventsPanel = new EventsPanel(this.stage);

    // 初始化動畫面板
    this.animationsPanel = new AnimationsPanel(this.stage);

    // 初始化程式碼預覽
    this.codePreview = new CodePreview();

    // 初始化右鍵選單
    this.contextMenu = new ContextMenu();

    // 初始化事件日誌
    this.eventLog = new EventLog(this.stage);

    // 初始化項目管理器
    this.projectManager = new ProjectManager();

    // 將項目管理器匯出到全域以便工具列使用
    window.projectManager = this.projectManager;

    // 初始化面板標籤切換
    this.initPanelTabs();

    // 初始化鍵盤快捷鍵
    this.initKeyboardShortcuts();

    console.log('✅ 應用程式已啟動');
  }

  /**
   * 初始化面板標籤切換
   */
  initPanelTabs() {
    const tabs = $$('.tab-btn');
    const panels = {
      properties: $('#properties-panel'),
      events: $('#events-panel'),
      animations: $('#animations-panel')
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;

        // 更新標籤狀態
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // 切換面板顯示
        Object.entries(panels).forEach(([name, panel]) => {
          if (name === targetTab) {
            panel.style.display = 'block';
          } else {
            panel.style.display = 'none';
          }
        });
      });
    });
  }

  /**
   * 初始化鍵盤快捷鍵
   */
  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const appState = window.appState;
      if (!appState) return;

      // 方向鍵: 微調選取元素位置
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const selected = Array.from(appState.selected);
        if (selected.length > 0) {
          e.preventDefault();

          // Shift 增加移動距離
          const step = e.shiftKey ? 10 : 1;

          selected.forEach(id => {
            const element = appState.getElement(id);
            if (!element) return;

            const newFrame = { ...element.frame };

            switch (e.key) {
              case 'ArrowUp':
                newFrame.y = Math.max(0, newFrame.y - step);
                break;
              case 'ArrowDown':
                newFrame.y += step;
                break;
              case 'ArrowLeft':
                newFrame.x = Math.max(0, newFrame.x - step);
                break;
              case 'ArrowRight':
                newFrame.x += step;
                break;
            }

            appState.updateElement(id, { frame: newFrame });
          });
        }
      }

      // Delete: 刪除選取的元素
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selected = Array.from(appState.selected);
        if (selected.length > 0) {
          e.preventDefault();
          selected.forEach(id => {
            appState.deleteElement(id);
          });
        }
      }

      // Escape: 取消選取
      if (e.key === 'Escape') {
        appState.clearSelection();
      }

      // Ctrl/Cmd + D: 複製元素
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const selected = Array.from(appState.selected);
        if (selected.length > 0) {
          appState.duplicateElements(selected);
        }
      }

      // Ctrl/Cmd + Z: 撤銷
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        appState.history.undo();
      }

      // Ctrl/Cmd + Shift + Z: 重做
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        appState.history.redo();
      }
    });
  }
}

// DOM 載入完成後啟動應用程式
document.addEventListener('DOMContentLoaded', () => {
  // 匯出 appState 到全域以便除錯
  import('./core/state.js').then(({ appState }) => {
    window.appState = appState;
  });

  // 啟動應用程式
  window.app = new App();
});
