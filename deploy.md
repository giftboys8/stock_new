# Docker 部署指南

本指南将帮助你使用 Docker 部署股票分析系统。

## 前置要求

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)

## 部署步骤

### 1. 准备环境

确保项目根目录下存在以下文件：
- `docker-compose.yml`
- `backend/Dockerfile`
- `stock-analysis/Dockerfile`
- `stock-analysis/nginx.conf`

### 2. 构建并启动服务

在项目根目录下运行以下命令：

```bash
# 构建并启动服务（后台运行）
docker compose up -d --build
```

### 3. 验证部署

服务启动后，访问浏览器：
- 前端页面：http://localhost:8080
- 后端 API：http://localhost:8000/docs


### 4. 常用命令

```bash
# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 重启服务
docker compose restart
```

## 注意事项

- **数据库持久化**：数据库文件挂载在 `backend/stock_analysis.db`。请勿直接删除该文件，否则会导致数据丢失。
- **端口冲突**：如果 8080 或 8000 端口被占用，请修改 `docker-compose.yml` 中的端口映射。
- **CORS**：Nginx 配置已处理跨域代理，前端请求 `/api` 会自动转发到后端。
