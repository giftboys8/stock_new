# 后端迁移指南

本文档记录了从 localStorage 迁移到后端 API 的所有步骤和注意事项。

## 📋 迁移概述

**当前状态**: 使用 localStorage 存储所有数据（筛选历史、自选股等）
**目标状态**: 使用后端 API 进行数据持久化和业务逻辑处理

---

## 📌 重要说明

**本文档状态**: ✅ 已激活，准备开始实施

**触发原因**:
- ✅ 前端功能已实现（选股、结果、历史）
- ✅ DataService 已完成，所有 TODO 标记已添加
- ✅ 技术选型已确认（FastAPI + akshare）
- ⏳ 等待补全前端页面（个股详情、推荐报告）
- ⏳ 等待用户确认后开始后端开发

**迁移目标**:
- 从 localStorage/sessionStorage 迁移到真实后端 API
- 使用 akshare 获取真实股票数据
- 实现小时级数据更新（可扩展至分钟级）
- 为后续 AI 分析功能打基础

**迁移策略**:
- **阶段1**: 补全前端页面（1周）
- **阶段2**: 后端开发（3-4周）
- **阶段3**: 前后端集成（1周）
- **阶段4**: 测试和优化（1-2周）

**相关文档**:
- [后端开发路线图](../docs/10_后端开发路线图.md) - 详细的实施计划
- [技术选型文档](../docs/02_技术选型文档.md) - 技术决策记录
- [README](../README.md) - 项目总览

---

## 🎯 迁移优先级

### 第一阶段：核心数据接口
- [x] 股票数据获取
- [x] 筛选历史记录管理
- [x] 自选股功能
- [ ] 实时数据推送

### 第二阶段：高级功能
- [ ] 用户认证和授权
- [ ] 数据统计和分析
- [ ] 用户配置同步
- [ ] 数据导出功能

---

## 📁 需要修改的文件

### 1. `/src/services/dataService.js`
**状态**: ✅ 已完成（已添加所有 TODO 注释）

**迁移内容**:
```javascript
// 当前实现（localStorage）
static getStocks(criteria = {}) {
  const allStocks = this._getMockStockData();
  return this._filterStocks(allStocks, criteria);
}

// 后端实现
static async getStocks(criteria = {}) {
  const params = new URLSearchParams(criteria);
  const response = await fetch(`/api/stocks?${params}`);
  return response.json();
}
```

**TODO 标记位置**:
- Line 20: `getStocks()` - GET /api/stocks
- Line 28: `getStockById(id)` - GET /api/stocks/:id
- Line 39: `saveScreeningHistory(record)` - POST /api/screening-history
- Line 60: `getScreeningHistory(options)` - GET /api/screening-history
- Line 76: `getScreeningHistoryById(id)` - GET /api/screening-history/:id
- Line 82: `deleteScreeningHistory(id)` - DELETE /api/screening-history/:id
- Line 96: `clearScreeningHistory()` - DELETE /api/screening-history
- Line 105: `addWatchlist(stockId)` - POST /api/watchlist
- Line 119: `removeWatchlist(stockId)` - DELETE /api/watchlist/:id
- Line 133: `getWatchlist()` - GET /api/watchlist

---

### 2. `/src/pages/Screening.jsx`
**状态**: ✅ 已完成

**迁移内容**:
```javascript
// 当前实现（localStorage + sessionStorage）
const handleStartScreening = () => {
  const results = DataService.getStocks(criteria);
  DataService.saveScreeningHistory(historyRecord);
  sessionStorage.setItem('currentFilter', JSON.stringify(criteria));
  navigate('/stocks');
}

// 后端实现
const handleStartScreening = async () => {
  const response = await fetch('/api/screen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ criteria })
  });
  const { screeningId, results } = await response.json();
  navigate(`/stocks?screening=${screeningId}`);
}
```

