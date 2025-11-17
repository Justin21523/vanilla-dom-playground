/**
 * 右鍵選單 - Z-order 控制與複製
 */

import { appState } from '../core/state.js';
import { createElement } from '../core/domUtils.js';

export class ContextMenu {
  constructor() {
    this.menu = null;
    this.targetId = null;
    this.init();
  }

  init() {
    // 建立選單
    this.menu = createElement('div', {
      className: 'context-menu',
      children: [
        this.createMenuItem('複製', () => this.duplicate()),
        this.createMenuItem('刪除', () => this.delete()),
        this.createDivider(),
        this.createMenuItem('移到最上層', () => this.bringToFront()),
        this.createMenuItem('移到最下層', () => this.sendToBack()),
        this.createMenuItem('上移一層', () => this.bringForward()),
        this.createMenuItem('下移一層', () => this.sendBackward())
      ]
    });

    document.body.appendChild(this.menu);

    // 監聽點擊外部關閉選單
    document.addEventListener('click', (e) => {
      if (!this.menu.contains(e.target)) {
        this.hide();
      }
    });

    // 監聽右鍵
    document.addEventListener('contextmenu', (e) => {
      const target = e.target.closest('.stage-element');
      if (target) {
        e.preventDefault();
        this.show(e.clientX, e.clientY, target.id);
      }
    });
  }

  /**
   * 建立選單項目
   */
  createMenuItem(text, handler) {
    const item = createElement('div', {
      className: 'context-menu-item',
      textContent: text
    });

    item.addEventListener('click', () => {
      handler();
      this.hide();
    });

    return item;
  }

  /**
   * 建立分隔線
   */
  createDivider() {
    return createElement('div', {
      className: 'context-menu-divider'
    });
  }

  /**
   * 顯示選單
   */
  show(x, y, targetId) {
    this.targetId = targetId;
    this.menu.classList.add('visible');
    this.menu.style.left = `${x}px`;
    this.menu.style.top = `${y}px`;
  }

  /**
   * 隱藏選單
   */
  hide() {
    this.menu.classList.remove('visible');
    this.targetId = null;
  }

  /**
   * 複製
   */
  duplicate() {
    if (!this.targetId) return;
    appState.duplicateElements([this.targetId]);
  }

  /**
   * 刪除
   */
  delete() {
    if (!this.targetId) return;
    appState.deleteElement(this.targetId);
  }

  /**
   * 移到最上層
   */
  bringToFront() {
    if (!this.targetId) return;
    appState.bringToFront(this.targetId);
  }

  /**
   * 移到最下層
   */
  sendToBack() {
    if (!this.targetId) return;
    appState.sendToBack(this.targetId);
  }

  /**
   * 上移一層
   */
  bringForward() {
    if (!this.targetId) return;
    appState.bringForward(this.targetId);
  }

  /**
   * 下移一層
   */
  sendBackward() {
    if (!this.targetId) return;
    appState.sendBackward(this.targetId);
  }
}
