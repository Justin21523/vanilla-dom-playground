/**
 * 程式碼預覽 - 即時顯示生成的 HTML/CSS/JS
 */

import { eventBus } from '../core/eventBus.js';
import { appState } from '../core/state.js';
import { generateHTML, generateCSS, generateJS } from '../core/codegen.js';
import { $, $$ } from '../core/domUtils.js';

export class CodePreview {
  constructor() {
    this.codeBlocks = {
      html: $('#code-html code'),
      css: $('#code-css code'),
      js: $('#code-js code')
    };

    this.currentTab = 'html';
    this.copyBtn = $('#copy-code');

    this.init();
  }

  init() {
    // 監聽程式碼標籤切換
    $$('.code-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.codeTab);
      });
    });

    // 監聽複製按鈕
    this.copyBtn.addEventListener('click', () => {
      this.copyCurrentCode();
    });

    // 訂閱狀態變更，更新程式碼
    eventBus.subscribe('stage/element/created', () => {
      this.updateCode();
    });

    eventBus.subscribe('stage/element/deleted', () => {
      this.updateCode();
    });

    eventBus.subscribe('stage/element/updated', () => {
      this.updateCode();
    });

    // 初始更新
    this.updateCode();
  }

  /**
   * 切換標籤
   */
  switchTab(tab) {
    this.currentTab = tab;

    // 更新標籤按鈕狀態
    $$('.code-tab').forEach(btn => {
      if (btn.dataset.codeTab === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 更新程式碼區塊顯示
    $$('.code-block').forEach(block => {
      const blockId = block.id.replace('code-', '');
      if (blockId === tab) {
        block.classList.add('active');
      } else {
        block.classList.remove('active');
      }
    });
  }

  /**
   * 更新程式碼顯示
   */
  updateCode() {
    const elements = appState.getElementsInOrder();

    // 生成 HTML
    const html = generateHTML(elements);
    this.codeBlocks.html.textContent = html;

    // 生成 CSS
    const css = generateCSS(elements, appState.settings.codegenMode);
    this.codeBlocks.css.textContent = css;

    // 生成 JS
    const js = generateJS(elements);
    this.codeBlocks.js.textContent = js;
  }

  /**
   * 複製當前標籤的程式碼
   */
  async copyCurrentCode() {
    const code = this.codeBlocks[this.currentTab].textContent;

    try {
      await navigator.clipboard.writeText(code);
      this.showCopyFeedback();
    } catch (err) {
      // Fallback 方法
      this.fallbackCopy(code);
    }
  }

  /**
   * Fallback 複製方法
   */
  fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      this.showCopyFeedback();
    } catch (err) {
      console.error('無法複製:', err);
      alert('複製失敗，請手動選取並複製。');
    }

    document.body.removeChild(textarea);
  }

  /**
   * 顯示複製成功提示
   */
  showCopyFeedback() {
    const originalText = this.copyBtn.textContent;
    this.copyBtn.textContent = '已複製！';
    this.copyBtn.style.background = '#28a745';

    setTimeout(() => {
      this.copyBtn.textContent = originalText;
      this.copyBtn.style.background = '';
    }, 1500);
  }
}
