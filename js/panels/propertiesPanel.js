/**
 * 屬性面板 - 編輯元素的樣式與屬性
 */

import { eventBus } from '../core/eventBus.js';
import { appState } from '../core/state.js';
import { $ } from '../core/domUtils.js';
import { ColorPicker } from '../ui/colorPicker.js';

export class PropertiesPanel {
  constructor() {
    this.panelEmpty = $('.panel-empty', $('#properties-panel'));
    this.panelForm = $('#properties-form');
    this.contentSection = $('#content-section');
    this.currentElement = null;

    // 輸入欄位
    this.inputs = {
      x: $('#prop-x'),
      y: $('#prop-y'),
      width: $('#prop-width'),
      height: $('#prop-height'),
      bgColor: $('#prop-bg-color'),
      textColor: $('#prop-text-color'),
      fontSize: $('#prop-font-size'),
      borderRadius: $('#prop-border-radius'),
      fontFamily: $('#prop-font-family'),
      fontWeight: $('#prop-font-weight'),
      fontStyle: $('#prop-font-style'),
      textAlign: $('#prop-text-align'),
      textDecoration: $('#prop-text-decoration'),
      lineHeight: $('#prop-line-height'),
      letterSpacing: $('#prop-letter-spacing'),
      padding: $('#prop-padding'),
      paddingTop: $('#prop-padding-top'),
      paddingRight: $('#prop-padding-right'),
      paddingBottom: $('#prop-padding-bottom'),
      paddingLeft: $('#prop-padding-left'),
      margin: $('#prop-margin'),
      marginTop: $('#prop-margin-top'),
      marginRight: $('#prop-margin-right'),
      marginBottom: $('#prop-margin-bottom'),
      marginLeft: $('#prop-margin-left'),
      borderWidth: $('#prop-border-width'),
      borderStyle: $('#prop-border-style'),
      borderColor: $('#prop-border-color'),
      borderTopWidth: $('#prop-border-top-width'),
      borderRightWidth: $('#prop-border-right-width'),
      borderBottomWidth: $('#prop-border-bottom-width'),
      borderLeftWidth: $('#prop-border-left-width'),
      opacity: $('#prop-opacity'),
      zIndex: $('#prop-z-index'),
      display: $('#prop-display'),
      overflow: $('#prop-overflow'),
      cursor: $('#prop-cursor'),
      textContent: $('#prop-text-content')
    };

    // Box Shadow 控制
    this.shadowInputs = {
      x: $('#shadow-x'),
      y: $('#shadow-y'),
      blur: $('#shadow-blur'),
      spread: $('#shadow-spread'),
      color: $('#shadow-color'),
      opacity: $('#shadow-opacity'),
      inset: $('#shadow-inset'),
      preview: $('#shadow-preview .shadow-preview-inner'),
      xValue: $('#shadow-x-value'),
      yValue: $('#shadow-y-value'),
      blurValue: $('#shadow-blur-value'),
      spreadValue: $('#shadow-spread-value'),
      opacityValue: $('#shadow-opacity-value'),
      cssOutput: $('#shadow-css-output'),
      applyBtn: $('#btn-apply-shadow'),
      clearBtn: $('#btn-clear-shadow')
    };

    this.init();
  }

