# 股票分析系统 - 后端API

基于 FastAPI + akshare 的股票分析系统后端服务。

## 技术栈

- **框架**: FastAPI 0.104.1
- **数据源**: akshare (A股行情数据)
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: SQLAlchemy 2.0
- **定时任务**: APScheduler

## 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI应用入口
│   ├── config.py            # 配置文件
│   ├── models.py            # 数据库模型
│   ├── database.py          # 数据库连接
│   ├── routers/             # API路由
│   │   ├── __init__.py
│   │   └── stocks.py        # 股票相关API
│   └── services/            # 业务逻辑
│       ├── __init__.py
│       └── data_fetcher.py  # 数据获取（akshare）
├── tests/                   # 测试
├── logs/                    # 日志
├── data/                    # 数据文件
├── requirements.txt         # 依赖清单
├── .env.example             # 环境变量示例
└── Dockerfile               # Docker配置
```

## 快速开始

### 1. 创建Python虚拟环境

```bash
cd backend
python -m venv venv

# Mac/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，设置必要的环境变量
```

### 4. 初始化数据库

数据库会在首次启动时自动初始化。

### 5. 启动开发服务器

```bash
# 方式1：使用uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 方式2：直接运行
python -m app.main
```

### 6. 访问API文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- 健康检查: http://localhost:8000/health

## API接口规划

### 股票相关

- `GET /api/stocks` - 获取股票列表（支持筛选）
- `GET /api/stocks/:code` - 获取个股详情

### 筛选相关

- `POST /api/screen` - 执行股票筛选
- `GET /api/screening-results/:id` - 获取筛选结果

### 历史记录

- `GET /api/screening-history` - 获取历史记录
- `POST /api/screening-history` - 保存记录
- `DELETE /api/screening-history/:id` - 删除记录

### 自选股

- `GET /api/watchlist` - 获取自选股列表
- `POST /api/watchlist` - 添加自选股
- `DELETE /api/watchlist/:id` - 删除自选股

## 开发计划

- [x] 项目结构搭建
- [x] 数据库模型设计
- [x] akshare数据获取封装
- [ ] 核心API接口实现
- [ ] 定时任务实现
- [ ] AI分析集成（DeepSeek）
- [ ] 前后端集成测试

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DATABASE_URL | 数据库连接字符串 | sqlite:///./stock_analysis.db |
| API_HOST | API监听地址 | 0.0.0.0 |
| API_PORT | API监听端口 | 8000 |
| UPDATE_INTERVAL_MINUTES | 数据更新间隔(分钟) | 60 |
| DEEPSEEK_API_KEY | DeepSeek API密钥 | - |

## 日志

日志文件位置：`logs/app.log`

## 测试

```bash
# 运行所有测试
pytest

# 运行测试并显示覆盖率
pytest --cov=app tests/
```

## Docker部署

```bash
# 构建镜像
docker build -t stock-api .

# 运行容器
docker run -p 8000:8000 -e DEEPSEEK_API_KEY=your_key stock-api
```

## 开发注意事项

1. **数据缓存**: akshare有请求频率限制,建议添加缓存机制
2. **错误处理**: 网络请求可能失败,需要完善的错误处理
3. **日志记录**: 记录关键操作和错误信息
4. **数据验证**: 使用Pydantic进行输入验证

## 相关文档

- [后端迁移指南](../stock-analysis/BACKEND_MIGRATION_GUIDE.md)
- [后端开发路线图](../docs/10_后端开发路线图.md)
- [DeepSeek使用指南](../docs/03_DeepSeek使用指南.md)

## 联系方式

- 创建日期: 2026-01-28
- 版本: v1.0
- 维护者: Claude Code