**TODO 标记位置**:
- Line 11: 状态管理 - 应该通过 URL 参数或 Redux 传递
- Line 57: 筛选逻辑 - 应该发送 POST 请求到 /api/screen
- Line 71: API 调用 - 应该调用 API 进行异步筛选
- Line 98: 条件传递 - 应该传递筛选ID而不是完整条件
- Line 99: SessionStorage - 应该使用 URL 参数
- Line 113: 实时更新 - 应该实时发送到服务器

---

### 3. `/src/pages/StockResults.jsx`
**状态**: ✅ 已完成

**迁移内容**:
```javascript
// 当前实现（sessionStorage）
useEffect(() => {
  const savedFilter = sessionStorage.getItem('currentFilter');
  const criteria = savedFilter ? JSON.parse(savedFilter) : {};
  const allStocks = DataService.getStocks(criteria);
  setStocks(allStocks);
}, []);

// 后端实现
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const screeningId = params.get('screening');

  fetch(`/api/screening-results/${screeningId}`)
    .then(r => r.json())
    .then(data => setStocks(data.stocks));
}, [location.search]);
```

**TODO 标记位置**:
- Line 12: URL 参数 - 应该从 URL 获取筛选ID
- Line 19: API 调用 - 应该调用 GET /api/stocks?criteria={...}
- Line 252: 分页功能 - 需要实现后端分页

---

### 4. `/src/pages/History.jsx`
**状态**: ✅ 已完成

**TODO 标记位置**:
- Line 4: API 调用 - GET /api/screening-history

---

### 5. `/src/pages/HistoryDetail.jsx`
**状态**: ✅ 已完成

**TODO 标记位置**:
- Line 12: API 调用 - GET /api/screening-history/:id

---

## 🔌 后端 API 设计规范

### RESTful API 接口设计

#### 1. 股票数据相关

```http
GET /api/stocks
```
**查询参数**:
- `industry`: string - 行业筛选
- `peMin`: number - 最小市盈率
- `peMax`: number - 最大市盈率
- `pbMin`: number - 最小市净率
- `pbMax`: number - 最大市净率
- `marketCap`: string - 市值要求
- `changeType`: 'all' | 'up' | 'down' - 涨跌幅类型
- `page`: number - 页码
- `pageSize`: number - 每页数量

**响应**:
```json
{
  "stocks": [
    {
      "id": 1,
      "code": "600519",
      "name": "贵州茅台",
      "price": 1856.00,
      "change": 2.35,
      "volume": "2.56万手",
      "pe": 35.6,
      "pb": 12.8,
      "marketCap": "2.3万亿"
    }
  ],
  "total": 5000,
  "page": 1,
  "pageSize": 20
}
```

```http
GET /api/stocks/:id
```
**响应**: 单个股票的详细信息

#### 2. 筛选相关

```http
POST /api/screen
```
**请求体**:
```json
{
  "criteria": {
    "strategy": "平衡型",
    "industry": "全部",
    "peMin": 10,
    "peMax": 40,
    "marketCap": ">50亿",
    "changeType": "all"
  }
}
```

**响应**:
```json
{
  "screeningId": "screen_123456",
  "results": [...],
  "resultCount": 85,
  "avgChange": 1.85
}
```

```http
GET /api/screening-results/:screeningId
```
**响应**: 筛选结果详情

#### 3. 历史记录相关

```http
GET /api/screening-history
```
**查询参数**:
- `limit`: number - 返回数量限制
- `offset`: number - 偏移量

```http
POST /api/screening-history
```
**请求体**: 筛选记录对象

```http
DELETE /api/screening-history/:id
```

```http
DELETE /api/screening-history
```

#### 4. 自选股相关

```http
POST /api/watchlist
```
**请求体**: `{ "stockId": 1 }`

```http
DELETE /api/watchlist/:id
```

```http
GET /api/watchlist
```

---

## 🛠️ 迁移步骤

