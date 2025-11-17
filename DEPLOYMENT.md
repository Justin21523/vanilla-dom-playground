# 🚀 Vanilla DOM Playground - 部署指南

完整的 Docker 部署指南，讓你可以在任何地方通過網址訪問這個應用程式。

---

## 📋 目錄

1. [快速開始](#快速開始)
2. [本地 Docker 部署](#本地-docker-部署)
3. [雲端部署選項](#雲端部署選項)
4. [自定義配置](#自定義配置)
5. [故障排除](#故障排除)
6. [進階配置](#進階配置)

---

## 快速開始

### 前置需求

- **Docker**: >= 20.10
- **Docker Compose**: >= 1.29

### 一鍵啟動

```bash
# 1. 構建並啟動容器
docker-compose up -d

# 2. 訪問應用
open http://localhost:8080
```

就這麼簡單！應用現在運行在 `http://localhost:8080`

---

## 本地 Docker 部署

### 方法 1: 使用 Docker Compose（推薦）

```bash
# 1. 克隆或進入專案目錄
cd vanilla-dom-playground

# 2. 構建並啟動
docker-compose up -d

# 3. 查看日誌
docker-compose logs -f

# 4. 停止容器
docker-compose down

# 5. 重新構建（代碼更新後）
docker-compose up -d --build
```

### 方法 2: 使用 Docker 命令

```bash
# 1. 構建鏡像
docker build -t vanilla-dom-playground:latest .

# 2. 運行容器
docker run -d \
  --name vanilla-dom-playground \
  -p 8080:80 \
  --restart unless-stopped \
  vanilla-dom-playground:latest

# 3. 查看日誌
docker logs -f vanilla-dom-playground

# 4. 停止並移除容器
docker stop vanilla-dom-playground
docker rm vanilla-dom-playground
```

### 訪問應用

應用啟動後，可通過以下網址訪問：

- **學習中心**（預設）: http://localhost:8080/
- **構建模式**: http://localhost:8080/index.html
- **成就中心**: http://localhost:8080/achievement-test.html
- **健康檢查**: http://localhost:8080/health

---

## 雲端部署選項

### 選項 1: Digital Ocean App Platform

**優點**: 簡單、自動 SSL、全球 CDN

```bash
# 1. 安裝 doctl CLI
brew install doctl  # macOS
# 或下載: https://github.com/digitalocean/doctl

# 2. 認證
doctl auth init

# 3. 創建應用
doctl apps create --spec digitalocean-app.yaml
```

**digitalocean-app.yaml**:
```yaml
name: vanilla-dom-playground
services:
  - name: web
    dockerfile_path: Dockerfile
    github:
      repo: your-username/vanilla-dom-playground
      branch: main
    http_port: 80
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
```

**費用**: ~$5/月起

---

### 選項 2: AWS EC2 + Docker

**步驟**:

1. **啟動 EC2 實例**
   - AMI: Amazon Linux 2
   - 類型: t2.micro（免費層）
   - 安全組: 開放 80, 443, 22 端口

2. **連接並安裝 Docker**
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip

# 安裝 Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# 安裝 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **部署應用**
```bash
# 克隆代碼
git clone https://github.com/your-username/vanilla-dom-playground.git
cd vanilla-dom-playground

# 啟動
docker-compose up -d
```

4. **配置域名（可選）**
   - 在 Route 53 添加 A 記錄指向你的 EC2 IP
   - 訪問 http://your-domain.com

**費用**: 免費層 12 個月，之後 ~$10/月

---

### 選項 3: Google Cloud Run

**優點**: 按使用量計費、自動擴展、免費額度

```bash
# 1. 安裝 gcloud CLI
# https://cloud.google.com/sdk/docs/install

# 2. 認證
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 3. 構建並推送到 Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/vanilla-dom-playground

# 4. 部署到 Cloud Run
gcloud run deploy vanilla-dom-playground \
  --image gcr.io/YOUR_PROJECT_ID/vanilla-dom-playground \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated \
  --port 80
```

**費用**: 免費額度內 $0，超出約 $0.40/百萬請求

---

### 選項 4: Heroku

**優點**: 超級簡單、免費層可用

1. **安裝 Heroku CLI**
```bash
brew tap heroku/brew && brew install heroku  # macOS
# 或: https://devcenter.heroku.com/articles/heroku-cli
```

2. **創建 heroku.yml**
```yaml
build:
  docker:
    web: Dockerfile
```

3. **部署**
```bash
# 登入
heroku login

# 創建應用
heroku create vanilla-dom-playground

# 設定 stack 為 container
heroku stack:set container

# 部署
git push heroku main

# 開啟應用
heroku open
```

**費用**: 免費（但會休眠），Hobby 層 $7/月

---

### 選項 5: Vercel（靜態托管）

**優點**: 完全免費、超快 CDN、自動 SSL

```bash
# 1. 安裝 Vercel CLI
npm install -g vercel

# 2. 登入
vercel login

# 3. 部署
vercel --prod

# 4. 或使用 GitHub 集成（推薦）
# 訪問 vercel.com，連接 GitHub 倉庫，自動部署
```

**vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/",
      "dest": "/learn.html"
    },
    {
      "src": "/(.*\\.(js|css|html|json|md))",
      "dest": "/$1"
    }
  ]
}
```

**費用**: 完全免費（個人用途）

---

### 選項 6: Netlify（靜態托管）

**優點**: 免費、簡單、自動部署

```bash
# 1. 安裝 Netlify CLI
npm install -g netlify-cli

# 2. 登入
netlify login

# 3. 部署
netlify deploy --prod --dir=.

# 或使用 GitHub 集成（推薦）
# 訪問 netlify.com，連接 GitHub 倉庫
```

**netlify.toml**:
```toml
[build]
  publish = "."
  command = "echo 'No build needed'"

[[redirects]]
  from = "/"
  to = "/learn.html"
  status = 200

[[headers]]
  for = "/*.js"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"

[[headers]]
  for = "/*.css"
  [headers.values]
    Content-Type = "text/css; charset=utf-8"
```

**費用**: 完全免費（個人用途）

---

## 自定義配置

### 更改端口

**docker-compose.yml**:
```yaml
ports:
  - "3000:80"  # 改為 3000 端口
```

### 添加 HTTPS

#### 方法 1: 使用 Nginx + Let's Encrypt

1. **安裝 Certbot**
```bash
# 在宿主機上
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

2. **獲取證書**
```bash
sudo certbot --nginx -d your-domain.com
```

3. **更新 nginx.conf**（自動完成）

#### 方法 2: 使用 Cloudflare

1. 添加域名到 Cloudflare
2. 開啟 Proxy（橙色雲朵）
3. 自動獲得免費 SSL

### 環境變數配置

**docker-compose.yml**:
```yaml
environment:
  - TZ=Asia/Taipei
  - NODE_ENV=production
  - APP_NAME=Vanilla DOM Playground
```

### 持久化數據（可選）

如果需要持久化用戶數據（localStorage）:

```yaml
volumes:
  - ./data:/usr/share/nginx/html/data
```

---

## 故障排除

### 問題 1: 容器無法啟動

**檢查日誌**:
```bash
docker-compose logs
docker logs vanilla-dom-playground
```

**常見原因**:
- 端口 8080 已被占用
- Docker 未運行
- 權限問題

**解決**:
```bash
# 檢查端口
lsof -i :8080

# 更改端口
docker-compose down
# 編輯 docker-compose.yml 改為其他端口
docker-compose up -d
```

### 問題 2: 無法訪問網址

**檢查容器狀態**:
```bash
docker ps | grep vanilla-dom
```

**檢查健康狀態**:
```bash
curl http://localhost:8080/health
```

**防火牆檢查**:
```bash
# Ubuntu/Debian
sudo ufw allow 8080

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

### 問題 3: JavaScript 模塊載入失敗

**檢查 MIME 類型**:
```bash
curl -I http://localhost:8080/js/main.js
# 應該顯示: Content-Type: application/javascript
```

**解決**: nginx.conf 已正確配置 MIME 類型

### 問題 4: 404 錯誤

**檢查文件權限**:
```bash
docker exec vanilla-dom-playground ls -la /usr/share/nginx/html
```

**應該顯示**: 755 權限

---

## 進階配置

### 負載均衡（多實例）

**docker-compose.yml**:
```yaml
services:
  vanilla-dom-playground:
    # ... 現有配置
    deploy:
      replicas: 3  # 運行 3 個實例

  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - vanilla-dom-playground
```

### 監控和日誌

**添加 Prometheus 監控**:
```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

### 自動備份

```bash
# 創建備份腳本
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
docker exec vanilla-dom-playground tar czf /tmp/backup-$DATE.tar.gz /usr/share/nginx/html
docker cp vanilla-dom-playground:/tmp/backup-$DATE.tar.gz ./backups/
EOF

chmod +x backup.sh

# 添加到 crontab（每天備份）
crontab -e
# 添加: 0 2 * * * /path/to/backup.sh
```

### CI/CD 自動部署

**GitHub Actions** (.github/workflows/deploy.yml):
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /path/to/vanilla-dom-playground
            git pull
            docker-compose up -d --build
```

---

## 🎯 推薦部署方案

### 個人學習/展示
- **Vercel** 或 **Netlify** - 完全免費，自動 SSL，全球 CDN

### 小型團隊
- **Digital Ocean App Platform** - $5/月，簡單管理

### 生產環境
- **AWS EC2 + Docker** - 完全控制，可擴展

### 快速原型
- **Heroku** - 一鍵部署，簡單快速

---

## 📊 部署檢查清單

部署前確認：

- [ ] Docker 和 Docker Compose 已安裝
- [ ] 端口 8080（或自定義端口）未被占用
- [ ] 所有文件權限正確
- [ ] nginx.conf 配置正確
- [ ] .dockerignore 排除不必要文件

部署後測試：

- [ ] 學習中心可訪問（http://your-domain/）
- [ ] 構建模式可訪問（http://your-domain/index.html）
- [ ] 所有遊戲可正常運行
- [ ] 所有教程可正常運行
- [ ] 成就系統正常工作
- [ ] JavaScript 模塊正確載入
- [ ] 健康檢查返回 200（http://your-domain/health）

---

## 📞 需要幫助？

- **文檔**: 查看 docs/ 目錄
- **問題**: 檢查故障排除章節
- **Bug**: 提交 GitHub Issue

---

## 📝 版本資訊

- **Docker**: >= 20.10
- **Docker Compose**: >= 1.29
- **Nginx**: Alpine (最新)
- **應用版本**: v1.0.0

---

**祝你部署順利！** 🚀

有任何問題隨時查看本文檔或聯繫支持。
