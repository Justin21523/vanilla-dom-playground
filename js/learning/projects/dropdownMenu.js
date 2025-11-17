/**
 * 下拉菜單系統 (Dropdown Menu System)
 *
 * 學習目標:
 * - 多級嵌套菜單實現
 * - mouseenter/mouseleave 事件
 * - focus/blur 鍵盤導航
 * - 點擊外部關閉 (click outside)
 * - ARIA 無障礙屬性
 * - 動態定位和邊界檢測
 * - CSS transitions 動畫
 * - 防抖 (debounce) 技術
 *
 * 使用純 Vanilla JavaScript，無任何框架依賴
 */

export class DropdownMenu {
  constructor(container) {
    this.container = container;

    // 狀態
    this.activeMenus = new Set(); // 當前打開的菜單
    this.focusedItemIndex = -1;
    this.menuItems = [];
    this.hoverTimer = null;
    this.hoverDelay = 200; // ms

    // 配置
    this.config = {
      openOnHover: true,
      closeDelay: 300, // ms
      animationDuration: 200, // ms
      positioning: 'auto' // 'auto' | 'bottom' | 'right'
    };

    // 示例菜單數據
    this.menuData = [
      {
        id: 'file',
        label: '檔案',
        icon: '📁',
        items: [
          { id: 'new', label: '新增', icon: '📄', shortcut: 'Ctrl+N' },
          { id: 'open', label: '開啟', icon: '📂', shortcut: 'Ctrl+O' },
          { id: 'save', label: '儲存', icon: '💾', shortcut: 'Ctrl+S' },
          { type: 'divider' },
          {
            id: 'recent',
            label: '最近使用',
            icon: '🕒',
            items: [
              { id: 'recent1', label: 'project-1.js' },
              { id: 'recent2', label: 'index.html' },
              { id: 'recent3', label: 'styles.css' }
            ]
          },
          { type: 'divider' },
          { id: 'exit', label: '結束', icon: '🚪', shortcut: 'Alt+F4' }
        ]
      },
      {
        id: 'edit',
        label: '編輯',
        icon: '✏️',
        items: [
          { id: 'undo', label: '復原', icon: '↶', shortcut: 'Ctrl+Z' },
          { id: 'redo', label: '重做', icon: '↷', shortcut: 'Ctrl+Y' },
          { type: 'divider' },
          { id: 'cut', label: '剪下', icon: '✂️', shortcut: 'Ctrl+X' },
          { id: 'copy', label: '複製', icon: '📋', shortcut: 'Ctrl+C' },
          { id: 'paste', label: '貼上', icon: '📌', shortcut: 'Ctrl+V' },
          { type: 'divider' },
          {
            id: 'find',
            label: '搜尋',
            icon: '🔍',
            items: [
              { id: 'findInFile', label: '檔案內搜尋', shortcut: 'Ctrl+F' },
              { id: 'findInFiles', label: '多檔案搜尋', shortcut: 'Ctrl+Shift+F' },
              { id: 'replace', label: '取代', shortcut: 'Ctrl+H' }
            ]
          }
        ]
      },
      {
        id: 'view',
        label: '檢視',
        icon: '👁️',
        items: [
          { id: 'sidebar', label: '側邊欄', icon: '📌', checked: true },
          { id: 'minimap', label: '縮圖導航', icon: '🗺️', checked: false },
          { id: 'statusbar', label: '狀態列', icon: '📊', checked: true },
          { type: 'divider' },
          {
            id: 'zoom',
            label: '縮放',
            icon: '🔍',
            items: [
              { id: 'zoomIn', label: '放大', shortcut: 'Ctrl+=' },
              { id: 'zoomOut', label: '縮小', shortcut: 'Ctrl+-' },
              { id: 'zoomReset', label: '重置', shortcut: 'Ctrl+0' }
            ]
          }
        ]
      },
      {
        id: 'help',
        label: '說明',
        icon: '❓',
        items: [
          { id: 'docs', label: '文件', icon: '📚' },
          { id: 'shortcuts', label: '快捷鍵', icon: '⌨️' },
          { type: 'divider' },
          { id: 'about', label: '關於', icon: 'ℹ️' }
        ]
      }
    ];

    this.init();
  }

