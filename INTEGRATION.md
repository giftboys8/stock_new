# 前后端集成说明

## 🎉 集成完成

前端和后端已成功集成！所有API现在调用真实的后端服务。

## 📋 服务状态

### 后端服务
- **框架**: FastAPI
- **端口**: 8000
- **API文档**: http://localhost:8000/docs
- **状态**: ✅ 运行中

### 前端服务
- **框架**: React + Vite
- **端口**: 5174
- **访问地址**: http://localhost:5174
- **状态**: ✅ 运行中

## 🔄 数据流向

```
前端 (React)
    ↓
API服务层
    ↓
后端API (FastAPI)
    ↓
数据获取服务
    ↓
├─ baostock (优先)
└─ akshare (备用)
```

## 📁 修改的文件

### 后端
1. ✅ `backend/app/config.py` - 更新CORS配置
2. ✅ `backend/app/routers/screening_history.py` - 筛选历史CRUD
3. ✅ `backend/app/routers/watchlist.py` - 自选股CRUD

### 前端
1. ✅ `stock-analysis/src/services/api.js` - 新增API服务层
2. ✅ `stock-analysis/src/services/dataService.js` - 更新为真实API调用
3. ✅ `stock-analysis/src/services/dataService.js.backup` - 备份原文件

## 🔌 API端点映射

| 前端方法 | 后端API | 功能 |
|---------|---------|------|
| `getStocks()` | GET /api/stocks | 获取股票列表 |
| `getStockByCode()` | GET /api/stocks/:code | 获取股票详情 |
| `getStockHistory()` | GET /api/stocks/:code/history | 获取历史K线 |
| `screenStocks()` | POST /api/screen | 执行筛选 |
| `saveScreeningHistory()` | POST /api/screening-history | 保存筛选历史 |
| `getScreeningHistory()` | GET /api/screening-history | 获取筛选历史 |
| `deleteScreeningHistory()` | DELETE /api/screening-history/:id | 删除筛选历史 |
| `addWatchlist()` | POST /api/watchlist | 添加自选股 |
| `getWatchlist()` | GET /api/watchlist | 获取自选股列表 |
| `removeWatchlist()` | DELETE /api/watchlist/:id | 删除自选股 |

## 🚀 启动服务

### 启动后端
```bash
cd /opt/AI/stock/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 启动前端
```bash
cd /opt/AI/stock/stock-analysis
npm run dev
```

## 🧪 测试集成

### 1. 测试股票列表
```bash
curl http://localhost:8000/api/stocks?page=1&pageSize=5
```

### 2. 测试个股详情
```bash
curl http://localhost:8000/api/stocks/600519
```

### 3. 浏览器测试
1. 访问 http://localhost:5174
2. 打开浏览器开发者工具 (F12)
3. 查看Network标签
4. 观察API调用

## 📊 数据降级策略

当后端API不可用时，前端会自动降级到：
1. localStorage存储筛选历史和自选股
2. 模拟数据展示股票列表

确保应用在任何情况下都能正常运行。

## ⚙️ 配置说明

### API基础URL
文件: `src/services/api.js`
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### CORS配置
文件: `backend/app/config.py`
```python
CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174,..."
```

## 🔍 调试技巧

### 查看后端日志
```bash
tail -f /tmp/uvicorn.log
```

### 查看前端日志
浏览器控制台查看所有console输出

### 测试API
访问 Swagger UI: http://localhost:8000/docs

## 📝 注意事项

1. **端口冲突**: 确保8000和5174端口未被占用
2. **网络问题**: baostock需要网络连接获取数据
3. **CORS错误**: 如果遇到CORS错误，检查config.py中的CORS_ORIGINS配置
4. **降级模式**: API失败时会自动降级，注意控制台日志

## 🎯 下一步

1. ✅ 测试所有页面功能
2. ⏳ 添加用户认证
3. ⏳ 实现WebSocket实时推送
4. ⏳ 添加单元测试
5. ⏳ 部署到生产环境

## 📞 帮助

- 后端API文档: http://localhost:8000/docs
- 前端应用: http://localhost:5174
- 项目目录: /opt/AI/stock