### Step 1: 后端 API 开发
1. 搭建后端服务（Node.js/Python/Java 等）
2. 实现上述 RESTful API 接口
3. 数据库设计和实现（推荐 PostgreSQL 或 MongoDB）
4. 添加用户认证（JWT）

### Step 2: 前端迁移
1. 创建 API 客户端工具类（使用 axios 或 fetch）
2. 逐步替换 DataService 中的方法
3. 更新错误处理和加载状态
4. 添加请求拦截器（处理认证 token）

### Step 3: 测试和验证
1. 单元测试
2. 集成测试
3. 性能测试
4. 用户验收测试

### Step 4: 数据迁移
1. 导出 localStorage 数据
2. 导入到后端数据库
3. 数据一致性验证

---

## 📝 数据结构设计

### screening_history 表结构

```sql
CREATE TABLE screening_history (
  id BIGINT PRIMARY KEY,
  user_id BIGINT,  -- 用户ID（多用户系统）
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  criteria JSON,  -- 筛选条件（JSON格式）
  result_count INT,
  avg_change DECIMAL(5,2),
  top_stocks JSON,  -- 前3只股票名称
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_timestamp (user_id, timestamp DESC),
  INDEX idx_timestamp (timestamp DESC)
);
```

### watchlist 表结构

```sql
CREATE TABLE watchlist (
  id BIGINT PRIMARY KEY,
  user_id BIGINT,  -- 用户ID
  stock_id BIGINT,  -- 股票ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_stock (user_id, stock_id),
  INDEX idx_user (user_id)
);
```

### stocks 表结构

```sql
CREATE TABLE stocks (
  id BIGINT PRIMARY KEY,
  code VARCHAR(10) UNIQUE,
  name VARCHAR(50),
  industry VARCHAR(30),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_quotes (
  stock_id BIGINT,
  price DECIMAL(10,2),
  change DECIMAL(5,2),
  volume VARCHAR(20),
  pe DECIMAL(8,2),
  pb DECIMAL(8,2),
  market_cap VARCHAR(20),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (stock_id, timestamp),
  FOREIGN KEY (stock_id) REFERENCES stocks(id)
);
```

---

## 🔐 安全考虑

1. **认证和授权**:
   - 使用 JWT token 进行用户认证
   - 添加 CORS 配置
   - API 请求速率限制

2. **数据验证**:
   - 前端和后端都要进行数据验证
   - 防止 SQL 注入
   - 防止 XSS 攻击

3. **敏感数据**:
   - 不要在 localStorage 存储敏感信息
   - 使用 HTTPS 传输
   - 加密存储 token

---

## 📊 性能优化

1. **缓存策略**:
   - Redis 缓存热点数据
   - CDN 加速静态资源
   - 客户端缓存

2. **分页和懒加载**:
   - 所有列表接口都支持分页
   - 图片懒加载
   - 虚拟滚动（大数据量）

3. **数据库优化**:
   - 添加适当的索引
   - 查询优化
   - 读写分离

---

## ✅ 迁移检查清单

### 开发阶段
- [ ] API 接口设计和文档
- [ ] 数据库设计和创建
- [ ] 后端服务实现
- [ ] 前端 API 客户端封装
- [ ] 逐个迁移 DataService 方法
- [ ] 更新所有页面组件

### 测试阶段
- [ ] 单元测试覆盖率 > 80%
- [ ] 集成测试通过
- [ ] 性能测试达标
- [ ] 安全测试通过
- [ ] 用户验收测试通过

### 部署阶段
- [ ] 数据备份和恢复方案
- [ ] 监控和日志系统
- [ ] 灰度发布
- [ ] 回滚方案
- [ ] 用户通知和培训

---

## 📞 技术支持

如有问题，请联系开发团队或在项目 Issues 中提问。

**文档版本**: v1.0
**最后更新**: 2026-01-28
**维护者**: Claude Code
