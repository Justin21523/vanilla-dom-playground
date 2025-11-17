/**
 * 增強型顏色選擇器
 * 支援 Hex / RGB / HSL 格式、透明度、色板、最近使用的顏色
 */

import { createElement } from '../core/domUtils.js';

export class ColorPicker {
  constructor(targetInput, onChange) {
    this.targetInput = targetInput; // 原始的 input[type="color"]
    this.onChange = onChange;
    this.currentColor = targetInput.value || '#000000';
    this.currentAlpha = 1;
    this.recentColors = this.loadRecentColors();
    this.isOpen = false;

    this.init();
  }

  init() {
    // 包裝原始 input
    this.wrapper = createElement('div', {
      className: 'color-picker-wrapper'
    });

    // 在 input 後插入 wrapper
    this.targetInput.parentNode.insertBefore(this.wrapper, this.targetInput);
    this.wrapper.appendChild(this.targetInput);

    // 創建增強按鈕
    this.enhancedBtn = createElement('button', {
      className: 'color-picker-enhanced-btn',
      type: 'button',
      textContent: '▼'
    });
    this.enhancedBtn.title = '打開進階顏色選擇器';
    this.wrapper.appendChild(this.enhancedBtn);

    // 創建下拉面板
    this.createPanel();

    // 事件監聽
    this.enhancedBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // 監聽原始 input 變化
    this.targetInput.addEventListener('input', () => {
      this.currentColor = this.targetInput.value;
      this.updateDisplay();
    });

    // 點擊外部關閉
    document.addEventListener('click', (e) => {
      if (!this.wrapper.contains(e.target) && !this.panel.contains(e.target)) {
        this.close();
      }
    });
  }

  createPanel() {
    this.panel = createElement('div', {
      className: 'color-picker-panel',
      style: { display: 'none' }
    });

    // 顏色預覽
    const preview = createElement('div', {
      className: 'cp-preview',
      children: [
        createElement('div', { className: 'cp-preview-bg' }),
        this.previewColor = createElement('div', { className: 'cp-preview-color' })
      ]
    });

    // 格式切換
    const formatSwitch = createElement('div', {
      className: 'cp-format-switch',
      children: [
        this.formatHex = this.createFormatBtn('HEX', 'hex', true),
        this.formatRgb = this.createFormatBtn('RGB', 'rgb'),
        this.formatHsl = this.createFormatBtn('HSL', 'hsl')
      ]
    });

    // 輸入區域
    this.inputArea = createElement('div', { className: 'cp-input-area' });
    this.updateInputFields('hex');

    // 透明度滑桿
    const alphaControl = createElement('div', {
      className: 'cp-alpha-control',
      children: [
        createElement('span', { textContent: '透明度:', className: 'cp-label' }),
        this.alphaSlider = createElement('input', {
          type: 'range',
          min: '0',
          max: '1',
          step: '0.01',
          value: '1',
          className: 'cp-alpha-slider'
        }),
        this.alphaValue = createElement('span', {
          textContent: '100%',
          className: 'cp-alpha-value'
        })
      ]
    });

    this.alphaSlider.addEventListener('input', () => {
      this.currentAlpha = parseFloat(this.alphaSlider.value);
      this.alphaValue.textContent = `${Math.round(this.currentAlpha * 100)}%`;
      this.updatePreview();
    });

    // 預設色板
    const presetsSection = createElement('div', {
      className: 'cp-section',
      children: [
        createElement('div', { textContent: '預設色板', className: 'cp-section-title' }),
        this.createPresetPalette()
      ]
    });

    // 最近使用
    const recentsSection = createElement('div', {
      className: 'cp-section',
      children: [
        createElement('div', { textContent: '最近使用', className: 'cp-section-title' }),
        this.recentsPalette = this.createRecentsPalette()
      ]
    });

    // 按鈕區
    const actions = createElement('div', {
      className: 'cp-actions',
      children: [
        createElement('button', {
          textContent: '確定',
          className: 'btn btn-primary btn-sm',
          onclick: () => this.apply()
        }),
        createElement('button', {
          textContent: '取消',
          className: 'btn btn-sm',
          onclick: () => this.close()
        })
      ]
    });

    this.panel.appendChild(preview);
    this.panel.appendChild(formatSwitch);
    this.panel.appendChild(this.inputArea);
    this.panel.appendChild(alphaControl);
    this.panel.appendChild(presetsSection);
    this.panel.appendChild(recentsSection);
    this.panel.appendChild(actions);

    this.wrapper.appendChild(this.panel);
  }

