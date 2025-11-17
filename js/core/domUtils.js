/**
 * DOM 工具函數 - 建立、查詢、樣式操作
 */

/**
 * 建立 DOM 元素
 * @param {string} tag - 標籤名稱
 * @param {Object} options - 選項 { id, className, attrs, style, children }
 * @returns {HTMLElement}
 */
export function createElement(tag, options = {}) {
  const element = document.createElement(tag);

  if (options.id) {
    element.id = options.id;
  }

  if (options.className) {
    element.className = options.className;
  }

  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (options.style) {
    Object.entries(options.style).forEach(([key, value]) => {
      element.style[key] = value;
    });
  }

  if (options.textContent) {
    element.textContent = options.textContent;
  }

  if (options.children) {
    options.children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}

/**
 * 查詢元素
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * 查詢多個元素
 */
export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * 設定元素樣式
 */
export function setStyles(element, styles) {
  Object.entries(styles).forEach(([key, value]) => {
    element.style[key] = value;
  });
}

/**
 * 設定元素屬性
 */
export function setAttrs(element, attrs) {
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, value);
    }
  });
}

/**
 * 切換 class
 */
export function toggleClass(element, className, force) {
  return element.classList.toggle(className, force);
}

/**
 * 新增 class
 */
export function addClass(element, ...classNames) {
  element.classList.add(...classNames);
}

/**
 * 移除 class
 */
export function removeClass(element, ...classNames) {
  element.classList.remove(...classNames);
}

/**
 * 清空元素內容
 */
export function empty(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * 移除元素
 */
export function remove(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/**
 * 委派事件監聽
 */
export function delegate(parent, selector, eventType, handler) {
  parent.addEventListener(eventType, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, e);
    }
  });
}

/**
 * 建立 stage 元素的 DOM 節點
 */
export function createStageElement(elementNode) {
  const { tag, id, attrs, style, frame } = elementNode;

  const el = createElement(tag, {
    id,
    className: 'stage-element',
    attrs,
    style: {
      position: 'absolute',
      left: `${frame.x}px`,
      top: `${frame.y}px`,
      width: `${frame.w}px`,
      height: `${frame.h}px`,
      ...style
    }
  });

  // 根據標籤設定預設內容
  if (tag === 'button') {
    el.textContent = attrs.textContent || 'Button';
  } else if (tag === 'p' || tag === 'span') {
    el.textContent = attrs.textContent || 'Text';
  } else if (tag === 'input') {
    el.placeholder = attrs.placeholder || 'Input';
  }

  return el;
}

/**
 * 取得元素在 stage 中的位置
 */
export function getElementBounds(element) {
  const rect = element.getBoundingClientRect();
  const parent = element.offsetParent || document.body;
  const parentRect = parent.getBoundingClientRect();

  return {
    x: rect.left - parentRect.left,
    y: rect.top - parentRect.top,
    w: rect.width,
    h: rect.height
  };
}
