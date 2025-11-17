/**
 * 狀態管理 - 集中管理應用程式狀態
 * MVP 階段僅使用記憶體儲存
 */

import { eventBus } from './eventBus.js';
import {
  HistoryManager,
  AddElementCommand,
  DeleteElementCommand,
  UpdateElementCommand,
  DuplicateElementsCommand,
  ZOrderCommand
} from './history.js';

/**
 * 產生唯一 ID
 */
function generateId(prefix = 'el') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 建立新元素節點
 */
function createElementNode(tag, initialProps = {}) {
  return {
    id: generateId(tag),
    tag,
    attrs: {},
    style: {},
    classes: new Set(),
    events: {},
    animations: null,
    transform: {},
    frame: {
      x: initialProps.x || 100,
      y: initialProps.y || 100,
      w: initialProps.w || 160,
      h: initialProps.h || 60
    },
    ...initialProps
  };
}

class AppState {
  constructor() {
    // 所有元素：Map<id, ElementNode>
    this.elements = new Map();

    // Z 軸順序（最後面的在最上層）
    this.zOrder = [];

    // 已選取的元素 ID
    this.selected = new Set();

    // 應用程式設定
    this.settings = {
      snapToGrid: false,
      gridSize: 10,
      showGuides: true,
      theme: 'light',
      units: 'px',
      codegenMode: 'minimal'
    };

    // 歷史記錄管理器
    this.history = new HistoryManager(50);

    // 訂閱 history 事件
    eventBus.subscribe('history/undo', () => this.history.undo());
    eventBus.subscribe('history/redo', () => this.history.redo());
  }

  /**
   * 新增元素 (透過命令模式)
   */
  addElement(tag, props = {}) {
    const elementData = {
      tag,
      ...props
    };
    const command = new AddElementCommand(this, elementData);
    this.history.execute(command);
    return this.getElement(command.elementId);
  }

  /**
   * 直接新增元素 (不記錄歷史，由 Command 呼叫)
   */
  addElementDirect(elementData) {
    const element = createElementNode(elementData.tag, elementData);

    // 如果有指定 id (用於 undo)，使用指定的 id
    if (elementData.id) {
      element.id = elementData.id;
    }

    this.elements.set(element.id, element);
    this.zOrder.push(element.id);

    eventBus.publish('stage/element/created', { id: element.id });
    return element;
  }

  /**
   * 刪除元素 (透過命令模式)
   */
  deleteElement(id) {
    if (!this.elements.has(id)) return;

    const command = new DeleteElementCommand(this, id);
    this.history.execute(command);
  }

  /**
   * 直接刪除元素 (不記錄歷史，由 Command 呼叫)
   */
  deleteElementDirect(id) {
    if (!this.elements.has(id)) return;

    this.elements.delete(id);
    this.zOrder = this.zOrder.filter(eid => eid !== id);
    this.selected.delete(id);

    eventBus.publish('stage/element/deleted', { id });
  }

  /**
   * 取得元素
   */
  getElement(id) {
    return this.elements.get(id);
  }

  /**
   * 更新元素屬性 (透過命令模式)
   */
  updateElement(id, changes) {
    const element = this.elements.get(id);
    if (!element) return;

    const command = new UpdateElementCommand(this, id, changes);
    this.history.execute(command);
  }

  /**
   * 直接更新元素屬性 (不記錄歷史，由 Command 呼叫)
   */
  updateElementDirect(id, changes) {
    const element = this.elements.get(id);
    if (!element) return;

    // 合併變更
    if (changes.style) {
      element.style = { ...element.style, ...changes.style };
    }
    if (changes.attrs) {
      element.attrs = { ...element.attrs, ...changes.attrs };
    }
    if (changes.frame) {
      element.frame = { ...element.frame, ...changes.frame };
    }
    if (changes.classes) {
      element.classes = new Set(changes.classes);
    }
    if (changes.events) {
      element.events = { ...element.events, ...changes.events };
    }
    if (changes.animations !== undefined) {
      element.animations = changes.animations;
    }

    eventBus.publish('stage/element/updated', { id, changes });
  }

  /**
   * 選取元素
   */
  selectElement(id, multiSelect = false) {
    if (!multiSelect) {
      this.selected.clear();
    }

    if (id) {
      this.selected.add(id);
    }

    eventBus.publish('stage/element/selected', {
      ids: Array.from(this.selected)
    });
  }

