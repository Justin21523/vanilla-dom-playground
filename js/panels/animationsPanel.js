/**
 * 動畫面板 - 設定 CSS Transitions
 */

import { eventBus } from '../core/eventBus.js';
import { appState } from '../core/state.js';
import { $, $$, createElement, empty } from '../core/domUtils.js';

export class AnimationsPanel {
  constructor(stage) {
    this.stage = stage;
    this.panelEmpty = $('.panel-empty', $('#animations-panel'));
    this.panelForm = $('#animations-form');
    this.currentElement = null;

    // UI 元素
    this.animProperty = $('#anim-property');
    this.animDuration = $('#anim-duration');
    this.animDelay = $('#anim-delay');
    this.animTiming = $('#anim-timing');
    this.durationValue = $('#duration-value');
    this.delayValue = $('#delay-value');
    this.currentTransition = $('#current-transition');
    this.btnApply = $('#btn-apply-transition');
    this.btnPreview = $('#btn-preview-anim');
    this.btnClear = $('#btn-clear-transition');

    this.init();
  }

  init() {
    // 訂閱選取事件
    eventBus.subscribe('stage/element/selected', ({ ids }) => {
      if (ids.length === 0) {
        this.showEmpty();
      } else if (ids.length === 1) {
        this.showForm(ids[0]);
      } else {
        this.showEmpty();
      }
    });

    // 更新數值顯示
    this.animDuration.addEventListener('input', () => {
      this.durationValue.textContent = this.animDuration.value;
    });

    this.animDelay.addEventListener('input', () => {
      this.delayValue.textContent = this.animDelay.value;
    });

    // 套用 transition
    this.btnApply.addEventListener('click', () => {
      this.applyTransition();
    });

    // 預覽動畫
    this.btnPreview.addEventListener('click', () => {
      this.previewAnimation();
    });

    // 清除 transition
    this.btnClear.addEventListener('click', () => {
      this.clearTransition();
    });

    // 監聽預設按鈕
    $$('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        this.applyPreset(preset);
      });
    });
  }

  /**
   * 顯示空白狀態
   */
  showEmpty() {
    this.panelEmpty.style.display = 'block';
    this.panelForm.style.display = 'none';
    this.currentElement = null;
  }

  /**
   * 顯示表單
   */
  showForm(id) {
    this.panelEmpty.style.display = 'none';
    this.panelForm.style.display = 'block';
    this.currentElement = id;
    this.loadElementAnimation(id);
  }

  /**
   * 載入元素的動畫設定
   */
  loadElementAnimation(id) {
    const element = appState.getElement(id);
    if (!element || !element.animations) {
      this.displayTransition(null);
      return;
    }

    const anim = element.animations;

    // 載入設定到表單
    if (anim.property) this.animProperty.value = anim.property;
    if (anim.duration) {
      this.animDuration.value = anim.duration;
      this.durationValue.textContent = anim.duration;
    }
    if (anim.delay) {
      this.animDelay.value = anim.delay;
      this.delayValue.textContent = anim.delay;
    }
    if (anim.timing) this.animTiming.value = anim.timing;

    this.displayTransition(anim);
  }

  /**
   * 顯示當前 transition 設定
   */
  displayTransition(anim) {
    empty(this.currentTransition);

    if (!anim) {
      this.currentTransition.appendChild(createElement('p', {
        className: 'empty-hint',
        textContent: '尚未設定 transition'
      }));
      return;
    }

    const transitionStr = `${anim.property} ${anim.duration}ms ${anim.timing} ${anim.delay}ms`;

    this.currentTransition.appendChild(createElement('div', {
      className: 'transition-info',
      children: [
        createElement('div', { textContent: `transition: ${transitionStr}` })
      ]
    }));
  }

  /**
   * 套用 transition
   */
  applyTransition() {
    if (!this.currentElement) return;

    const property = this.animProperty.value;
    const duration = parseInt(this.animDuration.value);
    const delay = parseInt(this.animDelay.value);
    const timing = this.animTiming.value;

    const animConfig = {
      property,
      duration,
      delay,
      timing
    };

    // 儲存到狀態
    appState.updateElement(this.currentElement, {
      animations: animConfig
    });

    // 套用到 DOM
    const domEl = this.stage.getElementDOM(this.currentElement);
    if (domEl) {
      this.applyTransitionToDOM(domEl, animConfig);
    }

    // 更新顯示
    this.displayTransition(animConfig);
  }

  /**
   * 套用 transition 到 DOM
   */
  applyTransitionToDOM(domEl, animConfig) {
    const { property, duration, delay, timing } = animConfig;
    domEl.style.transition = `${property} ${duration}ms ${timing} ${delay}ms`;
  }

  /**
   * 套用預設動畫
   */
  applyPreset(preset) {
    if (!this.currentElement) return;

    const presets = {
      fadeIn: {
        property: 'opacity',
        duration: 500,
        delay: 0,
        timing: 'ease',
        initialState: { opacity: '0' },
        finalState: { opacity: '1' }
      },
      fadeOut: {
        property: 'opacity',
        duration: 500,
        delay: 0,
        timing: 'ease',
        initialState: { opacity: '1' },
        finalState: { opacity: '0' }
      },
      slideIn: {
        property: 'transform',
        duration: 400,
        delay: 0,
        timing: 'ease-out',
        initialState: { transform: 'translateX(-100px)' },
        finalState: { transform: 'translateX(0)' }
      },
      slideOut: {
        property: 'transform',
        duration: 400,
        delay: 0,
        timing: 'ease-in',
        initialState: { transform: 'translateX(0)' },
        finalState: { transform: 'translateX(100px)' }
      },
      scaleUp: {
        property: 'transform',
        duration: 300,
        delay: 0,
        timing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        initialState: { transform: 'scale(0.5)' },
        finalState: { transform: 'scale(1)' }
      },
      scaleDown: {
        property: 'transform',
        duration: 300,
        delay: 0,
        timing: 'ease-in',
        initialState: { transform: 'scale(1)' },
        finalState: { transform: 'scale(0.5)' }
      }
    };

    const config = presets[preset];
    if (!config) return;

    // 更新表單
    this.animProperty.value = config.property;
    this.animDuration.value = config.duration;
    this.durationValue.textContent = config.duration;
    this.animDelay.value = config.delay;
    this.delayValue.textContent = config.delay;
    this.animTiming.value = config.timing;

    // 套用設定
    const animConfig = {
      property: config.property,
      duration: config.duration,
      delay: config.delay,
      timing: config.timing,
      preset
    };

    appState.updateElement(this.currentElement, {
      animations: animConfig
    });

    const domEl = this.stage.getElementDOM(this.currentElement);
    if (domEl) {
      this.applyTransitionToDOM(domEl, animConfig);

      // 自動觸發動畫預覽
      setTimeout(() => {
        this.previewAnimation();
      }, 100);
    }

    this.displayTransition(animConfig);
  }

  /**
   * 預覽動畫
   */
  previewAnimation() {
    if (!this.currentElement) return;

    const element = appState.getElement(this.currentElement);
    if (!element || !element.animations) {
      alert('請先設定 transition');
      return;
    }

    const domEl = this.stage.getElementDOM(this.currentElement);
    if (!domEl) return;

    const anim = element.animations;
    const property = anim.property;

    // 根據屬性決定如何切換狀態
    let originalValue, changedValue;

    switch (property) {
      case 'opacity':
        originalValue = domEl.style.opacity || '1';
        changedValue = originalValue === '1' ? '0.3' : '1';
        domEl.style.opacity = changedValue;
        break;

      case 'transform':
        // 如果有預設，使用預設的變化
        if (anim.preset) {
          this.previewPresetAnimation(domEl, anim.preset);
          return;
        }
        // 否則使用簡單的縮放
        originalValue = domEl.style.transform || 'scale(1)';
        changedValue = originalValue === 'scale(1)' ? 'scale(1.2)' : 'scale(1)';
        domEl.style.transform = changedValue;
        break;

      case 'background-color':
        originalValue = domEl.style.backgroundColor || '';
        const currentBg = window.getComputedStyle(domEl).backgroundColor;
        changedValue = currentBg === 'rgb(74, 144, 226)' ?
          domEl.style.backgroundColor || 'rgb(240, 240, 240)' :
          '#4a90e2';
        domEl.style.backgroundColor = changedValue;
        break;

      case 'width':
      case 'height':
        const currentSize = parseInt(window.getComputedStyle(domEl)[property]);
        changedValue = `${currentSize + 50}px`;
        domEl.style[property] = changedValue;

        // 恢復原始尺寸
        setTimeout(() => {
          domEl.style[property] = `${currentSize}px`;
        }, anim.duration + anim.delay + 100);
        break;

      default: // 'all' 或其他
        // 使用縮放作為通用預覽
        domEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
          domEl.style.transform = 'scale(1)';
        }, anim.duration + anim.delay + 100);
        break;
    }
  }

  /**
   * 預覽預設動畫
   */
  previewPresetAnimation(domEl, preset) {
    const element = appState.getElement(this.currentElement);
    const anim = element.animations;

    const presets = {
      fadeIn: () => {
        domEl.style.opacity = '0';
        setTimeout(() => { domEl.style.opacity = '1'; }, 50);
      },
      fadeOut: () => {
        domEl.style.opacity = '1';
        setTimeout(() => { domEl.style.opacity = '0'; }, 50);
        // 恢復
        setTimeout(() => { domEl.style.opacity = '1'; }, anim.duration + anim.delay + 100);
      },
      slideIn: () => {
        domEl.style.transform = 'translateX(-100px)';
        setTimeout(() => { domEl.style.transform = 'translateX(0)'; }, 50);
      },
      slideOut: () => {
        domEl.style.transform = 'translateX(0)';
        setTimeout(() => { domEl.style.transform = 'translateX(100px)'; }, 50);
        // 恢復
        setTimeout(() => { domEl.style.transform = 'translateX(0)'; }, anim.duration + anim.delay + 100);
      },
      scaleUp: () => {
        domEl.style.transform = 'scale(0.5)';
        setTimeout(() => { domEl.style.transform = 'scale(1)'; }, 50);
      },
      scaleDown: () => {
        domEl.style.transform = 'scale(1)';
        setTimeout(() => { domEl.style.transform = 'scale(0.5)'; }, 50);
        // 恢復
        setTimeout(() => { domEl.style.transform = 'scale(1)'; }, anim.duration + anim.delay + 100);
      }
    };

    if (presets[preset]) {
      presets[preset]();
    }
  }

  /**
   * 清除 transition
   */
  clearTransition() {
    if (!this.currentElement) return;

    // 從狀態移除
    appState.updateElement(this.currentElement, {
      animations: null
    });

    // 從 DOM 移除
    const domEl = this.stage.getElementDOM(this.currentElement);
    if (domEl) {
      domEl.style.transition = '';
    }

    // 重置表單
    this.animProperty.value = 'all';
    this.animDuration.value = 300;
    this.durationValue.textContent = '300';
    this.animDelay.value = 0;
    this.delayValue.textContent = '0';
    this.animTiming.value = 'ease';

    this.displayTransition(null);
  }
}
