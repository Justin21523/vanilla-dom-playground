/**
 * TODO List Pro - 專業待辦事項應用
 *
 * 學習目標:
 * - localStorage 數據持久化
 * - 拖放排序 (Drag & Drop API)
 * - 多種事件組合使用
 * - 過濾和搜索功能
 * - 編輯模式切換
 * - 統計數據計算
 *
 * 使用純 Vanilla JavaScript，無任何框架依賴
 */

export class TodoListPro {
  constructor(container) {
    this.container = container;

    // 狀態
    this.todos = [];
    this.nextId = 1;
    this.filter = 'all'; // all, active, completed
    this.searchQuery = '';
    this.draggedElement = null;
    this.editingId = null;

    // localStorage key
    this.storageKey = 'todoListPro_data';

    this.init();
  }

  /**
   * 初始化應用
   */
  init() {
    this.loadFromStorage();
    this.render();
    this.bindEvents();
    this.updateStats();
  }

  /**
   * 渲染 UI
   */
  render() {
    this.container.innerHTML = `
      <div class="todo-app">
        <!-- 應用標題 -->
        <div class="app-header">
          <h1 class="app-title">📝 TODO List Pro</h1>
          <p class="app-subtitle">專業待辦事項管理 - 支持拖放排序、搜索、過濾</p>
        </div>

        <!-- 統計面板 -->
        <div class="stats-panel">
          <div class="stat-card">
            <div class="stat-value" id="total-count">0</div>
            <div class="stat-label">總任務</div>
          </div>
          <div class="stat-card active">
            <div class="stat-value" id="active-count">0</div>
            <div class="stat-label">進行中</div>
          </div>
          <div class="stat-card completed">
            <div class="stat-value" id="completed-count">0</div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-card progress">
            <div class="stat-value" id="completion-rate">0%</div>
            <div class="stat-label">完成率</div>
          </div>
        </div>

        <!-- 輸入區域 -->
        <div class="input-section">
          <div class="input-group">
            <input
              type="text"
              id="todo-input"
              class="todo-input"
              placeholder="輸入新任務... (按 Enter 添加)"
              autocomplete="off"
            />
            <button class="btn btn-add" id="add-btn">
              ➕ 添加
            </button>
          </div>

          <!-- 搜索和篩選 -->
          <div class="control-bar">
            <div class="search-box">
              <input
                type="text"
                id="search-input"
                class="search-input"
                placeholder="🔍 搜索任務..."
                autocomplete="off"
              />
            </div>

            <div class="filter-buttons">
              <button class="filter-btn active" data-filter="all">
                全部 <span class="badge" id="badge-all">0</span>
              </button>
              <button class="filter-btn" data-filter="active">
                進行中 <span class="badge" id="badge-active">0</span>
              </button>
              <button class="filter-btn" data-filter="completed">
                已完成 <span class="badge" id="badge-completed">0</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 任務列表 -->
        <div class="todos-container">
          <div id="todos-list" class="todos-list">
            <!-- 任務項目將動態插入這裡 -->
          </div>

          <!-- 空狀態 -->
          <div id="empty-state" class="empty-state">
            <div class="empty-icon">📋</div>
            <p class="empty-text">還沒有任務，開始添加吧！</p>
          </div>
        </div>

        <!-- 批量操作 -->
        <div class="bulk-actions">
          <button class="btn btn-secondary" id="clear-completed">
            🗑️ 清除已完成
          </button>
          <button class="btn btn-secondary" id="mark-all-completed">
            ✅ 全部標記完成
          </button>
          <button class="btn btn-danger" id="clear-all">
            ⚠️ 清空所有
          </button>
        </div>

        <!-- 學習提示 -->
        <div class="learning-tips">
          <h3>💡 涉及的技術點</h3>
          <div class="tips-grid">
            <div class="tip-item">
              <strong>事件處理:</strong>
              <p>click, input, keydown, change, dblclick</p>
            </div>
            <div class="tip-item">
              <strong>拖放 API:</strong>
              <p>dragstart, dragover, drop, dragend</p>
            </div>
            <div class="tip-item">
              <strong>數據持久化:</strong>
              <p>localStorage (保存/讀取 JSON)</p>
            </div>
            <div class="tip-item">
              <strong>DOM 操作:</strong>
              <p>createElement, classList, dataset</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderTodoList();
  }

  /**
   * 綁定事件
   */
  bindEvents() {
    // 添加任務
    const addBtn = document.getElementById('add-btn');
    const todoInput = document.getElementById('todo-input');

    addBtn.addEventListener('click', () => this.addTodo());
    todoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.addTodo();
      }
    });

    // 搜索
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.renderTodoList();
    });

    // 過濾按鈕
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // 移除所有 active
        filterButtons.forEach(b => b.classList.remove('active'));
        // 添加 active 到當前按鈕
        btn.classList.add('active');

        this.filter = btn.dataset.filter;
        this.renderTodoList();
      });
    });

    // 批量操作
    document.getElementById('clear-completed').addEventListener('click', () => {
      this.clearCompleted();
    });

    document.getElementById('mark-all-completed').addEventListener('click', () => {
      this.markAllCompleted();
    });

    document.getElementById('clear-all').addEventListener('click', () => {
      if (confirm('確定要清空所有任務嗎？')) {
        this.clearAll();
      }
    });
  }

  /**
   * 渲染任務列表
   */
  renderTodoList() {
    const todosList = document.getElementById('todos-list');
    const emptyState = document.getElementById('empty-state');

    // 過濾和搜索
    let filteredTodos = this.todos;

    // 應用過濾器
    if (this.filter === 'active') {
      filteredTodos = filteredTodos.filter(todo => !todo.completed);
    } else if (this.filter === 'completed') {
      filteredTodos = filteredTodos.filter(todo => todo.completed);
    }

    // 應用搜索
    if (this.searchQuery) {
      filteredTodos = filteredTodos.filter(todo =>
        todo.text.toLowerCase().includes(this.searchQuery)
      );
    }

    // 顯示/隱藏空狀態
    if (filteredTodos.length === 0) {
      todosList.style.display = 'none';
      emptyState.style.display = 'flex';

      if (this.searchQuery) {
        emptyState.innerHTML = `
          <div class="empty-icon">🔍</div>
          <p class="empty-text">沒有找到匹配的任務</p>
        `;
      } else if (this.filter === 'active' && this.todos.length > 0) {
        emptyState.innerHTML = `
          <div class="empty-icon">🎉</div>
          <p class="empty-text">太棒了！沒有待完成的任務</p>
        `;
      } else if (this.filter === 'completed' && this.todos.length > 0) {
        emptyState.innerHTML = `
          <div class="empty-icon">📋</div>
          <p class="empty-text">還沒有完成的任務</p>
        `;
      } else {
        emptyState.innerHTML = `
          <div class="empty-icon">📋</div>
          <p class="empty-text">還沒有任務，開始添加吧！</p>
        `;
      }
    } else {
      todosList.style.display = 'block';
      emptyState.style.display = 'none';
    }

    // 渲染任務項目
    todosList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');

    // 綁定任務項目的事件
    this.bindTodoEvents();

    // 更新統計
    this.updateStats();
  }

  /**
   * 創建任務 HTML
   */
  createTodoHTML(todo) {
    const isEditing = this.editingId === todo.id;

    return `
      <div
        class="todo-item ${todo.completed ? 'completed' : ''}"
        data-id="${todo.id}"
        draggable="true"
      >
        <div class="todo-drag-handle">⋮⋮</div>

        <div class="todo-checkbox">
          <input
            type="checkbox"
            class="todo-check"
            ${todo.completed ? 'checked' : ''}
            data-id="${todo.id}"
          />
        </div>

        <div class="todo-content">
          ${isEditing ? `
            <input
              type="text"
              class="todo-edit-input"
              value="${this.escapeHtml(todo.text)}"
              data-id="${todo.id}"
              autofocus
            />
          ` : `
            <span class="todo-text" data-id="${todo.id}">${this.escapeHtml(todo.text)}</span>
          `}
          <div class="todo-meta">
            <span class="todo-time">${this.formatDate(todo.createdAt)}</span>
          </div>
        </div>

        <div class="todo-actions">
          ${!isEditing ? `
            <button class="btn-icon btn-edit" data-id="${todo.id}" title="編輯">
              ✏️
            </button>
          ` : `
            <button class="btn-icon btn-save" data-id="${todo.id}" title="保存">
              💾
            </button>
          `}
          <button class="btn-icon btn-delete" data-id="${todo.id}" title="刪除">
            🗑️
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 綁定任務項目事件
   */
  bindTodoEvents() {
    // 複選框
    document.querySelectorAll('.todo-check').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.toggleTodo(id);
      });
    });

    // 編輯按鈕
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.startEdit(id);
      });
    });

    // 保存按鈕
    document.querySelectorAll('.btn-save').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.saveEdit(id);
      });
    });

    // 刪除按鈕
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.deleteTodo(id);
      });
    });

    // 雙擊編輯
    document.querySelectorAll('.todo-text').forEach(span => {
      span.addEventListener('dblclick', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.startEdit(id);
      });
    });

    // 編輯輸入框 - Enter 保存
    document.querySelectorAll('.todo-edit-input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (e.key === 'Enter') {
          this.saveEdit(id);
        } else if (e.key === 'Escape') {
          this.cancelEdit();
        }
      });
    });

    // 拖放事件
    this.bindDragEvents();
  }

  /**
   * 綁定拖放事件
   */
  bindDragEvents() {
    const todoItems = document.querySelectorAll('.todo-item');

    todoItems.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        this.draggedElement = item;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', item.innerHTML);
      });

      item.addEventListener('dragend', (e) => {
        item.classList.remove('dragging');
        this.draggedElement = null;
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (this.draggedElement && this.draggedElement !== item) {
          const rect = item.getBoundingClientRect();
          const midpoint = rect.top + rect.height / 2;

          if (e.clientY < midpoint) {
            item.classList.add('drag-over-top');
            item.classList.remove('drag-over-bottom');
          } else {
            item.classList.add('drag-over-bottom');
            item.classList.remove('drag-over-top');
          }
        }
      });

      item.addEventListener('dragleave', (e) => {
        item.classList.remove('drag-over-top', 'drag-over-bottom');
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('drag-over-top', 'drag-over-bottom');

        if (this.draggedElement && this.draggedElement !== item) {
          const draggedId = parseInt(this.draggedElement.dataset.id);
          const targetId = parseInt(item.dataset.id);

          this.reorderTodos(draggedId, targetId);
        }
      });
    });
  }

  /**
   * 添加任務
   */
  addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();

    if (!text) {
      alert('請輸入任務內容');
      return;
    }

    const todo = {
      id: this.nextId++,
      text: text,
      completed: false,
      createdAt: Date.now()
    };

    this.todos.unshift(todo);
    input.value = '';
    input.focus();

    this.saveToStorage();
    this.renderTodoList();
  }

  /**
   * 切換任務狀態
   */
  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveToStorage();
      this.renderTodoList();
    }
  }

  /**
   * 開始編輯
   */
  startEdit(id) {
    this.editingId = id;
    this.renderTodoList();
  }

  /**
   * 保存編輯
   */
  saveEdit(id) {
    const input = document.querySelector(`.todo-edit-input[data-id="${id}"]`);
    const newText = input.value.trim();

    if (!newText) {
      alert('任務內容不能為空');
      return;
    }

    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.text = newText;
      this.editingId = null;
      this.saveToStorage();
      this.renderTodoList();
    }
  }

  /**
   * 取消編輯
   */
  cancelEdit() {
    this.editingId = null;
    this.renderTodoList();
  }

  /**
   * 刪除任務
   */
  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.saveToStorage();
    this.renderTodoList();
  }

  /**
   * 重新排序
   */
  reorderTodos(draggedId, targetId) {
    const draggedIndex = this.todos.findIndex(t => t.id === draggedId);
    const targetIndex = this.todos.findIndex(t => t.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // 移除拖動的項目
    const [draggedTodo] = this.todos.splice(draggedIndex, 1);

    // 插入到目標位置
    this.todos.splice(targetIndex, 0, draggedTodo);

    this.saveToStorage();
    this.renderTodoList();
  }

  /**
   * 清除已完成
   */
  clearCompleted() {
    this.todos = this.todos.filter(t => !t.completed);
    this.saveToStorage();
    this.renderTodoList();
  }

  /**
   * 全部標記完成
   */
  markAllCompleted() {
    this.todos.forEach(todo => {
      todo.completed = true;
    });
    this.saveToStorage();
    this.renderTodoList();
  }

  /**
   * 清空所有
   */
  clearAll() {
    this.todos = [];
    this.saveToStorage();
    this.renderTodoList();
  }

  /**
   * 更新統計
   */
  updateStats() {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const active = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('total-count').textContent = total;
    document.getElementById('active-count').textContent = active;
    document.getElementById('completed-count').textContent = completed;
    document.getElementById('completion-rate').textContent = `${rate}%`;

    // 更新過濾按鈕徽章
    document.getElementById('badge-all').textContent = total;
    document.getElementById('badge-active').textContent = active;
    document.getElementById('badge-completed').textContent = completed;
  }

  /**
   * 保存到 localStorage
   */
  saveToStorage() {
    const data = {
      todos: this.todos,
      nextId: this.nextId
    };
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * 從 localStorage 加載
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.todos = parsed.todos || [];
        this.nextId = parsed.nextId || 1;
      }
    } catch (e) {
      console.error('載入數據失敗:', e);
    }
  }

  /**
   * 格式化日期
   */
  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // 小於 1 分鐘
    if (diff < 60000) {
      return '剛剛';
    }
    // 小於 1 小時
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分鐘前`;
    }
    // 小於 1 天
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小時前`;
    }
    // 否則顯示日期
    return date.toLocaleDateString('zh-TW');
  }

  /**
   * 轉義 HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 銷毀應用
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
