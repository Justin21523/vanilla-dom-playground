/**
 * 表單驗證大師 (Form Master)
 *
 * 學習目標:
 * - input - 實時輸入事件
 * - change - 值改變事件
 * - focus / blur - 焦點事件
 * - submit - 表單提交事件
 * - invalid - HTML5 驗證失敗事件
 * - 正則表達式驗證
 * - 自定義驗證邏輯
 *
 * 使用純 Vanilla JavaScript，無任何框架依賴
 */

import { particleEffects } from '../../ui/particleEffects.js';

export class FormMaster {
  constructor(container) {
    this.container = container;

    // 驗證規則
    this.validators = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[0-9]{1,3}[\s-]?[(]?[0-9]{1,4}[)]?[\s-]?[0-9]{1,4}[\s-]?[0-9]{1,9}$/,
      creditCard: /^[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}$/,
      username: /^[a-zA-Z0-9_]{3,16}$/
    };

    // 信用卡類型
    this.cardPatterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/
    };

    // 遊戲狀態
    this.validFields = new Set();
    this.totalFields = 5;
    this.score = 0;
    this.attempts = 0;
    this.perfectSubmit = true;
    this.startTime = null;
    this.completionTime = null;

    // DOM 元素
    this.form = null;
    this.progressDisplay = null;
    this.scoreDisplay = null;

    this.init();
  }

  /**
   * 初始化遊戲
   */
  init() {
    this.render();
    this.bindEvents();
  }

  /**
   * 渲染遊戲 UI
   */
  render() {
    this.container.innerHTML = `
      <div class="form-master-game">
        <!-- 遊戲標題 -->
        <div class="game-header">
          <h2 class="game-title">📝 表單驗證大師</h2>
          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-label">進度</span>
              <span class="stat-value" id="fm-progress">0/5</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">得分</span>
              <span class="stat-value" id="fm-score">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">嘗試</span>
              <span class="stat-value" id="fm-attempts">0</span>
            </div>
          </div>
        </div>

        <!-- 表單區域 -->
        <div class="game-canvas">
          <form id="master-form" novalidate>
            <!-- 用戶名 -->
            <div class="form-field">
              <label for="fm-username">
                👤 用戶名
                <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <input
                  type="text"
                  id="fm-username"
                  name="username"
                  placeholder="3-16個字符，字母數字下劃線"
                  autocomplete="off"
                  required
                />
                <span class="validation-icon"></span>
              </div>
              <div class="field-hint">支持 a-z, A-Z, 0-9, _</div>
              <div class="field-error"></div>
            </div>

            <!-- 郵箱 -->
            <div class="form-field">
              <label for="fm-email">
                ✉️ 電子郵箱
                <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <input
                  type="email"
                  id="fm-email"
                  name="email"
                  placeholder="example@domain.com"
                  autocomplete="off"
                  required
                />
                <span class="validation-icon"></span>
              </div>
              <div class="field-hint">請輸入有效的郵箱地址</div>
              <div class="field-error"></div>
            </div>

            <!-- 密碼 -->
            <div class="form-field">
              <label for="fm-password">
                🔒 密碼
                <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <input
                  type="password"
                  id="fm-password"
                  name="password"
                  placeholder="至少8個字符"
                  autocomplete="off"
                  required
                />
                <span class="validation-icon"></span>
                <button type="button" class="toggle-password" id="fm-toggle-pwd">👁️</button>
              </div>
              <div class="password-strength">
                <div class="strength-label">強度: <span id="fm-strength-text">無</span></div>
                <div class="strength-meter">
                  <div class="strength-bar" id="fm-strength-bar"></div>
                </div>
              </div>
              <div class="password-checks">
                <span class="check-item" id="check-length">至少8字符</span>
                <span class="check-item" id="check-lowercase">小寫字母</span>
                <span class="check-item" id="check-uppercase">大寫字母</span>
                <span class="check-item" id="check-number">數字</span>
                <span class="check-item" id="check-special">特殊符號</span>
              </div>
              <div class="field-error"></div>
            </div>

            <!-- 電話 -->
            <div class="form-field">
              <label for="fm-phone">
                📞 電話號碼
                <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <input
                  type="tel"
                  id="fm-phone"
                  name="phone"
                  placeholder="+886-912-345-678"
                  autocomplete="off"
                  required
                />
                <span class="validation-icon"></span>
              </div>
              <div class="field-hint">格式: +國碼-區號-號碼</div>
              <div class="field-error"></div>
            </div>

            <!-- 信用卡 -->
            <div class="form-field">
              <label for="fm-card">
                💳 信用卡號
                <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <input
                  type="text"
                  id="fm-card"
                  name="card"
                  placeholder="1234-5678-9012-3456"
                  maxlength="19"
                  autocomplete="off"
                  required
                />
                <span class="validation-icon"></span>
                <span class="card-type" id="fm-card-type"></span>
              </div>
              <div class="field-hint">16位數字，自動格式化</div>
              <div class="field-error"></div>
            </div>

            <!-- 提交按鈕 -->
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" id="fm-submit">
                提交表單 <span id="fm-submit-count">(0/5 ✓)</span>
              </button>
              <button type="button" class="btn btn-secondary" id="fm-reset">重置</button>
            </div>
          </form>
        </div>

        <!-- 學習要點 -->
        <div class="game-tips">
          <h3>💡 學習要點</h3>
          <ul>
            <li><code>input</code> - 實時輸入監聽（即時反饋）</li>
            <li><code>change</code> - 值改變事件（失焦後觸發）</li>
            <li><code>focus</code> - 獲得焦點時清除錯誤</li>
            <li><code>blur</code> - 失焦時執行嚴格驗證</li>
            <li><code>submit</code> - 表單提交攔截（preventDefault）</li>
            <li><code>invalid</code> - HTML5 驗證失敗（捕獲階段）</li>
            <li>正則表達式 - 格式驗證（email, phone, card）</li>
          </ul>
        </div>

        <!-- 成功彈窗 -->
        <div class="game-over-modal" id="fm-modal" style="display: none;">
          <div class="modal-content">
            <h2>🎉 驗證成功！</h2>
            <div class="final-stats">
              <p>最終得分: <strong id="fm-final-score">0</strong></p>
              <p>完成時間: <strong id="fm-final-time">--</strong></p>
              <p>錯誤次數: <strong id="fm-final-errors">0</strong></p>
              <p>評級: <strong id="fm-final-rating">⭐⭐⭐</strong></p>
            </div>
            <button class="btn btn-primary" id="fm-try-again">再試一次</button>
          </div>
        </div>
      </div>
    `;

    // 獲取 DOM 元素引用
    this.form = document.getElementById('master-form');
    this.progressDisplay = document.getElementById('fm-progress');
    this.scoreDisplay = document.getElementById('fm-score');
  }

  /**
   * 綁定事件
   */
  bindEvents() {
    // 用戶名驗證
    this.setupFieldValidation('fm-username', 'username', '用戶名');

    // 郵箱驗證
    this.setupFieldValidation('fm-email', 'email', '郵箱');

    // 密碼驗證（特殊處理）
    this.setupPasswordValidation();

    // 電話驗證
    this.setupFieldValidation('fm-phone', 'phone', '電話');

    // 信用卡驗證（特殊處理）
    this.setupCreditCardValidation();

    // 表單提交
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // HTML5 invalid 事件（捕獲階段）
    this.form.addEventListener('invalid', (e) => {
      e.preventDefault();
      this.showCustomValidation(e.target);
    }, true);

    // 重置按鈕
    const resetBtn = document.getElementById('fm-reset');
    resetBtn.addEventListener('click', () => this.reset());

    // 再試一次
    const tryAgainBtn = document.getElementById('fm-try-again');
    tryAgainBtn.addEventListener('click', () => {
      this.hideModal();
      this.reset();
    });

    // 密碼顯示/隱藏
    const togglePwdBtn = document.getElementById('fm-toggle-pwd');
    const passwordInput = document.getElementById('fm-password');
    togglePwdBtn.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      togglePwdBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }

  /**
   * 設置字段驗證
   */
  setupFieldValidation(fieldId, validatorKey, fieldName) {
    const input = document.getElementById(fieldId);
    const wrapper = input.closest('.form-field');
    const errorDiv = wrapper.querySelector('.field-error');
    const icon = wrapper.querySelector('.validation-icon');

    // input 事件 - 實時驗證
    input.addEventListener('input', (e) => {
      const value = e.target.value.trim();

      if (value.length === 0) {
        this.clearValidation(wrapper, icon);
        return;
      }

      const isValid = this.validators[validatorKey].test(value);

      if (isValid) {
        this.setValid(wrapper, icon, fieldId);
      } else {
        this.setInvalid(wrapper, icon);
      }
    });

    // blur 事件 - 失焦嚴格驗證
    input.addEventListener('blur', (e) => {
      const value = e.target.value.trim();

      if (value.length === 0) {
        this.showError(wrapper, errorDiv, `${fieldName}為必填項目`);
        this.setInvalid(wrapper, icon);
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
      } else if (!this.validators[validatorKey].test(value)) {
        this.showError(wrapper, errorDiv, `${fieldName}格式不正確`);
        this.setInvalid(wrapper, icon);
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
      }
    });

    // focus 事件 - 清除錯誤
    input.addEventListener('focus', (e) => {
      this.clearError(wrapper, errorDiv);
      input.classList.remove('shake');
    });
  }

  /**
   * 設置密碼驗證
   */
  setupPasswordValidation() {
    const input = document.getElementById('fm-password');
    const wrapper = input.closest('.form-field');
    const errorDiv = wrapper.querySelector('.field-error');
    const icon = wrapper.querySelector('.validation-icon');

    // input 事件 - 實時強度檢測
    input.addEventListener('input', (e) => {
      const password = e.target.value;
      const strength = this.checkPasswordStrength(password);

      this.updateStrengthMeter(strength);
      this.updatePasswordChecks(strength.checks);

      if (password.length === 0) {
        this.clearValidation(wrapper, icon);
      } else if (strength.score >= 3) {
        this.setValid(wrapper, icon, 'fm-password');
      } else {
        this.setInvalid(wrapper, icon);
      }
    });

    // blur 事件
    input.addEventListener('blur', (e) => {
      const password = e.target.value;
      const strength = this.checkPasswordStrength(password);

      if (password.length === 0) {
        this.showError(wrapper, errorDiv, '密碼為必填項目');
        this.setInvalid(wrapper, icon);
      } else if (strength.score < 3) {
        this.showError(wrapper, errorDiv, '密碼強度不足（需至少3項要求）');
        this.setInvalid(wrapper, icon);
      }
    });

    // focus 事件
    input.addEventListener('focus', (e) => {
      this.clearError(wrapper, errorDiv);
    });
  }

  /**
   * 設置信用卡驗證
   */
  setupCreditCardValidation() {
    const input = document.getElementById('fm-card');
    const wrapper = input.closest('.form-field');
    const errorDiv = wrapper.querySelector('.field-error');
    const icon = wrapper.querySelector('.validation-icon');
    const cardTypeDisplay = document.getElementById('fm-card-type');

    // input 事件 - 自動格式化和檢測類型
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, ''); // 只保留數字

      // 限制長度
      if (value.length > 16) {
        value = value.slice(0, 16);
      }

      // 自動格式化（每4位加破折號）
      const formatted = value.match(/.{1,4}/g)?.join('-') || value;
      e.target.value = formatted;

      // 檢測卡片類型
      const cardType = this.detectCardType(value);
      this.showCardType(cardTypeDisplay, cardType);

      // 驗證
      if (value.length === 0) {
        this.clearValidation(wrapper, icon);
      } else if (value.length === 16) {
        this.setValid(wrapper, icon, 'fm-card');
      } else {
        this.setInvalid(wrapper, icon);
      }
    });

    // blur 事件
    input.addEventListener('blur', (e) => {
      const value = e.target.value.replace(/\D/g, '');

      if (value.length === 0) {
        this.showError(wrapper, errorDiv, '信用卡號為必填項目');
        this.setInvalid(wrapper, icon);
      } else if (value.length !== 16) {
        this.showError(wrapper, errorDiv, '信用卡號必須為16位數字');
        this.setInvalid(wrapper, icon);
      }
    });

    // focus 事件
    input.addEventListener('focus', (e) => {
      this.clearError(wrapper, errorDiv);
    });
  }

  /**
   * 檢查密碼強度
   */
  checkPasswordStrength(password) {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;

    const labels = ['無', '極弱', '弱', '中等', '強', '極強'];
    const colors = ['#ccc', '#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#27ae60'];

    return {
      score,
      checks,
      label: labels[score],
      color: colors[score],
      width: (score / 5) * 100
    };
  }

  /**
   * 更新強度計
   */
  updateStrengthMeter(strength) {
    const bar = document.getElementById('fm-strength-bar');
    const text = document.getElementById('fm-strength-text');

    bar.style.width = strength.width + '%';
    bar.style.background = strength.color;
    text.textContent = strength.label;
    text.style.color = strength.color;
  }

  /**
   * 更新密碼檢查項
   */
  updatePasswordChecks(checks) {
    document.getElementById('check-length').classList.toggle('checked', checks.length);
    document.getElementById('check-lowercase').classList.toggle('checked', checks.lowercase);
    document.getElementById('check-uppercase').classList.toggle('checked', checks.uppercase);
    document.getElementById('check-number').classList.toggle('checked', checks.number);
    document.getElementById('check-special').classList.toggle('checked', checks.special);
  }

  /**
   * 檢測信用卡類型
   */
  detectCardType(number) {
    for (const [type, pattern] of Object.entries(this.cardPatterns)) {
      if (pattern.test(number)) {
        return type;
      }
    }
    return 'unknown';
  }

  /**
   * 顯示卡片類型
   */
  showCardType(element, type) {
    const icons = {
      visa: '💳 VISA',
      mastercard: '💳 MasterCard',
      amex: '💳 AMEX',
      discover: '💳 Discover',
      unknown: ''
    };

    element.textContent = icons[type] || '';
  }

  /**
   * 設置字段為有效
   */
  setValid(wrapper, icon, fieldId) {
    wrapper.classList.remove('invalid');
    wrapper.classList.add('valid');
    icon.textContent = '✓';
    icon.className = 'validation-icon valid';

    this.validFields.add(fieldId);
    this.updateProgress();
  }

  /**
   * 設置字段為無效
   */
  setInvalid(wrapper, icon) {
    wrapper.classList.remove('valid');
    wrapper.classList.add('invalid');
    icon.textContent = '✗';
    icon.className = 'validation-icon invalid';
  }

  /**
   * 清除驗證狀態
   */
  clearValidation(wrapper, icon) {
    wrapper.classList.remove('valid', 'invalid');
    icon.textContent = '';
    icon.className = 'validation-icon';
  }

  /**
   * 顯示錯誤
   */
  showError(wrapper, errorDiv, message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    wrapper.classList.add('invalid');
    this.perfectSubmit = false;
  }

  /**
   * 清除錯誤
   */
  clearError(wrapper, errorDiv) {
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
    wrapper.classList.remove('invalid');
  }

  /**
   * 顯示自定義驗證消息
   */
  showCustomValidation(input) {
    const wrapper = input.closest('.form-field');
    const errorDiv = wrapper.querySelector('.field-error');

    if (input.validity.valueMissing) {
      this.showError(wrapper, errorDiv, '此欄位為必填');
    } else if (input.validity.typeMismatch) {
      this.showError(wrapper, errorDiv, '格式不正確');
    } else if (input.validity.patternMismatch) {
      this.showError(wrapper, errorDiv, '不符合要求的格式');
    }
  }

  /**
   * 更新進度
   */
  updateProgress() {
    this.progressDisplay.textContent = `${this.validFields.size}/${this.totalFields}`;
    document.getElementById('fm-submit-count').textContent = `(${this.validFields.size}/${this.totalFields} ✓)`;
  }

  /**
   * 處理表單提交
   */
  handleSubmit(event) {
    event.preventDefault();

    if (!this.startTime) {
      this.startTime = Date.now();
    }

    this.attempts++;
    document.getElementById('fm-attempts').textContent = this.attempts;

    // 驗證所有字段
    const isValid = this.validateAll();

    if (isValid) {
      this.completionTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
      this.calculateScore();
      this.showSuccess();
    } else {
      this.showSubmitError();
    }
  }

  /**
   * 驗證所有字段
   */
  validateAll() {
    return this.validFields.size === this.totalFields;
  }

  /**
   * 計算得分
   */
  calculateScore() {
    let score = 1000;

    // 時間獎勵（10秒內完成+500分）
    if (this.completionTime <= 10) {
      score += 500;
    } else if (this.completionTime <= 30) {
      score += 300;
    }

    // 零錯誤獎勵
    if (this.perfectSubmit) {
      score += 300;
    }

    // 嘗試次數懲罰
    score -= (this.attempts - 1) * 50;

    this.score = Math.max(0, score);
    this.scoreDisplay.textContent = this.score;
  }

  /**
   * 顯示提交錯誤
   */
  showSubmitError() {
    const submitBtn = document.getElementById('fm-submit');
    submitBtn.classList.add('shake');
    setTimeout(() => submitBtn.classList.remove('shake'), 500);

    // 顯示錯誤提示
    const errorMsg = document.createElement('div');
    errorMsg.className = 'submit-error';
    errorMsg.textContent = '❌ 請完成所有必填項目並確保格式正確！';
    errorMsg.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #e74c3c;
      color: white;
      padding: 15px 30px;
      border-radius: 8px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideDown 0.3s ease;
    `;

    document.body.appendChild(errorMsg);

    setTimeout(() => {
      errorMsg.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => errorMsg.remove(), 300);
    }, 3000);
  }

  /**
   * 顯示成功
   */
  showSuccess() {
    // 計算評級
    const rating = this.calculateRating();

    // 更新彈窗
    document.getElementById('fm-final-score').textContent = this.score;
    document.getElementById('fm-final-time').textContent = `${this.completionTime}秒`;
    document.getElementById('fm-final-errors').textContent = this.attempts - 1;
    document.getElementById('fm-final-rating').textContent = rating.stars;

    // 慶祝特效
    if (rating.level >= 4) {
      particleEffects.fireworkShow(5);
    } else if (rating.level >= 3) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      particleEffects.confetti(centerX, centerY - 100, { count: 40 });
    }

    // 顯示彈窗
    setTimeout(() => {
      this.showModal();
    }, 500);
  }

  /**
   * 計算評級
   */
  calculateRating() {
    let level = 1;
    let stars = '⭐';

    if (this.score >= 1500 && this.perfectSubmit) {
      level = 5;
      stars = '⭐⭐⭐⭐⭐ 完美！';
    } else if (this.score >= 1200) {
      level = 4;
      stars = '⭐⭐⭐⭐';
    } else if (this.score >= 900) {
      level = 3;
      stars = '⭐⭐⭐';
    } else if (this.score >= 600) {
      level = 2;
      stars = '⭐⭐';
    }

    return { level, stars };
  }

  /**
   * 重置遊戲
   */
  reset() {
    this.form.reset();
    this.validFields.clear();
    this.score = 0;
    this.attempts = 0;
    this.perfectSubmit = true;
    this.startTime = null;
    this.completionTime = null;

    // 清除所有驗證狀態
    const fields = document.querySelectorAll('.form-field');
    fields.forEach(field => {
      field.classList.remove('valid', 'invalid');
      const icon = field.querySelector('.validation-icon');
      if (icon) {
        icon.textContent = '';
        icon.className = 'validation-icon';
      }
      const error = field.querySelector('.field-error');
      if (error) {
        error.textContent = '';
        error.style.display = 'none';
      }
    });

    // 重置密碼強度
    this.updateStrengthMeter({ score: 0, label: '無', color: '#ccc', width: 0 });
    this.updatePasswordChecks({
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false
    });

    // 重置卡片類型
    document.getElementById('fm-card-type').textContent = '';

    // 更新顯示
    this.updateProgress();
    this.scoreDisplay.textContent = '0';
    document.getElementById('fm-attempts').textContent = '0';
  }

  /**
   * 顯示彈窗
   */
  showModal() {
    const modal = document.getElementById('fm-modal');
    modal.style.display = 'flex';
  }

  /**
   * 隱藏彈窗
   */
  hideModal() {
    const modal = document.getElementById('fm-modal');
    modal.style.display = 'none';
  }

  /**
   * 銷毀遊戲
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
