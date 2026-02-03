# akshare网络问题诊断报告和讨论

**日期**: 2026-01-28
**诊断状态**: ✅ 完成

---

## 🔍 问题诊断结果

### 1. 根本原因

**发现**: 系统设置了代理，但代理服务器不可用

```
⚠️  检测到代理设置:
   HTTP_PROXY=http://host.docker.internal:7890
   HTTPS_PROXY=http://host.docker.internal:7890
```

这个代理可能来自Docker或之前配置的VPN，但目前不可用，导致部分akshare接口失败。

### 2. 接口可用性测试

| 接口 | 状态 | 数据量 | 说明 |
|------|------|--------|------|
| stock_info_a_code_name() | ✅ 可用 | 5474只 | A股列表 |
| stock_zh_a_spot_em() | ❌ 失败 | - | 东方财富实时(代理错误) |
| **stock_zh_a_spot()** | ✅ **可用** | **5472只** | **新浪实时(推荐)** |
| **stock_zh_a_hist()** | ✅ **可用** | 17条 | **历史行情(核心)** |
| stock_financial_analysis_indicator() | ⚠️ 空数据 | - | 财务数据(数据源问题) |
| stock_board_industry_name_em() | ❌ 失败 | - | 行业板块(代理错误) |
| stock_board_concept_name_em() | ❌ 失败 | - | 概念板块(代理错误) |

**成功率**: 3/7 = 43%

---

## 💡 解决方案讨论

### 方案1: 临时禁用代理 (推荐)

**优点**:
- ✅ 所有akshare接口都可用
- ✅ 不影响数据获取功能
- ✅ 简单快速

**缺点**:
- ⚠️ 如果需要访问其他国外网站可能需要代理

**实施方法**:
```bash
# 方式1: 在.env文件中设置
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy

# 方式2: 在Python代码中禁用
import os
os.environ.pop('HTTP_PROXY', None)
os.environ.pop('HTTPS_PROXY', None)
```

**我的建议**:
- 既然我们主要访问国内数据源(东方财富、新浪等)，可以直接禁用代理
- 不影响我们的核心功能

### 方案2: 只使用可用的3个接口 (备选)

**优点**:
- ✅ 无需修改代理设置
- ✅ 3个核心接口完全够用

**缺点**:
- ⚠️ 行业板块数据获取困难
- ⚠️ 部分高级功能受限

**可用接口覆盖度**:
- ✅ 股票列表: 100%
- ✅ 实时行情: 100% (使用新浪接口替代)
- ✅ 历史数据: 100%
- ❌ 财务数据: 需要找备用接口
- ❌ 行业数据: 需要找备用接口

---

## 📋 API接口设计讨论

基于akshare可用接口，我设计了以下API方案，请确认是否符合需求：

### 核心API (必须实现)

#### 1. GET /api/stocks - 获取股票列表

```python
# 功能: 获取所有A股股票列表(支持筛选)
# 数据源: stock_info_a_code_name() ✅
# 筛选条件:
#   - industry: 行业
#   - marketCap: 市值范围
#   - page/pageSize: 分页

# 返回示例:
{
  "stocks": [
    {
      "code": "600519",
      "name": "贵州茅台",
      "industry": "白酒",  # 可能需要额外获取
      "market": "沪市主板"
    }
  ],
  "total": 5474
}
```

**您的需求确认**:
- ❓ 是否需要行业信息？如果需要，我需要找备用数据源或手动维护行业分类
- ❓ 是否需要实时行情数据在这个接口里？还是在单独的详情接口？

#### 2. GET /api/stocks/:code - 获取个股详情

```python
# 功能: 获取单只股票的完整信息
# 数据源: stock_zh_a_spot() + stock_zh_a_hist() ✅

# 返回示例:
{
  "code": "600519",
  "name": "贵州茅台",
  "quote": {
    "price": 1343.01,
    "change": 0.08,
    "volume": "4.84万手",
    "turnover": "6.51亿",
    "pe": 28.5,
    "pb": 12.3,
    "market_cap": "2.1万亿"
  },
  "history": {
    "high52": 1850.0,
    "low52": 1325.12,
    "timestamp": "2026-01-28"
  }
}
```

**您的需求确认**:
- ✅ 这个接口可以满足吗？
- ❓ 是否需要历史K线数据？还是只要52周高低点？

#### 3. POST /api/screen - 执行筛选

