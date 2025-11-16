/**
 * 粒子特效系統
 *
 * 提供各種視覺特效：
 * - 爆炸效果（點擊、成就解鎖）
 * - 星星飄落（遊戲得分）
 * - 波紋擴散（按鈕反饋）
 * - 煙花慶祝（挑戰完成）
 */

export class ParticleEffects {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.particlePool = []; // 粒子池，用於複用
    this.maxParticles = 500; // 最大粒子數

    this.init();
  }

  /**
   * 初始化 Canvas
   */
  init() {
    // 創建 Canvas 層（固定定位，覆蓋全屏）
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'particle-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.resize();

    // 監聽窗口大小改變
    window.addEventListener('resize', () => this.resize());

    // 啟動動畫循環
    this.startAnimation();
  }

  /**
   * 調整 Canvas 大小
   */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * 啟動動畫循環
   */
  startAnimation() {
    const animate = () => {
      this.update();
      this.render();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * 更新所有粒子
   */
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // 更新粒子
      particle.update();

      // 移除死亡粒子
      if (particle.isDead()) {
        const removed = this.particles.splice(i, 1)[0];
        this.recycleParticle(removed); // 回收到粒子池
      }
    }
  }

  /**
   * 渲染所有粒子
   */
  render() {
    // 清空畫布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 繪製所有粒子
    for (const particle of this.particles) {
      particle.render(this.ctx);
    }
  }

  /**
   * 創建粒子（優先從粒子池獲取）
   */
  createParticle(config) {
    if (this.particles.length >= this.maxParticles) {
      return null; // 達到上限，不再創建
    }

    let particle;

    if (this.particlePool.length > 0) {
      // 從粒子池復用
      particle = this.particlePool.pop();
      particle.reset(config);
    } else {
      // 創建新粒子
      particle = new Particle(config);
    }

    this.particles.push(particle);
    return particle;
  }

  /**
   * 回收粒子到粒子池
   */
  recycleParticle(particle) {
    if (this.particlePool.length < 200) { // 限制粒子池大小
      this.particlePool.push(particle);
    }
  }

  /**
   * 爆炸效果
   * @param {number} x - 爆炸中心 X 座標
   * @param {number} y - 爆炸中心 Y 座標
   * @param {object} options - 配置選項
   */
  explode(x, y, options = {}) {
    const config = {
      count: options.count || 30,
      colors: options.colors || ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
      minSpeed: options.minSpeed || 2,
      maxSpeed: options.maxSpeed || 8,
      minSize: options.minSize || 3,
      maxSize: options.maxSize || 8,
      gravity: options.gravity || 0.2,
      friction: options.friction || 0.98,
      life: options.life || 60
    };

    for (let i = 0; i < config.count; i++) {
      const angle = (Math.PI * 2 * i) / config.count;
      const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
      const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
      const color = config.colors[Math.floor(Math.random() * config.colors.length)];

      this.createParticle({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size,
        color: color,
        gravity: config.gravity,
        friction: config.friction,
        life: config.life,
        type: 'circle'
      });
    }
  }

  /**
   * 星星飄落效果
   * @param {number} x - 起始 X 座標
   * @param {number} y - 起始 Y 座標
   * @param {object} options - 配置選項
   */
  starFall(x, y, options = {}) {
    const config = {
      count: options.count || 10,
      colors: options.colors || ['#FFD700', '#FFA500', '#FFFF00'],
      spread: options.spread || 50
    };

    for (let i = 0; i < config.count; i++) {
      const offsetX = (Math.random() - 0.5) * config.spread;
      const color = config.colors[Math.floor(Math.random() * config.colors.length)];

      this.createParticle({
        x: x + offsetX,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        size: 4 + Math.random() * 4,
        color: color,
        gravity: 0.1,
        friction: 0.99,
        life: 80,
        type: 'star'
      });
    }
  }

  /**
   * 波紋擴散效果
   * @param {number} x - 中心 X 座標
   * @param {number} y - 中心 Y 座標
   * @param {object} options - 配置選項
   */
  ripple(x, y, options = {}) {
    const config = {
      color: options.color || '#4ECDC4',
      maxRadius: options.maxRadius || 100,
      duration: options.duration || 30,
      lineWidth: options.lineWidth || 3
    };

    this.createParticle({
      x: x,
      y: y,
      size: 0,
      maxSize: config.maxRadius,
      color: config.color,
      life: config.duration,
      lineWidth: config.lineWidth,
      type: 'ripple'
    });
  }

  /**
   * 煙花效果
   * @param {number} x - 發射 X 座標
   * @param {number} y - 發射 Y 座標（地面）
   * @param {object} options - 配置選項
   */
  firework(x, y, options = {}) {
    const config = {
      targetY: options.targetY || y - 200,
      colors: options.colors || ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D']
    };

    // 第一階段：火箭上升
    const rocket = this.createParticle({
      x: x,
      y: y,
      vx: 0,
      vy: -15,
      size: 4,
      color: '#FFF',
      gravity: 0.1,
      friction: 0.99,
      life: 100,
      type: 'circle',
      onDeath: () => {
        // 第二階段：爆炸
        this.explode(rocket.x, rocket.y, {
          count: 50,
          colors: config.colors,
          minSpeed: 3,
          maxSpeed: 10,
          life: 80
        });
      }
    });

    // 檢測到達目標高度
    const checkHeight = () => {
      if (rocket.y <= config.targetY) {
        rocket.life = 0; // 觸發死亡
      } else if (!rocket.isDead()) {
        requestAnimationFrame(checkHeight);
      }
    };
    checkHeight();
  }

  /**
   * 連續煙花
   * @param {number} count - 煙花數量
   */
  fireworkShow(count = 5) {
    const width = this.canvas.width;
    const height = this.canvas.height;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const x = width * 0.2 + Math.random() * width * 0.6;
        const y = height;
        this.firework(x, y);
      }, i * 500);
    }
  }

  /**
   * 五彩紙屑效果
   * @param {number} x - 中心 X 座標
   * @param {number} y - 中心 Y 座標（頂部）
   * @param {object} options - 配置選項
   */
  confetti(x, y, options = {}) {
    const config = {
      count: options.count || 50,
      colors: options.colors || ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D'],
      spread: options.spread || 200
    };

    for (let i = 0; i < config.count; i++) {
      const angle = Math.random() * Math.PI;
      const speed = Math.random() * 10 + 5;
      const color = config.colors[Math.floor(Math.random() * config.colors.length)];

      this.createParticle({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: 6 + Math.random() * 6,
        color: color,
        gravity: 0.3,
        friction: 0.98,
        life: 120,
        type: 'confetti',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }

  /**
   * 清空所有粒子
   */
  clear() {
    this.particles.forEach(p => this.recycleParticle(p));
    this.particles = [];
  }

  /**
   * 銷毀特效系統
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.particles = [];
    this.particlePool = [];
  }
}

/**
 * 粒子類
 */
class Particle {
  constructor(config) {
    this.reset(config);
  }

  reset(config) {
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.size = config.size || 5;
    this.maxSize = config.maxSize || this.size;
    this.color = config.color || '#FFF';
    this.gravity = config.gravity || 0;
    this.friction = config.friction || 1;
    this.life = config.life || 60;
    this.maxLife = this.life;
    this.type = config.type || 'circle';
    this.lineWidth = config.lineWidth || 2;
    this.rotation = config.rotation || 0;
    this.rotationSpeed = config.rotationSpeed || 0;
    this.onDeath = config.onDeath || null;
  }

  update() {
    // 應用重力
    this.vy += this.gravity;

    // 應用摩擦力
    this.vx *= this.friction;
    this.vy *= this.friction;

    // 更新位置
    this.x += this.vx;
    this.y += this.vy;

    // 更新旋轉
    this.rotation += this.rotationSpeed;

    // 波紋特效的大小增長
    if (this.type === 'ripple') {
      const progress = 1 - (this.life / this.maxLife);
      this.size = this.maxSize * progress;
    }

    // 減少生命值
    this.life--;

    // 觸發死亡回調
    if (this.life <= 0 && this.onDeath) {
      this.onDeath();
      this.onDeath = null; // 只觸發一次
    }
  }

  render(ctx) {
    const alpha = this.life / this.maxLife; // 透明度隨生命值衰減

    ctx.save();
    ctx.globalAlpha = alpha;

    switch (this.type) {
      case 'circle':
        this.renderCircle(ctx);
        break;
      case 'star':
        this.renderStar(ctx);
        break;
      case 'ripple':
        this.renderRipple(ctx);
        break;
      case 'confetti':
        this.renderConfetti(ctx);
        break;
    }

    ctx.restore();
  }

  renderCircle(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  renderStar(ctx) {
    ctx.fillStyle = this.color;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const spikes = 5;
    const outerRadius = this.size;
    const innerRadius = this.size / 2;

    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / spikes) * i;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  renderRipple(ctx) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.stroke();
  }

  renderConfetti(ctx) {
    ctx.fillStyle = this.color;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

// 導出單例實例
export const particleEffects = new ParticleEffects();
