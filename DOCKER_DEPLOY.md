# Docker 部署指南

本文档介绍如何使用 Docker 和 Docker Compose 部署股票分析系统。

## 前置要求

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

## 快速开始

1. **构建并启动服务**

   在项目根目录下运行：

   ```bash
   docker-compose up -d --build
   ```

   该命令会自动：
   - 构建后端 Docker 镜像 (Python 3.10)
   - 构建前端 Docker 镜像 (Node build -> Nginx)
   - 启动服务并建立网络连接

2. **访问应用**

   - **前端页面**: [http://localhost](http://localhost) (默认端口 80)
   - **后端 API**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger 文档)

3. **停止服务**

   ```bash
   docker-compose down
   ```

## 配置说明

### 后端配置
- **Dockerfile**: `backend/Dockerfile`
- **环境变量**: 在 `docker-compose.yml` 中配置
  - `DATABASE_URL`: 数据库连接字符串 (默认使用 SQLite)
  - `API_HOST`: 监听地址 (必须为 0.0.0.0)
  - `CORS_ORIGINS`: 允许的跨域来源

### 前端配置
- **Dockerfile**: `stock-analysis/Dockerfile`
- **Nginx 配置**: `stock-analysis/nginx.conf`
  - 静态文件由 Nginx 直接服务
  - `/api/` 请求会被反向代理到后端容器 `http://backend:8000/api/`

## 数据持久化

- **数据库**: `backend/stock_analysis.db` 会被挂载到容器中，保证数据重启不丢失。
- **日志**: `backend/logs` 目录也会被挂载。

## 故障排查

查看日志：
```bash
# 查看所有日志
docker-compose logs -f

# 查看后端日志
docker-compose logs -f backend

# 查看前端(Nginx)日志
docker-compose logs -f frontend
```

进入容器：
```bash
# 进入后端容器
docker-compose exec backend bash

# 进入前端容器
docker-compose exec frontend sh
```
