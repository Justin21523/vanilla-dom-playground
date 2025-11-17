# 🐳 Docker 快速部署指南

這是 Vanilla DOM Playground 的 Docker 快速部署指南。

## 🚀 最快開始方式

### 一行命令啟動

```bash
./start.sh
```

這個腳本會自動：
- ✅ 檢查 Docker 環境
- ✅ 檢查端口可用性
- ✅ 停止舊容器
- ✅ 構建並啟動新容器
- ✅ 等待服務就緒
- ✅ 顯示訪問信息

## 📦 手動部署

### 1. 使用 Docker Compose（推薦）

```bash
# 啟動
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止
docker-compose down
```

### 2. 使用 Docker 命令

```bash
# 構建
docker build -t vanilla-dom-playground:latest .

# 運行
docker run -d -p 8080:80 --name vanilla-dom-playground vanilla-dom-playground:latest

# 停止
docker stop vanilla-dom-playground && docker rm vanilla-dom-playground
```

## 🌐 訪問應用

啟動後訪問：

- **學習中心**: http://localhost:8080/
- **構建模式**: http://localhost:8080/index.html
- **成就中心**: http://localhost:8080/achievement-test.html

## 📝 常用命令

```bash
# 查看容器狀態
docker ps

# 查看日誌
docker logs -f vanilla-dom-playground

# 進入容器
docker exec -it vanilla-dom-playground sh

# 重啟容器
docker restart vanilla-dom-playground

# 健康檢查
curl http://localhost:8080/health
```

## 🔧 自定義配置

### 更改端口

編輯 `docker-compose.yml`:

```yaml
ports:
  - "3000:80"  # 改為 3000
```

### 查看 Nginx 配置

```bash
docker exec vanilla-dom-playground cat /etc/nginx/conf.d/default.conf
```

## 📚 更多信息

查看完整部署文檔: [DEPLOYMENT.md](./DEPLOYMENT.md)

包含：
- 雲端部署選項（AWS、GCP、Digital Ocean 等）
- HTTPS 配置
- 負載均衡
- 監控和備份
- CI/CD 自動部署

## ❓ 故障排除

### 容器無法啟動

```bash
# 查看詳細日誌
docker-compose logs

# 檢查端口
lsof -i :8080
```

### JavaScript 載入失敗

檢查 MIME 類型：
```bash
curl -I http://localhost:8080/js/main.js
```

應該顯示: `Content-Type: application/javascript`

## 🎉 部署成功！

現在你可以：
- 在本地使用 http://localhost:8080
- 部署到雲端供全球訪問
- 分享給團隊成員學習

**祝你使用愉快！** 🚀
