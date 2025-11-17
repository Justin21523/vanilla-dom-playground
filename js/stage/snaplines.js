/**
 * 智慧輔助線 - 顯示對齊參考線
 */

import { createElement } from '../core/domUtils.js';

export class Snaplines {
  constructor(stageEl) {
    this.stageEl = stageEl;
    this.container = null;
    this.activeGuides = [];
    this.init();
  }

  init() {
    // 建立輔助線容器
    this.container = createElement('div', {
      className: 'snaplines-container',
      style: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '999'
      }
    });

    this.stageEl.appendChild(this.container);
  }

  /**
   * 顯示輔助線
   * @param {Array} guides - 輔助線陣列 [{ type, position, label }]
   */
  show(guides) {
    // 清除舊的輔助線
    this.clear();

    guides.forEach(guide => {
      const line = this.createGuideLine(guide);
      this.container.appendChild(line);
      this.activeGuides.push(line);
    });
  }

  /**
   * 建立輔助線元素
   */
  createGuideLine(guide) {
    const isVertical = guide.type === 'vertical';

    const line = createElement('div', {
      className: `guide-line guide-${guide.type}`,
      style: {
        position: 'absolute',
        backgroundColor: '#ff00ff',
        ...(isVertical ? {
          left: `${guide.position}px`,
          top: '0',
          width: '1px',
          height: '100%'
        } : {
          left: '0',
          top: `${guide.position}px`,
          width: '100%',
          height: '1px'
        })
      }
    });

    return line;
  }

  /**
   * 清除所有輔助線
   */
  clear() {
    this.activeGuides.forEach(line => line.remove());
    this.activeGuides = [];
  }

  /**
   * 銷毀
   */
  destroy() {
    this.clear();
    if (this.container) {
      this.container.remove();
    }
  }
}