  /**
   * 取消選取
   */
  clearSelection() {
    this.selected.clear();
    eventBus.publish('stage/element/selected', { ids: [] });
  }

  /**
   * 取得已選取的元素
   */
  getSelectedElements() {
    return Array.from(this.selected).map(id => this.getElement(id));
  }

  /**
   * 更新設定
   */
  updateSettings(key, value) {
    this.settings[key] = value;
    eventBus.publish('app/settings/change', { key, value });
  }

  /**
   * 取得所有元素（依 Z 軸順序）
   */
  getElementsInOrder() {
    return this.zOrder.map(id => this.getElement(id));
  }

  /**
   * 複製元素 (透過命令模式)
   */
  duplicateElements(ids) {
    const command = new DuplicateElementsCommand(this, ids);
    this.history.execute(command);
    const newIds = command.newElementIds;

    // 選取新建立的元素
    if (newIds.length > 0) {
      this.clearSelection();
      newIds.forEach(id => this.selectElement(id, true));
    }

    return newIds;
  }

  /**
   * 直接複製元素 (不記錄歷史，由 Command 呼叫)
   */
  duplicateElementsDirect(ids) {
    const newIds = [];

    ids.forEach(id => {
      const original = this.getElement(id);
      if (!original) return;

      // 複製元素（稍微偏移）
      const props = {
        tag: original.tag,
        attrs: { ...original.attrs },
        style: { ...original.style },
        classes: new Set(original.classes),
        events: { ...original.events },
        animations: original.animations ? { ...original.animations } : null,
        transform: { ...original.transform },
        x: original.frame.x + 20,
        y: original.frame.y + 20,
        w: original.frame.w,
        h: original.frame.h
      };

      const newElement = this.addElementDirect(props);
      newIds.push(newElement.id);
    });

    return newIds;
  }

  /**
   * 將元素移到最上層 (透過命令模式)
   */
  bringToFront(id) {
    const command = new ZOrderCommand(this, 'toFront', [id]);
    this.history.execute(command);
  }

  /**
   * 直接將元素移到最上層 (不記錄歷史，由 Command 呼叫)
   */
  bringToFrontDirect(id) {
    const index = this.zOrder.indexOf(id);
    if (index === -1 || index === this.zOrder.length - 1) return;

    this.zOrder.splice(index, 1);
    this.zOrder.push(id);

    eventBus.publish('stage/element/zorder-changed', { id });
  }

  /**
   * 將元素移到最下層 (透過命令模式)
   */
  sendToBack(id) {
    const command = new ZOrderCommand(this, 'toBack', [id]);
    this.history.execute(command);
  }

  /**
   * 直接將元素移到最下層 (不記錄歷史，由 Command 呼叫)
   */
  sendToBackDirect(id) {
    const index = this.zOrder.indexOf(id);
    if (index === -1 || index === 0) return;

    this.zOrder.splice(index, 1);
    this.zOrder.unshift(id);

    eventBus.publish('stage/element/zorder-changed', { id });
  }

  /**
   * 將元素上移一層 (透過命令模式)
   */
  bringForward(id) {
    const command = new ZOrderCommand(this, 'forward', [id]);
    this.history.execute(command);
  }

  /**
   * 直接將元素上移一層 (不記錄歷史，由 Command 呼叫)
   */
  bringForwardDirect(id) {
    const index = this.zOrder.indexOf(id);
    if (index === -1 || index === this.zOrder.length - 1) return;

    [this.zOrder[index], this.zOrder[index + 1]] = [this.zOrder[index + 1], this.zOrder[index]];

    eventBus.publish('stage/element/zorder-changed', { id });
  }

  /**
   * 將元素下移一層 (透過命令模式)
   */
  sendBackward(id) {
    const command = new ZOrderCommand(this, 'backward', [id]);
    this.history.execute(command);
  }

  /**
   * 直接將元素下移一層 (不記錄歷史，由 Command 呼叫)
   */
  sendBackwardDirect(id) {
    const index = this.zOrder.indexOf(id);
    if (index === -1 || index === 0) return;

    [this.zOrder[index], this.zOrder[index - 1]] = [this.zOrder[index - 1], this.zOrder[index]];

    eventBus.publish('stage/element/zorder-changed', { id });
  }

