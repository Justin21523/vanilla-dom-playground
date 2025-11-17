/**
 * 事件匯流排 - 輕量級 pub/sub 系統
 * 用於模組間通訊，避免直接耦合
 */

class EventBus {
  constructor() {
    // 儲存所有訂閱：{ topic: [handler1, handler2, ...] }
    this.subscribers = new Map();
  }

  /**
   * 訂閱事件
   * @param {string} topic - 事件主題
   * @param {Function} handler - 處理函數
   * @returns {Function} 取消訂閱函數
   */
  subscribe(topic, handler) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }

    this.subscribers.get(topic).push(handler);

    // 返回取消訂閱函數
    return () => {
      const handlers = this.subscribers.get(topic);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * 發布事件
   * @param {string} topic - 事件主題
   * @param {*} payload - 事件資料
   */
  publish(topic, payload) {
    const handlers = this.subscribers.get(topic);
    if (handlers) {
      // 複製陣列以避免在執行過程中訂閱被修改
      [...handlers].forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`事件處理錯誤 [${topic}]:`, error);
        }
      });
    }
  }

  /**
   * 單次訂閱（觸發一次後自動取消）
   * @param {string} topic - 事件主題
   * @param {Function} handler - 處理函數
   */
  once(topic, handler) {
    const unsubscribe = this.subscribe(topic, (payload) => {
      handler(payload);
      unsubscribe();
    });
  }

  /**
   * 清除所有訂閱（主要用於測試）
   */
  clear() {
    this.subscribers.clear();
  }
}

// 匯出單一實例供全域使用
export const eventBus = new EventBus();
