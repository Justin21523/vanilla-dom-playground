/**
 * 歷史管理器 - 實現 Undo/Redo 功能
 * 使用 Command 模式
 */

import { eventBus } from './eventBus.js';

/**
 * Command 基礎類
 */
class Command {
  constructor() {
    this.timestamp = Date.now();
  }

  execute() {
    throw new Error('execute() must be implemented');
  }

  undo() {
    throw new Error('undo() must be implemented');
  }

  getDescription() {
    return 'Unknown command';
  }
}

/**
 * 新增元素命令
 */
export class AddElementCommand extends Command {
  constructor(appState, elementData) {
    super();
    this.appState = appState;
    this.elementData = elementData;
    this.elementId = null;
  }

  execute() {
    const element = this.appState.addElementDirect(this.elementData);
    this.elementId = element.id;
    return element;
  }

  undo() {
    if (this.elementId) {
      this.appState.deleteElementDirect(this.elementId);
    }
  }

  getDescription() {
    return `新增 ${this.elementData.tag} 元素`;
  }
}

/**
 * 刪除元素命令
 */
export class DeleteElementCommand extends Command {
  constructor(appState, elementId) {
    super();
    this.appState = appState;
    this.elementId = elementId;
    this.elementData = null;
    this.elementIndex = -1;
  }

  execute() {
    // 儲存元素資料以便 undo
    this.elementData = JSON.parse(JSON.stringify(this.appState.getElement(this.elementId)));
    this.elementIndex = this.appState.zOrder.indexOf(this.elementId);
    this.appState.deleteElementDirect(this.elementId);
  }

  undo() {
    if (this.elementData) {
      // 將 Set 轉回來
      if (this.elementData.classes && Array.isArray(this.elementData.classes)) {
        this.elementData.classes = new Set(this.elementData.classes);
      } else if (this.elementData.classes) {
        this.elementData.classes = new Set();
      }

      this.appState.addElementDirect(this.elementData);

      // 恢復 z-order 位置
      if (this.elementIndex >= 0) {
        const currentIndex = this.appState.zOrder.indexOf(this.elementId);
        if (currentIndex !== -1) {
          this.appState.zOrder.splice(currentIndex, 1);
          this.appState.zOrder.splice(this.elementIndex, 0, this.elementId);
          eventBus.publish('stage/element/zorder-changed', {});
        }
      }
    }
  }

  getDescription() {
    return `刪除元素 ${this.elementId}`;
  }
}

/**
 * 更新元素命令
 */
export class UpdateElementCommand extends Command {
  constructor(appState, elementId, changes) {
    super();
    this.appState = appState;
    this.elementId = elementId;
    this.changes = changes;
    this.oldValues = {};
  }

  execute() {
    const element = this.appState.getElement(this.elementId);
    if (!element) return;

    // 儲存舊值
    Object.keys(this.changes).forEach(key => {
      if (key === 'frame' || key === 'style' || key === 'attrs') {
        this.oldValues[key] = JSON.parse(JSON.stringify(element[key]));
      } else {
        this.oldValues[key] = element[key];
      }
    });

    this.appState.updateElementDirect(this.elementId, this.changes);
  }

  undo() {
    if (Object.keys(this.oldValues).length > 0) {
      this.appState.updateElementDirect(this.elementId, this.oldValues);
    }
  }

  getDescription() {
    const changeTypes = Object.keys(this.changes).join(', ');
    return `更新元素 (${changeTypes})`;
  }
}

/**
 * 複製元素命令
 */
export class DuplicateElementsCommand extends Command {
  constructor(appState, elementIds) {
    super();
    this.appState = appState;
    this.elementIds = elementIds;
    this.newElementIds = [];
  }

  execute() {
    this.newElementIds = this.appState.duplicateElementsDirect(this.elementIds);
    return this.newElementIds;
  }

  undo() {
    this.newElementIds.forEach(id => {
      this.appState.deleteElementDirect(id);
    });
    this.newElementIds = [];
  }

  getDescription() {
    return `複製 ${this.elementIds.length} 個元素`;
  }
}

/**
 * Z-Order 命令
 */
export class ZOrderCommand extends Command {
  constructor(appState, action, elementIds) {
    super();
    this.appState = appState;
    this.action = action; // 'toFront', 'toBack', 'forward', 'backward'
    this.elementIds = elementIds;
    this.oldZOrder = null;
  }

  execute() {
    // 儲存舊的 z-order
    this.oldZOrder = [...this.appState.zOrder];

    switch (this.action) {
      case 'toFront':
        this.elementIds.forEach(id => this.appState.bringToFrontDirect(id));
        break;
      case 'toBack':
        this.elementIds.forEach(id => this.appState.sendToBackDirect(id));
        break;
      case 'forward':
        this.elementIds.forEach(id => this.appState.bringForwardDirect(id));
        break;
      case 'backward':
        this.elementIds.forEach(id => this.appState.sendBackwardDirect(id));
        break;
    }
  }

  undo() {
    if (this.oldZOrder) {
      this.appState.zOrder = [...this.oldZOrder];
      eventBus.publish('stage/element/zorder-changed', {});
    }
  }

  getDescription() {
    const actionMap = {
      'toFront': '移到最前',
      'toBack': '移到最後',
      'forward': '向前一層',
      'backward': '向後一層'
    };
    return `${actionMap[this.action]} (${this.elementIds.length} 個元素)`;
  }
}

/**
 * 歷史管理器
 */
export class HistoryManager {
  constructor(maxHistory = 50) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = maxHistory;
    this.isExecuting = false; // 防止遞迴
  }

  /**
   * 執行命令並加入歷史
   */
  execute(command) {
    if (this.isExecuting) return;

    this.isExecuting = true;
    try {
      command.execute();

      // 加入 undo stack
      this.undoStack.push(command);

      // 限制歷史數量
      if (this.undoStack.length > this.maxHistory) {
        this.undoStack.shift();
      }

      // 清空 redo stack
      this.redoStack = [];

      // 發布事件
      this.notifyChange();
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * 撤銷
   */
  undo() {
    if (!this.canUndo()) return false;

    this.isExecuting = true;
    try {
      const command = this.undoStack.pop();
      command.undo();
      this.redoStack.push(command);
      this.notifyChange();
      return true;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * 重做
   */
  redo() {
    if (!this.canRedo()) return false;

    this.isExecuting = true;
    try {
      const command = this.redoStack.pop();
      command.execute();
      this.undoStack.push(command);
      this.notifyChange();
      return true;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * 檢查是否可以撤銷
   */
  canUndo() {
    return this.undoStack.length > 0;
  }

  /**
   * 檢查是否可以重做
   */
  canRedo() {
    return this.redoStack.length > 0;
  }

  /**
   * 清空歷史
   */
  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.notifyChange();
  }

  /**
   * 取得歷史資訊
   */
  getInfo() {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      lastUndo: this.undoStack.length > 0 ?
        this.undoStack[this.undoStack.length - 1].getDescription() : null,
      lastRedo: this.redoStack.length > 0 ?
        this.redoStack[this.redoStack.length - 1].getDescription() : null
    };
  }

  /**
   * 通知變更
   */
  notifyChange() {
    eventBus.publish('history/changed', this.getInfo());
  }
}
