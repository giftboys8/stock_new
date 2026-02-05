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

为避免 macOS 上的 Docker 权限问题，我们使用 **Docker 命名卷 (Named Volumes)** 来持久化数据：

- **数据库卷**: `stock_data` -> 挂载到容器内 `/app/data` (数据库文件路径：`/app/data/stock_analysis.db`)
- **日志卷**: `stock_logs` -> 挂载到容器内 `/app/logs`

### 管理数据卷

```bash
# 查看数据卷
docker volume ls

# 查看数据卷详情 (找到在宿主机上的实际路径)
docker volume inspect stock_stock_data

# 清理数据卷 (注意：这将删除所有数据！)
docker volume rm stock_stock_data
```

## 故障排查

### 常见问题：502 Bad Gateway

如果您在访问应用时遇到 `502 Bad Gateway` 错误，通常意味着：

1.  **后端服务未启动**：Nginx 无法连接到 `backend:8000`。
2.  **外部网关问题**：如果您通过外部 Nginx (如端口 8080) 转发到 Docker 容器，可能是该转发连接失败。

**排查步骤**：

1.  **检查容器状态**
    确保两个容器都处于 `Up` 状态：
    ```bash
    docker-compose ps
    ```

2.  **查看服务日志**
    检查是否有报错信息（特别是后端数据库连接错误）：
    ```bash
    # 查看所有日志
    docker-compose logs

    # 专门查看后端日志
    docker-compose logs backend
    ```

3.  **检查端口映射**
    默认配置下，前端监听宿主机的 **80** 端口。如果您访问的是 8080 端口，请检查：
    - 您是否修改了 `docker-compose.yml` 中的端口映射？
    - 或者您是否有另一个反向代理服务在 8080 端口运行？

4.  **进入容器排查**
    您可以进入 Nginx 容器测试对后端的连通性：
    ```bash
    docker-compose exec frontend ping backend
    ```
