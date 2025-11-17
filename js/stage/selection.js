/**
 * 選取系統 - 顯示選取框與調整控制點
 */

import { eventBus } from '../core/eventBus.js';
import { appState } from '../core/state.js';
import { $, setStyles } from '../core/domUtils.js';
import { snapToGrid, getBoundingRect } from '../core/geometry.js';

export class Selection {
  constructor(stage) {
    this.stage = stage;
    this.selectionBox = $('#selection-box');
    this.resizeState = null;
    this.init();
  }

  init() {
    // 訂閱選取事件
    eventBus.subscribe('stage/element/selected', ({ ids }) => {
      this.updateSelectionBox(ids);
    });

    // 訂閱元素更新（拖曳時更新選取框位置）
    eventBus.subscribe('stage/element/updated', ({ id }) => {
      const selected = appState.selected;
      if (selected.has(id)) {
        this.updateSelectionBox(Array.from(selected));
      }
    });

    // 監聽調整控制點
    this.selectionBox.addEventListener('mousedown', (e) => {
      const handle = e.target.closest('[data-handle]');
      if (handle) {
        e.preventDefault();
        e.stopPropagation();
        this.startResize(handle.dataset.handle, e);
      }
    });

    document.addEventListener('mousemove', (e) => {
      this.handleResizeMove(e);
    });

    document.addEventListener('mouseup', (e) => {
      this.handleResizeEnd(e);
    });
  }

  /**
   * 更新選取框位置與尺寸
   */
  updateSelectionBox(ids) {
    if (ids.length === 0) {
      // 沒有選取，隱藏選取框
      this.selectionBox.style.display = 'none';

      // 移除所有元素的 selected class
      this.stage.elementMap.forEach(el => {
        el.classList.remove('selected');
      });
      return;
    }

    // 顯示選取框
    this.selectionBox.style.display = 'block';

    // 取得所有選取元素的框架
    const selectedElements = ids.map(id => appState.getElement(id)).filter(Boolean);
    if (selectedElements.length === 0) return;

    let frame;
    if (selectedElements.length === 1) {
      // 單選：使用元素框架
      frame = selectedElements[0].frame;
    } else {
      // 多選：計算邊界框
      const frames = selectedElements.map(el => el.frame);
      frame = getBoundingRect(frames);
    }

    // 設定選取框位置與尺寸
    setStyles(this.selectionBox, {
      left: `${frame.x}px`,
      top: `${frame.y}px`,
      width: `${frame.w}px`,
      height: `${frame.h}px`
    });

    // 更新元素的 selected class
    const idSet = new Set(ids);
    this.stage.elementMap.forEach((el, elId) => {
      if (idSet.has(elId)) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
  }

  /**
   * 開始調整大小
   */
  startResize(handle, e) {
    const ids = Array.from(appState.selected);
    if (ids.length === 0) return;

    const id = ids[0];
    const element = appState.getElement(id);
    if (!element) return;

    this.resizeState = {
      id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startFrame: { ...element.frame }
    };
  }

  /**
   * 調整大小中
   */
  handleResizeMove(e) {
    if (!this.resizeState) return;

    const { id, handle, startX, startY, startFrame } = this.resizeState;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const newFrame = { ...startFrame };
    const settings = appState.settings;

    // 根據控制點計算新的位置與尺寸
    switch (handle) {
      case 'se': // 右下
        newFrame.w = Math.max(20, startFrame.w + dx);
        newFrame.h = Math.max(20, startFrame.h + dy);
        break;

      case 'sw': // 左下
        newFrame.x = startFrame.x + dx;
        newFrame.w = Math.max(20, startFrame.w - dx);
        newFrame.h = Math.max(20, startFrame.h + dy);
        break;

      case 'ne': // 右上
        newFrame.y = startFrame.y + dy;
        newFrame.w = Math.max(20, startFrame.w + dx);
        newFrame.h = Math.max(20, startFrame.h - dy);
        break;

      case 'nw': // 左上
        newFrame.x = startFrame.x + dx;
        newFrame.y = startFrame.y + dy;
        newFrame.w = Math.max(20, startFrame.w - dx);
        newFrame.h = Math.max(20, startFrame.h - dy);
        break;

      case 'n': // 上
        newFrame.y = startFrame.y + dy;
        newFrame.h = Math.max(20, startFrame.h - dy);
        break;

      case 's': // 下
        newFrame.h = Math.max(20, startFrame.h + dy);
        break;

      case 'w': // 左
        newFrame.x = startFrame.x + dx;
        newFrame.w = Math.max(20, startFrame.w - dx);
        break;

      case 'e': // 右
        newFrame.w = Math.max(20, startFrame.w + dx);
        break;
    }

    // 網格吸附（Alt 鍵停用）
    if (settings.snapToGrid && !e.altKey) {
      newFrame.x = snapToGrid(newFrame.x, settings.gridSize);
      newFrame.y = snapToGrid(newFrame.y, settings.gridSize);
      newFrame.w = snapToGrid(newFrame.w, settings.gridSize);
      newFrame.h = snapToGrid(newFrame.h, settings.gridSize);
    }

    // 更新元素
    appState.updateElement(id, { frame: newFrame });
  }

  /**
   * 調整大小結束
   */
  handleResizeEnd(e) {
    if (this.resizeState) {
      this.resizeState = null;
    }
  }
}
