# Vanilla DOM Playground - Docker Configuration
# 使用輕量級的 Nginx Alpine 鏡像
FROM nginx:alpine

# 設定維護者資訊
LABEL maintainer="Vanilla DOM Playground"
LABEL description="Interactive DOM Learning Platform - Pure Vanilla JavaScript"
LABEL version="1.0.0"

# 移除 Nginx 預設配置
RUN rm -rf /usr/share/nginx/html/*

# 複製所有專案文件到 Nginx 根目錄
COPY . /usr/share/nginx/html/

# 複製自定義 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 設定正確的文件權限
RUN chmod -R 755 /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 啟動 Nginx（前台運行）
CMD ["nginx", "-g", "daemon off;"]