  init() {
    // 訂閱選取事件
    eventBus.subscribe('stage/element/selected', ({ ids }) => {
      if (ids.length === 0) {
        this.showEmpty();
      } else {
        this.showForm(ids[0]);
      }
    });

    // 訂閱元素更新（同步顯示）
    eventBus.subscribe('stage/element/updated', ({ id }) => {
      if (this.currentElement === id) {
        this.loadElementData(id);
      }
    });

    // 監聽輸入變更
    Object.entries(this.inputs).forEach(([prop, input]) => {
      if (!input) return;

      input.addEventListener('input', () => {
        this.handleInputChange(prop, input.value);
      });

      // 針對 number 和 color 類型，也監聽 change 事件
      if (input.type === 'number' || input.type === 'color') {
        input.addEventListener('change', () => {
          this.handleInputChange(prop, input.value);
        });
      }
    });

    // 初始化 Box Shadow 控制器
    this.initBoxShadow();

    // 初始化增強型顏色選擇器
    this.initColorPickers();
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
   * 顯示表單並載入元素資料
   */
  showForm(id) {
    this.panelEmpty.style.display = 'none';
    this.panelForm.style.display = 'block';
    this.currentElement = id;
    this.loadElementData(id);
  }

  /**
   * 載入元素資料到表單
   */
  loadElementData(id) {
    const element = appState.getElement(id);
    if (!element) return;

    // 位置與尺寸
    this.inputs.x.value = element.frame.x;
    this.inputs.y.value = element.frame.y;
    this.inputs.width.value = element.frame.w;
    this.inputs.height.value = element.frame.h;

    // 樣式
    this.inputs.bgColor.value = this.parseColor(element.style.backgroundColor) || '#ffffff';
    this.inputs.textColor.value = this.parseColor(element.style.color) || '#000000';
    this.inputs.fontSize.value = this.parseNumber(element.style.fontSize) || 16;
    this.inputs.borderRadius.value = this.parseNumber(element.style.borderRadius) || 0;

    // 排版
    this.inputs.fontFamily.value = element.style.fontFamily || '';
    this.inputs.fontWeight.value = element.style.fontWeight || '';
    this.inputs.fontStyle.value = element.style.fontStyle || '';
    this.inputs.textAlign.value = element.style.textAlign || '';
    this.inputs.textDecoration.value = element.style.textDecoration || '';
    this.inputs.lineHeight.value = element.style.lineHeight || '';
    this.inputs.letterSpacing.value = this.parseNumber(element.style.letterSpacing) || '';

    // 間距
    this.inputs.padding.value = this.parseNumber(element.style.padding) || '';
    this.inputs.paddingTop.value = this.parseNumber(element.style.paddingTop) || '';
    this.inputs.paddingRight.value = this.parseNumber(element.style.paddingRight) || '';
    this.inputs.paddingBottom.value = this.parseNumber(element.style.paddingBottom) || '';
    this.inputs.paddingLeft.value = this.parseNumber(element.style.paddingLeft) || '';
    this.inputs.margin.value = this.parseNumber(element.style.margin) || '';
    this.inputs.marginTop.value = this.parseNumber(element.style.marginTop) || '';
    this.inputs.marginRight.value = this.parseNumber(element.style.marginRight) || '';
    this.inputs.marginBottom.value = this.parseNumber(element.style.marginBottom) || '';
    this.inputs.marginLeft.value = this.parseNumber(element.style.marginLeft) || '';

    // 邊框
    this.inputs.borderWidth.value = this.parseNumber(element.style.borderWidth) || '';
    this.inputs.borderStyle.value = element.style.borderStyle || '';
    this.inputs.borderColor.value = this.parseColor(element.style.borderColor) || '#000000';
    this.inputs.borderTopWidth.value = this.parseNumber(element.style.borderTopWidth) || '';
    this.inputs.borderRightWidth.value = this.parseNumber(element.style.borderRightWidth) || '';
    this.inputs.borderBottomWidth.value = this.parseNumber(element.style.borderBottomWidth) || '';
    this.inputs.borderLeftWidth.value = this.parseNumber(element.style.borderLeftWidth) || '';

    // 進階屬性
    this.inputs.opacity.value = element.style.opacity || '';
    this.inputs.zIndex.value = element.style.zIndex || '';
    this.inputs.display.value = element.style.display || '';
    this.inputs.overflow.value = element.style.overflow || '';
    this.inputs.cursor.value = element.style.cursor || '';

    // 內容（僅對特定元素顯示）
    if (element.tag === 'button' || element.tag === 'p' || element.tag === 'span') {
      this.contentSection.style.display = 'block';
      this.inputs.textContent.value = element.attrs?.textContent || '';
    } else {
      this.contentSection.style.display = 'none';
    }
  }

  /**
   * 處理輸入變更
   */
  handleInputChange(prop, value) {
    if (!this.currentElement) return;

    // 發布屬性變更事件
    eventBus.publish('panel/properties/change', {
      id: this.currentElement,
      prop,
      value
    });
  }

  /**
   * 解析顏色值（轉換為 hex）
   */
  parseColor(color) {
    if (!color) return null;

    // 如果已經是 hex 格式，直接返回
    if (color.startsWith('#')) return color;

    // 轉換 rgb/rgba 為 hex
    const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }

    // 處理顏色名稱（簡單處理）
    const colorMap = {
      'white': '#ffffff',
      'black': '#000000',
      'red': '#ff0000',
      'blue': '#0000ff',
      'green': '#00ff00'
    };

    return colorMap[color.toLowerCase()] || null;
  }

  /**
   * 解析數值（移除單位）
   */
  parseNumber(value) {
    if (!value) return null;
    return parseFloat(value);
  }