  /**
   * 初始化
   */
  init() {
    this.render();
    this.bindEvents();
    this.updateStats();
  }

  /**
   * 渲染 UI
   */
  render() {
    this.container.innerHTML = `
      <div class="dropdown-app">
        <!-- 應用標題 -->
        <div class="dropdown-header">
          <h1 class="dropdown-title">🎯 下拉菜單系統</h1>
          <p class="dropdown-subtitle">完整功能的多級菜單組件 - 支持滑鼠、鍵盤、觸控操作</p>
        </div>

        <!-- 主演示區 -->
        <div class="dropdown-main">
          <!-- 演示區標題 -->
          <div class="demo-section-header">
            <h2>🖱️ 菜單演示</h2>
            <p>懸停或點擊菜單項目，支持多級嵌套</p>
          </div>

          <!-- 菜單欄 -->
          <div class="menu-bar" id="menu-bar" role="menubar">
            ${this.menuData.map(menu => `
              <div
                class="menu-item top-level"
                data-menu-id="${menu.id}"
                role="menuitem"
                aria-haspopup="true"
                aria-expanded="false"
                tabindex="0"
              >
                <span class="menu-icon">${menu.icon}</span>
                <span class="menu-label">${menu.label}</span>
                <span class="menu-arrow">▼</span>
              </div>
            `).join('')}
          </div>

          <!-- 動作日誌 -->
          <div class="action-log-container">
            <div class="action-log-header">
              <h3>📝 動作日誌</h3>
              <button class="clear-log-btn" id="clear-log-btn">清除</button>
            </div>
            <div class="action-log" id="action-log"></div>
          </div>
        </div>

        <!-- 配置面板 -->
        <div class="config-panel">
          <h2>⚙️ 菜單配置</h2>

          <div class="config-group">
            <label class="config-label">
              <input type="checkbox" id="hover-toggle" checked>
              <span>滑鼠懸停打開</span>
            </label>
            <p class="config-hint">啟用後滑鼠懸停即可打開菜單，否則需要點擊</p>
          </div>

          <div class="config-group">
            <label class="config-label">懸停延遲</label>
            <div class="slider-container">
              <input
                type="range"
                id="hover-delay-slider"
                min="0"
                max="500"
                step="50"
                value="200"
              >
              <span class="slider-value" id="hover-delay-value">200ms</span>
            </div>
          </div>

          <div class="config-group">
            <label class="config-label">關閉延遲</label>
            <div class="slider-container">
              <input
                type="range"
                id="close-delay-slider"
                min="0"
                max="1000"
                step="100"
                value="300"
              >
              <span class="slider-value" id="close-delay-value">300ms</span>
            </div>
          </div>

          <div class="config-group">
            <label class="config-label">動畫時長</label>
            <div class="slider-container">
              <input
                type="range"
                id="animation-duration-slider"
                min="0"
                max="500"
                step="50"
                value="200"
              >
              <span class="slider-value" id="animation-duration-value">200ms</span>
            </div>
          </div>

          <div class="config-group">
            <button class="reset-config-btn" id="reset-config-btn">🔄 重置配置</button>
          </div>
        </div>

        <!-- 統計面板 -->
        <div class="stats-panel">
          <h2>📊 菜單統計</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📁</div>
              <div class="stat-content">
                <div class="stat-value" id="total-menus">0</div>
                <div class="stat-label">頂層菜單</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📄</div>
              <div class="stat-content">
                <div class="stat-value" id="total-items">0</div>
                <div class="stat-label">菜單項目</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🔗</div>
              <div class="stat-content">
                <div class="stat-value" id="nested-menus">0</div>
                <div class="stat-label">嵌套菜單</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <div class="stat-value" id="actions-count">0</div>
                <div class="stat-label">執行動作</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 學習提示 -->
        <div class="learning-tips">
          <h3>💡 涉及的技術點</h3>
          <div class="tips-grid">
            <div class="tip-item">
              <strong>滑鼠事件:</strong>
              <p>mouseenter/mouseleave 實現懸停打開</p>
            </div>
            <div class="tip-item">
              <strong>鍵盤導航:</strong>
              <p>Tab/方向鍵/Enter/Escape 完整支持</p>
            </div>
            <div class="tip-item">
              <strong>外部點擊:</strong>
              <p>document.addEventListener 全局監聽</p>
            </div>
            <div class="tip-item">
              <strong>動態定位:</strong>
              <p>getBoundingClientRect 邊界檢測</p>
            </div>
            <div class="tip-item">
              <strong>ARIA 無障礙:</strong>
              <p>role/aria-* 屬性完整支持</p>
            </div>
            <div class="tip-item">
              <strong>防抖技術:</strong>
              <p>setTimeout/clearTimeout 延遲執行</p>
            </div>
          </div>

          <div class="keyboard-hints">
            <h4>⌨️ 鍵盤操作</h4>
            <div class="hints-list">
              <span class="hint-item"><kbd>Tab</kbd> 切換菜單</span>
              <span class="hint-item"><kbd>↓</kbd> 打開/下一項</span>
              <span class="hint-item"><kbd>↑</kbd> 上一項</span>
              <span class="hint-item"><kbd>→</kbd> 展開子菜單</span>
              <span class="hint-item"><kbd>←</kbd> 收起子菜單</span>
              <span class="hint-item"><kbd>Enter</kbd> 執行動作</span>
              <span class="hint-item"><kbd>Esc</kbd> 關閉菜單</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 綁定事件
   */
  bindEvents() {
    const menuBar = document.getElementById('menu-bar');

    // 頂層菜單項目事件
    document.querySelectorAll('.menu-item.top-level').forEach(item => {
      const menuId = item.dataset.menuId;
      const menuConfig = this.menuData.find(m => m.id === menuId);

      // 滑鼠懸停
      item.addEventListener('mouseenter', () => {
        if (this.config.openOnHover) {
          this.scheduleOpenMenu(item, menuConfig);
        }
      });

      item.addEventListener('mouseleave', () => {
        if (this.hoverTimer) {
          clearTimeout(this.hoverTimer);
        }
      });

      // 點擊
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = item.getAttribute('aria-expanded') === 'true';

        if (isOpen) {
          this.closeMenu(item);
        } else {
          this.closeAllMenus();
          this.openMenu(item, menuConfig);
        }
      });

      // 鍵盤導航
      item.addEventListener('keydown', (e) => {
        this.handleTopLevelKeydown(e, item, menuConfig);
      });
    });

    // 配置控制
    document.getElementById('hover-toggle').addEventListener('change', (e) => {
      this.config.openOnHover = e.target.checked;
      this.logAction(`${e.target.checked ? '啟用' : '禁用'}滑鼠懸停打開`);
    });

    document.getElementById('hover-delay-slider').addEventListener('input', (e) => {
      this.hoverDelay = parseInt(e.target.value);
      document.getElementById('hover-delay-value').textContent = `${this.hoverDelay}ms`;
    });

    document.getElementById('close-delay-slider').addEventListener('input', (e) => {
      this.config.closeDelay = parseInt(e.target.value);
      document.getElementById('close-delay-value').textContent = `${this.config.closeDelay}ms`;
    });

    document.getElementById('animation-duration-slider').addEventListener('input', (e) => {
      this.config.animationDuration = parseInt(e.target.value);
      document.getElementById('animation-duration-value').textContent = `${this.config.animationDuration}ms`;
      document.documentElement.style.setProperty('--menu-animation-duration', `${this.config.animationDuration}ms`);
    });

    document.getElementById('reset-config-btn').addEventListener('click', () => {
      this.resetConfig();
    });

    document.getElementById('clear-log-btn').addEventListener('click', () => {
      document.getElementById('action-log').innerHTML = '';
      this.logAction('日誌已清除');
    });

    // 全局點擊事件 - 點擊外部關閉菜單
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.menu-bar') && !e.target.closest('.dropdown-panel')) {
        this.closeAllMenus();
      }
    });

    // 全局 Escape 鍵
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllMenus();
      }
    });
  }

  /**
   * 排程打開菜單（帶延遲）
   */
  scheduleOpenMenu(item, menuConfig) {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
    }

    this.hoverTimer = setTimeout(() => {
      this.closeAllMenus();
      this.openMenu(item, menuConfig);
    }, this.hoverDelay);
  }

  /**
   * 打開菜單
   */
  openMenu(triggerElement, menuConfig, isSubmenu = false) {
    // 創建下拉面板
    const panel = this.createDropdownPanel(menuConfig, isSubmenu);

    // 定位
    this.positionPanel(panel, triggerElement, isSubmenu);

    // 添加到 DOM
    document.body.appendChild(panel);

    // 設置 ARIA 屬性
    triggerElement.setAttribute('aria-expanded', 'true');
    triggerElement.classList.add('active');

    // 觸發動畫
    requestAnimationFrame(() => {
      panel.classList.add('open');
    });

    this.activeMenus.add(panel);
    this.logAction(`打開菜單: ${menuConfig.label}`);
  }

  /**
   * 創建下拉面板
   */
  createDropdownPanel(menuConfig, isSubmenu) {
    const panel = document.createElement('div');
    panel.className = `dropdown-panel ${isSubmenu ? 'submenu' : ''}`;
    panel.setAttribute('role', 'menu');
    panel.dataset.menuId = menuConfig.id;

    const items = menuConfig.items || [];

    panel.innerHTML = items.map((item, index) => {
      if (item.type === 'divider') {
        return '<div class="menu-divider" role="separator"></div>';
      }

      const hasSubmenu = item.items && item.items.length > 0;
      const isCheckable = item.checked !== undefined;

      return `
        <div
          class="dropdown-item ${hasSubmenu ? 'has-submenu' : ''} ${isCheckable ? 'checkable' : ''}"
          data-item-id="${item.id}"
          data-index="${index}"
          role="menuitem"
          ${hasSubmenu ? 'aria-haspopup="true"' : ''}
          tabindex="-1"
        >
          ${isCheckable ? `<span class="check-mark">${item.checked ? '✓' : ''}</span>` : ''}
          ${item.icon ? `<span class="item-icon">${item.icon}</span>` : ''}
          <span class="item-label">${item.label}</span>
          ${item.shortcut ? `<span class="item-shortcut">${item.shortcut}</span>` : ''}
          ${hasSubmenu ? '<span class="submenu-arrow">▶</span>' : ''}
        </div>
      `;
    }).join('');

    // 綁定面板內項目事件
    this.bindPanelItemEvents(panel, menuConfig);

    return panel;
  }

  /**
   * 綁定面板項目事件
   */
  bindPanelItemEvents(panel, menuConfig) {
    const items = panel.querySelectorAll('.dropdown-item');

    items.forEach(item => {
      const itemId = item.dataset.itemId;
      const itemData = this.findItemById(menuConfig.items, itemId);

      if (!itemData) return;

      // 滑鼠懸停
      item.addEventListener('mouseenter', () => {
        // 移除同級其他項目的 focus
        items.forEach(i => i.classList.remove('focused'));
        item.classList.add('focused');

        // 如果有子菜單，打開它
        if (itemData.items && itemData.items.length > 0) {
          this.closeSubmenuOf(panel);
          this.openMenu(item, itemData, true);
        } else {
          this.closeSubmenuOf(panel);
        }
      });

      // 點擊
      item.addEventListener('click', (e) => {
        e.stopPropagation();

        // 可勾選項目
        if (itemData.checked !== undefined) {
          itemData.checked = !itemData.checked;
          const checkMark = item.querySelector('.check-mark');
          checkMark.textContent = itemData.checked ? '✓' : '';
          this.logAction(`${itemData.checked ? '啟用' : '禁用'}: ${itemData.label}`);
          return;
        }

        // 有子菜單的項目
        if (itemData.items && itemData.items.length > 0) {
          return; // 由 mouseenter 處理
        }

        // 普通菜單項目
        this.executeMenuItem(itemData);
        this.closeAllMenus();
      });

      // 鍵盤導航
      item.addEventListener('keydown', (e) => {
        this.handleItemKeydown(e, item, panel, itemData);
      });
    });

    // 滑鼠離開面板
    panel.addEventListener('mouseleave', () => {
      if (this.config.closeDelay > 0) {
        setTimeout(() => {
          if (!panel.matches(':hover') && !panel.querySelector('.dropdown-panel:hover')) {
            this.closePanel(panel);
          }
        }, this.config.closeDelay);
      }
    });
  }

  /**
   * 處理頂層菜單鍵盤事件
   */
  handleTopLevelKeydown(e, item, menuConfig) {
    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        this.closeAllMenus();
        this.openMenu(item, menuConfig);
        // 聚焦第一個菜單項
        setTimeout(() => {
          const panel = document.querySelector(`[data-menu-id="${menuConfig.id}"]`);
          const firstItem = panel?.querySelector('.dropdown-item:not(.menu-divider)');
          firstItem?.focus();
        }, 50);
        break;

      case 'ArrowRight':
        e.preventDefault();
        // 移到下一個頂層菜單
        const next = item.nextElementSibling;
        if (next) next.focus();
        break;

      case 'ArrowLeft':
        e.preventDefault();
        // 移到上一個頂層菜單
        const prev = item.previousElementSibling;
        if (prev) prev.focus();
        break;
    }
  }

  /**
   * 處理菜單項鍵盤事件
   */
  handleItemKeydown(e, item, panel, itemData) {
    const items = Array.from(panel.querySelectorAll('.dropdown-item'));
    const currentIndex = items.indexOf(item);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        // 下一個項目（跳過分隔線）
        for (let i = currentIndex + 1; i < items.length; i++) {
          if (!items[i].classList.contains('menu-divider')) {
            items[i].focus();
            break;
          }
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        // 上一個項目（跳過分隔線）
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (!items[i].classList.contains('menu-divider')) {
            items[i].focus();
            break;
          }
        }
        break;

      case 'ArrowRight':
        e.preventDefault();
        // 如果有子菜單，打開它
        if (itemData.items && itemData.items.length > 0) {
          this.openMenu(item, itemData, true);
          setTimeout(() => {
            const subpanel = item.querySelector('.dropdown-panel');
            const firstSubItem = subpanel?.querySelector('.dropdown-item');
            firstSubItem?.focus();
          }, 50);
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        // 如果是子菜單，返回父菜單
        if (panel.classList.contains('submenu')) {
          this.closePanel(panel);
          // 聚焦回觸發元素
          const trigger = panel.previousElementSibling;
          if (trigger) trigger.focus();
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        item.click();
        break;

      case 'Escape':
        e.preventDefault();
        this.closeAllMenus();
        break;
    }
  }

  /**
   * 定位面板
   */
  positionPanel(panel, triggerElement, isSubmenu) {
    const triggerRect = triggerElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (isSubmenu) {
      // 子菜單：默認顯示在右側
      let left = triggerRect.right;
      let top = triggerRect.top;

      // 邊界檢測
      panel.style.left = '0';
      panel.style.top = '0';
      document.body.appendChild(panel);
      const panelRect = panel.getBoundingClientRect();

      if (left + panelRect.width > viewportWidth) {
        // 右側空間不足，顯示在左側
        left = triggerRect.left - panelRect.width;
      }

      if (top + panelRect.height > viewportHeight) {
        // 底部空間不足，向上對齊
        top = viewportHeight - panelRect.height - 10;
      }

      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
    } else {
      // 頂層菜單：顯示在下方
      let left = triggerRect.left;
      let top = triggerRect.bottom;

      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
    }
  }

  /**
   * 關閉菜單
   */
  closeMenu(triggerElement) {
    const menuId = triggerElement.dataset.menuId;
    const panel = document.querySelector(`.dropdown-panel[data-menu-id="${menuId}"]`);

    if (panel) {
      this.closePanel(panel);
    }

    triggerElement.setAttribute('aria-expanded', 'false');
    triggerElement.classList.remove('active');
  }

  /**
   * 關閉面板
   */
  closePanel(panel) {
    if (!panel) return;

    // 先關閉所有子菜單
    this.closeSubmenuOf(panel);

    panel.classList.remove('open');

    setTimeout(() => {
      if (panel.parentNode) {
        panel.parentNode.removeChild(panel);
      }
      this.activeMenus.delete(panel);
    }, this.config.animationDuration);
  }

  /**
   * 關閉某面板的子菜單
   */
  closeSubmenuOf(panel) {
    const submenus = panel.querySelectorAll('.dropdown-panel.submenu');
    submenus.forEach(submenu => {
      this.closePanel(submenu);
    });
  }

  /**
   * 關閉所有菜單
   */
  closeAllMenus() {
    document.querySelectorAll('.menu-item.top-level').forEach(item => {
      item.setAttribute('aria-expanded', 'false');
      item.classList.remove('active');
    });

    document.querySelectorAll('.dropdown-panel').forEach(panel => {
      this.closePanel(panel);
    });

    this.activeMenus.clear();
  }

  /**
   * 執行菜單項目動作
   */
  executeMenuItem(itemData) {
    this.logAction(`執行動作: ${itemData.label}${itemData.shortcut ? ` (${itemData.shortcut})` : ''}`);
    this.updateStats();
  }

  /**
   * 重置配置
   */
  resetConfig() {
    this.config = {
      openOnHover: true,
      closeDelay: 300,
      animationDuration: 200,
      positioning: 'auto'
    };

    this.hoverDelay = 200;

    document.getElementById('hover-toggle').checked = true;
    document.getElementById('hover-delay-slider').value = 200;
    document.getElementById('hover-delay-value').textContent = '200ms';
    document.getElementById('close-delay-slider').value = 300;
    document.getElementById('close-delay-value').textContent = '300ms';
    document.getElementById('animation-duration-slider').value = 200;
    document.getElementById('animation-duration-value').textContent = '200ms';

    document.documentElement.style.setProperty('--menu-animation-duration', '200ms');

    this.logAction('配置已重置');
  }

  /**
   * 記錄動作
   */
  logAction(message) {
    const log = document.getElementById('action-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';

    const time = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    entry.innerHTML = `
      <span class="log-time">${time}</span>
      <span class="log-message">${message}</span>
    `;

    log.insertBefore(entry, log.firstChild);

    // 限制日誌數量
    if (log.children.length > 50) {
      log.removeChild(log.lastChild);
    }

    // 動畫效果
    requestAnimationFrame(() => {
      entry.classList.add('show');
    });
  }

  /**
   * 更新統計
   */
  updateStats() {
    const totalMenus = this.menuData.length;
    let totalItems = 0;
    let nestedMenus = 0;

    const countItems = (items) => {
      items.forEach(item => {
        if (item.type !== 'divider') {
          totalItems++;
        }
        if (item.items && item.items.length > 0) {
          nestedMenus++;
          countItems(item.items);
        }
      });
    };

    this.menuData.forEach(menu => {
      if (menu.items) {
        countItems(menu.items);
      }
    });

    const actionsCount = document.querySelectorAll('.log-entry').length;

    document.getElementById('total-menus').textContent = totalMenus;
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('nested-menus').textContent = nestedMenus;
    document.getElementById('actions-count').textContent = actionsCount;
  }

  /**
   * 輔助方法：根據 ID 查找項目
   */
  findItemById(items, id) {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.items) {
        const found = this.findItemById(item.items, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * 銷毀
   */
  destroy() {
    this.closeAllMenus();
    this.container.innerHTML = '';
  }
}
