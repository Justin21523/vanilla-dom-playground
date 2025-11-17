# 🚀 Vanilla DOM Playground - 快速啟動指南

## 📋 三種使用方式

### 🐳 方式 1: Docker 部署（推薦用於線上訪問）

**優點**: 可以從任何地方通過網址訪問，適合分享和生產環境

#### 前置需求
- Docker Desktop（[下載安裝](https://www.docker.com/products/docker-desktop/)）

#### 一鍵啟動

```bash
# 在專案目錄下執行
./start.sh
```

或手動執行：

```bash
docker-compose up -d
```

#### 訪問應用

```
🎓 學習中心: http://localhost:8080/
🛠️  構建模式: http://localhost:8080/index.html
🏆 成就中心: http://localhost:8080/achievement-test.html
```

#### 管理命令

```bash
# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down

# 重新啟動
docker-compose restart

# 重新構建
docker-compose up -d --build
```

---

### 💻 方式 2: 本地伺服器（適合開發和學習）

**優點**: 快速啟動，無需 Docker

#### 使用 Python

```bash
# Python 3
python -m http.server 8000

# 訪問
open http://localhost:8000/learn.html
```

#### 使用 Node.js

```bash
# 需要先安裝 Node.js
npx http-server -p 8000

# 訪問
open http://localhost:8000/learn.html
```

#### 使用 PHP

```bash
php -S localhost:8000

# 訪問
open http://localhost:8000/learn.html
```

---

### ☁️ 方式 3: 雲端部署（全球訪問）

**優點**: 永久在線，全球可訪問，支持自定義域名

#### 選項 A: Vercel（完全免費，推薦）

```bash
# 1. 安裝 Vercel CLI
npm install -g vercel

# 2. 登入
vercel login

# 3. 部署
vercel --prod
```

或使用 GitHub 自動部署：
1. 推送代碼到 GitHub
2. 訪問 [vercel.com](https://vercel.com)
3. 連接 GitHub 倉庫
4. 自動部署完成！

**你的網址**: `https://your-project.vercel.app`

---

#### 選項 B: Netlify（完全免費）

```bash
# 1. 安裝 Netlify CLI
npm install -g netlify-cli

# 2. 登入
netlify login

# 3. 部署
netlify deploy --prod --dir=.
```

或使用 GitHub 自動部署：
1. 推送代碼到 GitHub
2. 訪問 [netlify.com](https://netlify.com)
3. 連接 GitHub 倉庫
4. 自動部署完成！

**你的網址**: `https://your-project.netlify.app`

---

#### 選項 C: GitHub Pages（完全免費）

```bash
# 1. 推送代碼到 GitHub
git push origin main

# 2. 在 GitHub 倉庫設置中
# Settings > Pages > Source: main branch

# 3. 等待幾分鐘
```

**你的網址**: `https://your-username.github.io/vanilla-dom-playground/`

---

#### 選項 D: 自己的伺服器 + Docker

```bash
# 1. SSH 到你的伺服器
ssh user@your-server-ip

# 2. 安裝 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. 克隆代碼
git clone https://github.com/your-repo/vanilla-dom-playground.git
cd vanilla-dom-playground

# 4. 啟動
docker-compose up -d
```

**你的網址**: `http://your-server-ip:8080`

---

## 📊 部署方式對比

| 方式 | 費用 | 難度 | 訪問方式 | 適合場景 |
|------|------|------|----------|----------|
| Docker（本地） | 免費 | ⭐⭐ | localhost | 本地測試 |
| Python/Node 伺服器 | 免費 | ⭐ | localhost | 快速開發 |
| Vercel | 免費 | ⭐ | 全球網址 | 最推薦！|
| Netlify | 免費 | ⭐ | 全球網址 | 很推薦！|
| GitHub Pages | 免費 | ⭐⭐ | 全球網址 | 簡單方便 |
| VPS + Docker | $5-20/月 | ⭐⭐⭐ | 自定義域名 | 完全控制 |

---

## 🎯 推薦流程

### 新手推薦

1. **先在本地測試**（方式 2）
   ```bash
   python -m http.server 8000
   ```

2. **滿意後部署到 Vercel**（方式 3A）
   ```bash
   vercel --prod
   ```

3. **分享給朋友** 🎉
   ```
   https://your-project.vercel.app
   ```

### 進階用戶

1. **本地 Docker 測試**（方式 1）
   ```bash
   ./start.sh
   ```

2. **部署到自己的伺服器**（方式 3D）
   ```bash
   ssh user@server
   docker-compose up -d
   ```

3. **配置域名和 HTTPS** 🔒

---

## ✅ 部署檢查清單

部署前確認：

- [ ] 所有文件都在專案目錄
- [ ] Git 已提交所有更改
- [ ] 選擇適合的部署方式

部署後測試：

- [ ] 學習中心可正常訪問
- [ ] 至少測試一個遊戲
- [ ] 至少測試一個教程
- [ ] 成就系統能正常解鎖
- [ ] 構建模式可正常使用

---

## 🆘 常見問題

### Q: 我該選哪種方式？

**A**:
- 只是自己用 → Python 伺服器
- 想分享給朋友 → Vercel 或 Netlify
- 需要完全控制 → VPS + Docker

### Q: Vercel 部署後為何無法訪問？

**A**: 等待 1-2 分鐘讓 DNS 生效，然後清除瀏覽器緩存

### Q: Docker 容器無法啟動？

**A**:
```bash
# 查看詳細錯誤
docker-compose logs

# 檢查端口是否被占用
lsof -i :8080

# 嘗試使用其他端口
# 編輯 docker-compose.yml 改為 "3000:80"
```

### Q: 本地伺服器啟動後顯示 404？

**A**: 確保訪問正確的路徑：
```
✅ http://localhost:8000/learn.html
❌ http://localhost:8000
```

### Q: 如何使用自己的域名？

**A**:
1. 在 Vercel/Netlify 設置中添加自定義域名
2. 在域名註冊商添加 CNAME 記錄
3. 等待 DNS 生效（最多 24 小時）

---

## 📞 需要幫助？

- **完整部署指南**: 查看 [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Docker 指南**: 查看 [README_DOCKER.md](./README_DOCKER.md)
- **使用手冊**: 查看 [docs/USER_GUIDE.md](./docs/USER_GUIDE.md)

---

## 🎉 開始使用！

選擇一種方式，立即開始你的 DOM 學習之旅！

```bash
# 最簡單的方式
python -m http.server 8000

# 然後訪問
http://localhost:8000/learn.html
```

**祝你學習愉快！** 🚀