  /**
   * 初始化 Box Shadow 控制器
   */
  initBoxShadow() {
    const s = this.shadowInputs;

    // 監聽所有滑桿變化，即時更新預覽
    const updatePreview = () => {
      const shadowCSS = this.generateShadowCSS();
      s.preview.style.boxShadow = shadowCSS;
      s.cssOutput.textContent = `box-shadow: ${shadowCSS};`;
      s.cssOutput.style.display = shadowCSS === 'none' ? 'none' : 'block';
    };

    // 更新數值顯示
    s.x.addEventListener('input', () => {
      s.xValue.textContent = `${s.x.value}px`;
      updatePreview();
    });

    s.y.addEventListener('input', () => {
      s.yValue.textContent = `${s.y.value}px`;
      updatePreview();
    });

    s.blur.addEventListener('input', () => {
      s.blurValue.textContent = `${s.blur.value}px`;
      updatePreview();
    });

    s.spread.addEventListener('input', () => {
      s.spreadValue.textContent = `${s.spread.value}px`;
      updatePreview();
    });

    s.opacity.addEventListener('input', () => {
      s.opacityValue.textContent = s.opacity.value;
      updatePreview();
    });

    s.color.addEventListener('input', updatePreview);
    s.inset.addEventListener('change', updatePreview);

    // 套用陰影
    s.applyBtn.addEventListener('click', () => {
      this.applyBoxShadow();
    });

    // 清除陰影
    s.clearBtn.addEventListener('click', () => {
      this.clearBoxShadow();
    });

    // 初始預覽
    updatePreview();
  }

  /**
   * 生成 box-shadow CSS 字串
   */
  generateShadowCSS() {
    const s = this.shadowInputs;
    const x = s.x.value;
    const y = s.y.value;
    const blur = s.blur.value;
    const spread = s.spread.value;
    const color = s.color.value;
    const opacity = s.opacity.value;
    const inset = s.inset.checked ? 'inset ' : '';

    // 轉換顏色為 rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    return `${inset}${x}px ${y}px ${blur}px ${spread}px rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  /**
   * 套用 box-shadow 到當前元素
   */
  applyBoxShadow() {
    if (!this.currentElement) return;

    const shadowCSS = this.generateShadowCSS();

    // 發布屬性變更事件
    eventBus.publish('panel/properties/change', {
      id: this.currentElement,
      prop: 'boxShadow',
      value: shadowCSS
    });
  }

  /**
   * 清除 box-shadow
   */
  clearBoxShadow() {
    if (!this.currentElement) return;

    // 重置所有控制項
    this.shadowInputs.x.value = 0;
    this.shadowInputs.y.value = 4;
    this.shadowInputs.blur.value = 6;
    this.shadowInputs.spread.value = 0;
    this.shadowInputs.color.value = '#000000';
    this.shadowInputs.opacity.value = 0.2;
    this.shadowInputs.inset.checked = false;

    // 更新顯示
    this.shadowInputs.xValue.textContent = '0px';
    this.shadowInputs.yValue.textContent = '4px';
    this.shadowInputs.blurValue.textContent = '6px';
    this.shadowInputs.spreadValue.textContent = '0px';
    this.shadowInputs.opacityValue.textContent = '0.2';

    // 清除預覽
    this.shadowInputs.preview.style.boxShadow = 'none';
    this.shadowInputs.cssOutput.style.display = 'none';

    // 清除元素的 box-shadow
    eventBus.publish('panel/properties/change', {
      id: this.currentElement,
      prop: 'boxShadow',
      value: 'none'
    });
  }

  /**
   * 初始化增強型顏色選擇器
   */
  initColorPickers() {
    // 為背景色添加增強選擇器
    this.bgColorPicker = new ColorPicker(
      this.inputs.bgColor,
      (color, alpha) => {
        this.handleInputChange('bgColor', color);
      }
    );

    // 為文字色添加增強選擇器
    this.textColorPicker = new ColorPicker(
      this.inputs.textColor,
      (color, alpha) => {
        this.handleInputChange('textColor', color);
      }
    );

    // 為邊框色添加增強選擇器
    this.borderColorPicker = new ColorPicker(
      this.inputs.borderColor,
      (color, alpha) => {
        this.handleInputChange('borderColor', color);
      }
    );

    // 為陰影顏色添加增強選擇器
    this.shadowColorPicker = new ColorPicker(
      this.shadowInputs.color,
      (color, alpha) => {
        // 更新陰影顏色並重新生成預覽
        this.shadowInputs.color.value = color;
        const shadowCSS = this.generateShadowCSS();
        this.shadowInputs.preview.style.boxShadow = shadowCSS;
        this.shadowInputs.cssOutput.textContent = `box-shadow: ${shadowCSS};`;
        this.shadowInputs.cssOutput.style.display = shadowCSS === 'none' ? 'none' : 'block';
      }
    );
  }
}