  /**
   * 序列化狀態為 JSON
   */
  serialize() {
    const elements = [];
    this.zOrder.forEach(id => {
      const element = this.elements.get(id);
      if (element) {
        // 將 Set 轉換為 Array
        const serialized = {
          ...element,
          classes: Array.from(element.classes || [])
        };
        elements.push(serialized);
      }
    });

    return {
      version: '1.0',
      timestamp: Date.now(),
      elements,
      zOrder: this.zOrder,
      settings: this.settings
    };
  }

  /**
   * 從 JSON 反序列化狀態
   */
  deserialize(data) {
    // 清空現有狀態
    this.elements.clear();
    this.zOrder = [];
    this.selected.clear();

    // 恢復元素
    if (data.elements && Array.isArray(data.elements)) {
      data.elements.forEach(elementData => {
        // 將 Array 轉回 Set
        if (elementData.classes && Array.isArray(elementData.classes)) {
          elementData.classes = new Set(elementData.classes);
        } else {
          elementData.classes = new Set();
        }

        this.elements.set(elementData.id, elementData);
      });
    }

    // 恢復 z-order
    if (data.zOrder && Array.isArray(data.zOrder)) {
      this.zOrder = [...data.zOrder];
    }

    // 恢復設定
    if (data.settings) {
      this.settings = { ...this.settings, ...data.settings };
    }

    // 清空歷史
    this.history.clear();

    // 發布重建事件
    eventBus.publish('app/state/restored', {});
  }

  /**
   * 儲存到 LocalStorage
   */
  save(projectName = 'default') {
    try {
      const data = this.serialize();
      const key = `vdp_project_${projectName}`;
      localStorage.setItem(key, JSON.stringify(data));

      // 更新項目列表
      this.updateProjectList(projectName);

      eventBus.publish('app/project/saved', { projectName, timestamp: data.timestamp });
      return true;
    } catch (error) {
      console.error('保存失敗:', error);
      eventBus.publish('app/project/save-failed', { error: error.message });
      return false;
    }
  }

  /**
   * 從 LocalStorage 載入
   */
  load(projectName = 'default') {
    try {
      const key = `vdp_project_${projectName}`;
      const json = localStorage.getItem(key);

      if (!json) {
        throw new Error('項目不存在');
      }

      const data = JSON.parse(json);
      this.deserialize(data);

      eventBus.publish('app/project/loaded', { projectName, timestamp: data.timestamp });
      return true;
    } catch (error) {
      console.error('載入失敗:', error);
      eventBus.publish('app/project/load-failed', { error: error.message });
      return false;
    }
  }

  /**
   * 更新項目列表
   */
  updateProjectList(projectName) {
    try {
      const listKey = 'vdp_project_list';
      let list = JSON.parse(localStorage.getItem(listKey) || '[]');

      // 移除舊記錄（如果存在）
      list = list.filter(p => p.name !== projectName);

      // 添加新記錄
      list.unshift({
        name: projectName,
        timestamp: Date.now(),
        elementCount: this.elements.size
      });

      // 限制列表長度為 20
      list = list.slice(0, 20);

      localStorage.setItem(listKey, JSON.stringify(list));
    } catch (error) {
      console.error('更新項目列表失敗:', error);
    }
  }

  /**
   * 取得項目列表
   */
  getProjectList() {
    try {
      const listKey = 'vdp_project_list';
      return JSON.parse(localStorage.getItem(listKey) || '[]');
    } catch (error) {
      console.error('讀取項目列表失敗:', error);
      return [];
    }
  }

  /**
   * 刪除項目
   */
  deleteProject(projectName) {
    try {
      const key = `vdp_project_${projectName}`;
      localStorage.removeItem(key);

      // 從列表中移除
      const listKey = 'vdp_project_list';
      let list = JSON.parse(localStorage.getItem(listKey) || '[]');
      list = list.filter(p => p.name !== projectName);
      localStorage.setItem(listKey, JSON.stringify(list));

      eventBus.publish('app/project/deleted', { projectName });
      return true;
    } catch (error) {
      console.error('刪除項目失敗:', error);
      return false;
    }
  }

  /**
   * 匯出為 JSON 檔案
   */
  exportToFile(projectName = 'my-project') {
    const data = this.serialize();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * 從檔案匯入
   */
  importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          this.deserialize(data);
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('檔案讀取失敗'));
      reader.readAsText(file);
    });
  }

  /**
   * 清空所有資料（新建項目）
   */
  clear() {
    this.elements.clear();
    this.zOrder = [];
    this.selected.clear();
    this.history.clear();

    eventBus.publish('app/state/cleared', {});
  }
}

// 匯出單一實例
export const appState = new AppState();