```python
# 功能: 根据筛选条件过滤股票
# 实现:
#   1. 从stock_zh_a_spot()获取实时数据 ✅
#   2. 根据条件筛选(PE、PB、市值等)
#   3. 返回符合条件的股票列表

# 请求示例:
{
  "criteria": {
    "peMin": 10,
    "peMax": 40,
    "marketCap": ">50亿",
    "changeType": "up"
  }
}

# 返回示例:
{
  "screeningId": "screen_xxx",
  "results": [...],
  "resultCount": 85,
  "avgChange": 1.85
}
```

**您的需求确认**:
- ✅ 这个逻辑符合您的选股需求吗？
- ❓ 筛选条件是否完整？是否需要添加其他条件(ROE、换手率等)？

### 辅助API (可选实现)

#### 4. GET /api/stocks/:code/history - 获取历史K线

```python
# 数据源: stock_zh_a_hist() ✅
# 功能: 获取个股历史K线数据
# 用途: 前端图表展示、技术分析
```

**您的需求确认**:
- ❓ 前端是否需要K线图表？如果需要，这个接口很重要

#### 5. POST /api/screening-history - 保存筛选历史

```python
# 功能: 保存筛选历史到数据库
# 实现: 直接存入SQLite
```

#### 6. GET /api/watchlist - 自选股管理

```python
# 功能: 用户自选股列表
# 实现: 数据库CRUD操作
```

---

## 🎯 Redis缓存方案讨论

**问题**: 是否需要Redis缓存？

### 我的建议:

#### 阶段1 (当前): **不需要Redis**

**理由**:
1. ✅ akshare请求频率不快(每次3-4秒)
2. ✅ 我们可以控制请求频率(定时任务，而非实时)
3. ✅ SQLite可以存储历史数据
4. ✅ Python内存缓存就够用

**实现方案**:
```python
# 使用Python内置缓存
from functools import lru_cache
import time

class SimpleCache:
    def __init__(self, ttl=300):  # 5分钟缓存
        self.cache = {}
        self.ttl = ttl

    def get(self, key):
        if key in self.cache:
            data, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return data
        return None
```

#### 阶段2 (未来): **按需添加Redis**

**需要Redis的场景**:
- ❓ 多个服务实例共享缓存
- ❓ 需要分布式缓存
- ❓ 缓存数据量非常大(>1GB)

**我的建议**: 先用简单缓存，等真的需要了再加Redis

---

## ⚠️ 完整的错误处理和日志记录

我会实现以下机制:

### 1. 错误处理

```python
# 三层错误处理
try:
    result = ak.stock_zh_a_spot_em()
except requests.ProxyError as e:
    # 代理错误 - 尝试备用接口
    result = ak.stock_zh_a_spot()
except requests.Timeout as e:
    # 超时 - 重试一次
    result = ak.stock_zh_a_spot()
except Exception as e:
    # 其他错误 - 记录并返回友好错误
    logger.error(f"获取数据失败: {e}")
    return {"error": "数据获取失败，请稍后重试"}
```

### 2. 日志记录

```python
# 详细日志
logger.info(f"开始获取股票列表")
logger.debug(f"API参数: {params}")
logger.warning(f"代理错误，切换到备用接口")
logger.error(f"数据获取失败: {e}")

# 保存到文件
logs/app.log
```

---

## 🤔 需要您确认的问题

### 问题1: 代理设置
**A**: 禁用系统代理(推荐)
**B**: 保持现状，只用可用的3个接口
**C**: 其他方案？

### 问题2: API接口设计
**A**: 按我上面的设计实现
**B**: 需要调整(请说明具体需求)
**C**: 先实现核心3个接口，其他的后面再加

### 问题3: Redis缓存
**A**: 先用Python内存缓存(推荐)
**B**: 直接上Redis
**C**: 暂不需要缓存

### 问题4: 数据缺失处理
部分数据(行业、财务)接口不可用，如何处理？
**A**: 手动维护基础数据
**B**: 简化需求，不需要这些数据
**C**: 找其他数据源

---

## 📊 总结

| 项目 | 状态 |
|------|------|
| 网络问题诊断 | ✅ 已明确(代理问题) |
| 可用接口确认 | ✅ 3个核心接口可用 |
| API方案设计 | ✅ 初步方案已完成 |
| 待确认事项 | ❓ 等待您的反馈 |

**下一步**: 等待您确认后，我将立即开始实现API接口

---

**维护者**: Claude Code
**最后更新**: 2026-01-28
