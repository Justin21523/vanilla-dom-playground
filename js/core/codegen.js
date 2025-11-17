/**
 * 程式碼產生器 - 將當前狀態轉換為 HTML/CSS/JS
 * 遵循最小化原則：只產生必要的程式碼
 */

/**
 * 預設值不需要輸出
 */
const CSS_DEFAULTS = {
  'position': 'static',
  'display': 'block',
  'box-sizing': 'content-box'
};

/**
 * 產生 HTML 程式碼
 */
export function generateHTML(elements) {
  if (!elements || elements.length === 0) {
    return '<!-- 尚未建立任何元素 -->';
  }

  let html = '';

  elements.forEach(el => {
    const attrs = generateAttrs(el);
    const content = getElementContent(el);

    if (el.tag === 'img' || el.tag === 'input') {
      // 自閉合標籤
      html += `<${el.tag}${attrs} />\n`;
    } else {
      html += `<${el.tag}${attrs}>${content}</${el.tag}>\n`;
    }
  });

  return html.trim();
}

/**
 * 產生屬性字串
 */
function generateAttrs(el) {
  let attrs = '';

  // ID（必要，用於 JS 選取）
  attrs += ` id="${el.id}"`;

  // class（如果有）
  if (el.classes && el.classes.size > 0) {
    attrs += ` class="${Array.from(el.classes).join(' ')}"`;
  }

  // 其他屬性
  if (el.attrs) {
    Object.entries(el.attrs).forEach(([key, value]) => {
      if (key !== 'textContent') {
        attrs += ` ${key}="${escapeAttr(value)}"`;
      }
    });
  }

  // 內聯樣式（minimal 模式優先使用內聯）
  const styleStr = generateInlineStyle(el);
  if (styleStr) {
    attrs += ` style="${styleStr}"`;
  }

  return attrs;
}

/**
 * 產生內聯樣式字串
 */
function generateInlineStyle(el) {
  const styles = [];

  // 位置與尺寸（絕對定位元素）
  if (el.frame) {
    styles.push(`position: absolute`);
    styles.push(`left: ${el.frame.x}px`);
    styles.push(`top: ${el.frame.y}px`);
    styles.push(`width: ${el.frame.w}px`);
    styles.push(`height: ${el.frame.h}px`);
  }

  // 自訂樣式
  if (el.style) {
    Object.entries(el.style).forEach(([key, value]) => {
      // 跳過預設值
      if (CSS_DEFAULTS[key] !== value) {
        const cssKey = camelToKebab(key);
        styles.push(`${cssKey}: ${value}`);
      }
    });
  }

  return styles.join('; ');
}

/**
 * 取得元素內容
 */
function getElementContent(el) {
  if (el.tag === 'button' && el.attrs?.textContent) {
    return escapeHTML(el.attrs.textContent);
  }
  if ((el.tag === 'p' || el.tag === 'span') && el.attrs?.textContent) {
    return escapeHTML(el.attrs.textContent);
  }
  return '';
}

/**
 * 產生 CSS 程式碼
 */
export function generateCSS(elements, mode = 'minimal') {
  let css = '';

  if (mode === 'minimal') {
    // 基礎重置
    css = `/* Minimal 模式：大部分樣式已包含在 HTML 的 style 屬性中 */

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}`;

    // 檢查是否有元素使用 transitions
    const elementsWithTransitions = elements.filter(el => el.animations);

    if (elementsWithTransitions.length > 0) {
      css += '\n\n/* CSS Transitions */';

      elementsWithTransitions.forEach(el => {
        const anim = el.animations;
        const transition = `${anim.property} ${anim.duration}ms ${anim.timing} ${anim.delay}ms`;

        css += `\n#${el.id} {
  transition: ${transition};
}`;
      });
    }

    return css;
  }

  // Pretty 模式（稍後實作）
  return '/* Pretty 模式尚未實作 */';
}

/**
 * 產生 JS 程式碼
 */
export function generateJS(elements) {
  if (!elements || elements.length === 0) {
    return '// 尚未綁定任何事件';
  }

  const scripts = [];

  // 等待 DOM 載入
  scripts.push('// 等待 DOM 完全載入');
  scripts.push('document.addEventListener("DOMContentLoaded", () => {');

  let hasEvents = false;

  elements.forEach(el => {
    if (el.events && Object.keys(el.events).length > 0) {
      hasEvents = true;
      scripts.push(`\n  // ${el.tag}#${el.id} 的事件`);

      Object.entries(el.events).forEach(([eventName, handlerSpec]) => {
        const handlerCode = generateEventHandler(el, eventName, handlerSpec);
        scripts.push(`  ${handlerCode}`);
      });
    }
  });

  if (!hasEvents) {
    scripts.push('  // 尚未綁定任何事件');
  }

  scripts.push('});');

  return scripts.join('\n');
}

/**
 * 產生事件處理器程式碼
 */
function generateEventHandler(el, eventName, handlerSpec) {
  const { preset, args, custom, options } = handlerSpec;

  let handler = '';

  if (preset) {
    // 預設動作
    handler = generatePresetHandler(preset, args);
  } else if (custom) {
    // 自訂程式碼（可能有多行）
    const lines = custom.split('\n').map(line => `    ${line}`).join('\n');
    handler = `\n${lines}\n  `;
  }

  const optionsStr = options ? `, ${JSON.stringify(options)}` : '';

  // 如果是單行，保持簡潔格式
  if (!handler.includes('\n')) {
    return `document.getElementById("${el.id}").addEventListener("${eventName}", (e) => {\n    ${handler}\n  }${optionsStr});`;
  }

  // 多行格式
  return `document.getElementById("${el.id}").addEventListener("${eventName}", (e) => {${handler}}${optionsStr});`;
}

/**
 * 產生預設事件處理器
 */
function generatePresetHandler(preset, args) {
  switch (preset) {
    case 'toggleClass':
      return `e.currentTarget.classList.toggle("${args.className}");`;

    case 'addClass':
      return `e.currentTarget.classList.add("${args.className}");`;

    case 'removeClass':
      return `e.currentTarget.classList.remove("${args.className}");`;

    case 'changeColor':
      return `e.currentTarget.style.backgroundColor = "${args.color}";`;

    case 'toggleVisibility':
      return `e.currentTarget.style.display = e.currentTarget.style.display === "none" ? "block" : "none";`;

    case 'setText':
      return `document.querySelector("${args.target}").textContent = "${args.text}";`;

    case 'updateText':
      return `const source = document.querySelector("${args.sourceSelector}");\n    e.currentTarget.textContent = source.value || source.textContent;`;

    case 'getValue':
      return `const displayEl = document.querySelector("${args.displayTarget}");\n    displayEl.textContent = e.currentTarget.value || e.currentTarget.textContent;`;

    case 'alert':
      return `alert("${args.message}");`;

    default:
      return `console.log("${preset} 未實作");`;
  }
}

/**
 * 工具函數：駝峰轉短橫線
 */
function camelToKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * 工具函數：轉義 HTML
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 工具函數：轉義屬性
 */
function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
