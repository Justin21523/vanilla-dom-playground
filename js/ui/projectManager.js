/**
 * 項目管理器 - 管理保存、載入、匯出、匯入項目
 */

import { eventBus } from '../core/eventBus.js';
import { appState } from '../core/state.js';
import { $, createElement } from '../core/domUtils.js';

export class ProjectManager {
  constructor() {
    this.modal = null;
    this.currentProjectName = 'untitled';
    this.autoSaveEnabled = true;
    this.autoSaveTimeout = null;
    this.autoSaveDelay = 3000; // 3 秒後自動保存
    this.init();
  }

  init() {
    // 創建模態框
    this.createModal();

    // 檢查自動保存
    this.checkAutoSave();

    // 監聽保存/載入事件
    eventBus.subscribe('app/project/saved', ({ projectName }) => {
      this.currentProjectName = projectName;
      this.showNotification(`項目 "${projectName}" 已保存`, 'success');
      this.updateTitle();
    });

    eventBus.subscribe('app/project/loaded', ({ projectName }) => {
      this.currentProjectName = projectName;
      this.showNotification(`項目 "${projectName}" 已載入`, 'success');
      this.updateTitle();
    });

    eventBus.subscribe('app/project/save-failed', ({ error }) => {
      this.showNotification(`保存失敗: ${error}`, 'error');
    });

    eventBus.subscribe('app/project/load-failed', ({ error }) => {
      this.showNotification(`載入失敗: ${error}`, 'error');
    });

    // 監聽狀態變更以觸發自動保存
    eventBus.subscribe('stage/element/created', () => {
      this.scheduleAutoSave();
    });

    eventBus.subscribe('stage/element/deleted', () => {
      this.scheduleAutoSave();
    });

    eventBus.subscribe('stage/element/updated', () => {
      this.scheduleAutoSave();
    });

    eventBus.subscribe('stage/element/zorder-changed', () => {
      this.scheduleAutoSave();
    });

    // 監聽鍵盤快捷鍵 Ctrl+S / Cmd+S
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.quickSave();
      }
    });

    // 更新標題
    this.updateTitle();
  }

  /**
   * 創建模態框
   */
  createModal() {
    this.modal = createElement('div', {
      className: 'project-modal',
      style: { display: 'none' },
      children: [
        this.overlay = createElement('div', {
          className: 'project-modal-overlay',
          onclick: () => this.closeModal()
        }),
        this.content = createElement('div', {
          className: 'project-modal-content',
          children: [
            createElement('div', {
              className: 'project-modal-header',
              children: [
                createElement('h2', { textContent: '項目管理', className: 'project-modal-title' }),
                createElement('button', {
                  className: 'project-modal-close',
                  textContent: '×',
                  onclick: () => this.closeModal()
                })
              ]
            }),
            this.modalBody = createElement('div', { className: 'project-modal-body' })
          ]
        })
      ]
    });

    document.body.appendChild(this.modal);
  }

  /**
   * 打開模態框
   */
  openModal(mode = 'save') {
    this.modal.style.display = 'flex';
    this.renderModalContent(mode);
  }

  /**
   * 關閉模態框
   */
  closeModal() {
    this.modal.style.display = 'none';
  }

  /**
   * 渲染模態框內容
   */
  renderModalContent(mode) {
    this.modalBody.innerHTML = '';

    if (mode === 'save') {
      this.renderSaveView();
    } else if (mode === 'load') {
      this.renderLoadView();
    }
  }

  /**
   * 渲染保存視圖
   */
  renderSaveView() {
    const saveForm = createElement('div', {
      className: 'project-form',
      children: [
        createElement('label', {
          textContent: '項目名稱:',
          className: 'project-form-label'
        }),
        this.projectNameInput = createElement('input', {
          type: 'text',
          value: this.currentProjectName,
          placeholder: '輸入項目名稱',
          className: 'project-form-input'
        }),
        createElement('div', {
          className: 'project-form-actions',
          children: [
            createElement('button', {
              textContent: '保存到瀏覽器',
              className: 'btn btn-primary',
              onclick: () => this.saveToLocalStorage()
            }),
            createElement('button', {
              textContent: '匯出 JSON 檔案',
              className: 'btn',
              onclick: () => this.exportToFile()
            })
          ]
        }),
        createElement('div', {
          className: 'project-info',
          children: [
            createElement('p', {
              innerHTML: `<strong>統計資料:</strong><br>
                元素數量: ${appState.elements.size}<br>
                歷史記錄: ${appState.history.undoStack.length} 個動作`
            })
          ]
        })
      ]
    });

    this.modalBody.appendChild(saveForm);
  }

  /**
   * 渲染載入視圖
   */
  renderLoadView() {
    const projects = appState.getProjectList();

    const loadView = createElement('div', {
      className: 'project-load-view',
      children: [
        createElement('div', {
          className: 'project-load-section',
          children: [
            createElement('h3', { textContent: '從瀏覽器載入', className: 'project-section-title' }),
            projects.length === 0
              ? createElement('p', {
                  textContent: '沒有已保存的項目',
                  className: 'project-empty-hint'
                })
              : createElement('div', {
                  className: 'project-list',
                  children: projects.map(project => this.createProjectItem(project))
                })
          ]
        }),
        createElement('div', {
          className: 'project-load-section',
          children: [
            createElement('h3', { textContent: '從檔案匯入', className: 'project-section-title' }),
            createElement('input', {
              type: 'file',
              accept: '.json',
              className: 'project-file-input',
              id: 'project-file-input',
              onchange: (e) => this.importFromFile(e.target.files[0])
            }),
            createElement('label', {
              htmlFor: 'project-file-input',
              className: 'btn btn-file',
              textContent: '選擇 JSON 檔案'
            })
          ]
        })
      ]
    });

    this.modalBody.appendChild(loadView);
  }

  /**
   * 創建項目列表項
   */
  createProjectItem(project) {
    const date = new Date(project.timestamp);
    const dateStr = date.toLocaleDateString('zh-TW') + ' ' + date.toLocaleTimeString('zh-TW');

    return createElement('div', {
      className: 'project-item',
      children: [
        createElement('div', {
          className: 'project-item-info',
          children: [
            createElement('div', { textContent: project.name, className: 'project-item-name' }),
            createElement('div', {
              textContent: `${project.elementCount} 個元素 · ${dateStr}`,
              className: 'project-item-meta'
            })
          ]
        }),
        createElement('div', {
          className: 'project-item-actions',
          children: [
            createElement('button', {
              textContent: '載入',
              className: 'btn btn-sm btn-primary',
              onclick: () => this.loadFromLocalStorage(project.name)
            }),
            createElement('button', {
              textContent: '刪除',
              className: 'btn btn-sm btn-danger',
              onclick: () => this.deleteProject(project.name)
            })
          ]
        })
      ]
    });
  }

  /**
   * 快速保存 (Ctrl+S)
   */
  quickSave() {
    if (appState.elements.size === 0) {
      this.showNotification('沒有可保存的內容', 'warning');
      return;
    }

    const success = appState.save(this.currentProjectName);
    if (!success) {
      // 失敗時打開保存對話框
      this.openModal('save');
    }
  }

  /**
   * 保存到 LocalStorage
   */
  saveToLocalStorage() {
    const projectName = this.projectNameInput.value.trim();

    if (!projectName) {
      this.showNotification('請輸入項目名稱', 'warning');
      return;
    }

    const success = appState.save(projectName);
    if (success) {
      this.closeModal();
    }
  }

  /**
   * 從 LocalStorage 載入
   */
  loadFromLocalStorage(projectName) {
    if (appState.elements.size > 0) {
      if (!confirm('載入項目將會覆蓋當前內容，確定要繼續嗎？')) {
        return;
      }
    }

    const success = appState.load(projectName);
    if (success) {
      this.closeModal();
    }
  }

  /**
   * 匯出到檔案
   */
  exportToFile() {
    const projectName = this.projectNameInput.value.trim() || 'my-project';
    appState.exportToFile(projectName);
    this.showNotification(`項目已匯出為 ${projectName}.json`, 'success');
    this.closeModal();
  }

  /**
   * 從檔案匯入
   */
  async importFromFile(file) {
    if (!file) return;

    if (appState.elements.size > 0) {
      if (!confirm('匯入項目將會覆蓋當前內容，確定要繼續嗎？')) {
        return;
      }
    }

    try {
      await appState.importFromFile(file);
      this.currentProjectName = file.name.replace('.json', '');
      this.showNotification('項目匯入成功', 'success');
      this.updateTitle();
      this.closeModal();
    } catch (error) {
      this.showNotification(`匯入失敗: ${error.message}`, 'error');
    }
  }

  /**
   * 刪除項目
   */
  deleteProject(projectName) {
    if (!confirm(`確定要刪除項目 "${projectName}" 嗎？`)) {
      return;
    }

    const success = appState.deleteProject(projectName);
    if (success) {
      this.showNotification(`項目 "${projectName}" 已刪除`, 'success');
      this.renderModalContent('load'); // 重新渲染列表
    }
  }

  /**
   * 新建項目
   */
  newProject() {
    if (appState.elements.size > 0) {
      if (!confirm('新建項目將會清空當前內容，確定要繼續嗎？')) {
        return;
      }
    }

    appState.clear();
    this.currentProjectName = 'untitled';
    this.updateTitle();
    this.showNotification('已建立新項目', 'success');
  }

  /**
   * 更新標題
   */
  updateTitle() {
    const titleEl = $('#app-title');
    if (titleEl) {
      titleEl.textContent = `Vanilla DOM Playground - ${this.currentProjectName}`;
    }
  }

  /**
   * 檢查自動保存
   */
  checkAutoSave() {
    try {
      const autoSaveData = localStorage.getItem('vdp_project__autosave');
      if (!autoSaveData) return;

      const data = JSON.parse(autoSaveData);
      const timeDiff = Date.now() - data.timestamp;
      const minutes = Math.floor(timeDiff / 60000);

      // 如果自動保存是在 30 分鐘內，提示用戶恢復
      if (minutes < 30 && data.elements && data.elements.length > 0) {
        setTimeout(() => {
          const message = `發現自動保存的項目（${minutes} 分鐘前，${data.elements.length} 個元素），是否恢復？`;
          if (confirm(message)) {
            this.loadAutoSave();
          } else {
            // 清除自動保存
            localStorage.removeItem('vdp_project__autosave');
          }
        }, 500);
      }
    } catch (error) {
      console.error('檢查自動保存失敗:', error);
    }
  }

  /**
   * 載入自動保存
   */
  loadAutoSave() {
    try {
      const success = appState.load('_autosave');
      if (success) {
        this.currentProjectName = 'untitled';
        this.updateTitle();
        this.showNotification('已恢復自動保存的項目', 'success');
      }
    } catch (error) {
      this.showNotification('恢復自動保存失敗', 'error');
    }
  }

  /**
   * 安排自動保存（使用防抖）
   */
  scheduleAutoSave() {
    if (!this.autoSaveEnabled) return;

    // 清除之前的計時器
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    // 設定新的計時器
    this.autoSaveTimeout = setTimeout(() => {
      this.performAutoSave();
    }, this.autoSaveDelay);
  }

  /**
   * 執行自動保存
   */
  performAutoSave() {
    if (appState.elements.size === 0) return;

    try {
      // 保存到特殊的自動保存鍵
      const data = appState.serialize();
      localStorage.setItem('vdp_project__autosave', JSON.stringify(data));

      // 不顯示通知，靜默保存
      console.log('自動保存完成:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('自動保存失敗:', error);
    }
  }

  /**
   * 切換自動保存
   */
  toggleAutoSave(enabled) {
    this.autoSaveEnabled = enabled;
    if (enabled) {
      this.showNotification('自動保存已啟用', 'info');
    } else {
      this.showNotification('自動保存已停用', 'info');
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout);
      }
    }
  }

  /**
   * 顯示通知
   */
  showNotification(message, type = 'info') {
    // 創建通知元素
    const notification = createElement('div', {
      className: `notification notification-${type}`,
      textContent: message
    });

    // 添加到頁面
    document.body.appendChild(notification);

    // 觸發動畫
    setTimeout(() => notification.classList.add('show'), 10);

    // 3 秒後移除
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}