  createFormatBtn(text, format, active = false) {
    const btn = createElement('button', {
      textContent: text,
      className: `cp-format-btn ${active ? 'active' : ''}`,
      type: 'button',
      onclick: () => {
        this.panel.querySelectorAll('.cp-format-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateInputFields(format);
      }
    });
    return btn;
  }

  updateInputFields(format) {
    this.currentFormat = format;
    this.inputArea.innerHTML = '';

    if (format === 'hex') {
      const input = createElement('input', {
        type: 'text',
        placeholder: '#000000',
        value: this.currentColor,
        className: 'cp-input',
        maxLength: 7
      });
      input.addEventListener('input', (e) => {
        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
          this.currentColor = e.target.value;
          this.updatePreview();
        }
      });
      this.inputArea.appendChild(input);
    } else if (format === 'rgb') {
      const rgb = this.hexToRgb(this.currentColor);
      ['r', 'g', 'b'].forEach((channel, i) => {
        const input = createElement('input', {
          type: 'number',
          min: '0',
          max: '255',
          value: rgb[i],
          className: 'cp-input',
          placeholder: channel.toUpperCase()
        });
        input.addEventListener('input', () => {
          const r = parseInt(this.inputArea.children[0].value) || 0;
          const g = parseInt(this.inputArea.children[1].value) || 0;
          const b = parseInt(this.inputArea.children[2].value) || 0;
          this.currentColor = this.rgbToHex(r, g, b);
          this.updatePreview();
        });
        this.inputArea.appendChild(input);
      });
    } else if (format === 'hsl') {
      const hsl = this.hexToHsl(this.currentColor);
      [
        { label: 'H', max: 360, value: hsl[0] },
        { label: 'S', max: 100, value: hsl[1] },
        { label: 'L', max: 100, value: hsl[2] }
      ].forEach((spec, i) => {
        const input = createElement('input', {
          type: 'number',
          min: '0',
          max: spec.max,
          value: spec.value,
          className: 'cp-input',
          placeholder: spec.label
        });
        input.addEventListener('input', () => {
          const h = parseInt(this.inputArea.children[0].value) || 0;
          const s = parseInt(this.inputArea.children[1].value) || 0;
          const l = parseInt(this.inputArea.children[2].value) || 0;
          this.currentColor = this.hslToHex(h, s, l);
          this.updatePreview();
        });
        this.inputArea.appendChild(input);
      });
    }
  }

  createPresetPalette() {
    const presets = [
      '#000000', '#ffffff', '#f44336', '#e91e63', '#9c27b0', '#673ab7',
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
    ];

    return createElement('div', {
      className: 'cp-palette',
      children: presets.map(color => this.createColorSwatch(color))
    });
  }

  createRecentsPalette() {
    return createElement('div', {
      className: 'cp-palette',
      children: this.recentColors.map(color => this.createColorSwatch(color))
    });
  }

  createColorSwatch(color) {
    return createElement('button', {
      className: 'cp-swatch',
      type: 'button',
      style: { backgroundColor: color },
      title: color,
      onclick: () => {
        this.currentColor = color;
        this.updateDisplay();
        this.updatePreview();
      }
    });
  }

  updateDisplay() {
    if (this.currentFormat === 'hex') {
      this.inputArea.children[0].value = this.currentColor;
    }
  }

  updatePreview() {
    const rgba = `rgba(${this.hexToRgb(this.currentColor).join(', ')}, ${this.currentAlpha})`;
    this.previewColor.style.backgroundColor = rgba;
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.panel.style.display = 'block';
    this.isOpen = true;
    this.updatePreview();
  }

  close() {
    this.panel.style.display = 'none';
    this.isOpen = false;
  }

  apply() {
    this.targetInput.value = this.currentColor;
    this.addRecentColor(this.currentColor);
    if (this.onChange) {
      this.onChange(this.currentColor, this.currentAlpha);
    }
    this.close();
  }

  // 顏色轉換工具
  hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  hexToHsl(hex) {
    const [r, g, b] = this.hexToRgb(hex).map(x => x / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return this.rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
  }

  // 最近使用顏色管理
  loadRecentColors() {
    try {
      return JSON.parse(localStorage.getItem('vdp_recent_colors')) || [];
    } catch {
      return [];
    }
  }

  addRecentColor(color) {
    if (!this.recentColors.includes(color)) {
      this.recentColors.unshift(color);
      this.recentColors = this.recentColors.slice(0, 10);
      localStorage.setItem('vdp_recent_colors', JSON.stringify(this.recentColors));
      this.recentsPalette.innerHTML = '';
      this.recentColors.forEach(c => {
        this.recentsPalette.appendChild(this.createColorSwatch(c));
      });
    }
  }
}
