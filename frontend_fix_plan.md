# 前端API调用问题修复方案

## 问题诊断

### 核心问题
所有前端页面都在**同步调用异步API方法**，导致：
1. API调用失败
2. 自动降级到localStorage或模拟数据
3. 用户看到的仍然是硬编码数据

### 具体问题文件

#### 1. StockDetail.jsx (第173行)
```javascript
// ❌ 错误：同步调用异步方法
const stockData = DataService.getStockById(id);

// ✅ 应该：
const stockData = await DataService.getStockByCode(id);
```

#### 2. Screening.jsx (第74行)
```javascript
// ❌ 错误：同步调用异步方法
const results = DataService.getStocks(criteria);
DataService.saveScreeningHistory(historyRecord);

// ✅ 应该：
const results = await DataService.getStocks(criteria);
await DataService.saveScreeningHistory(historyRecord);
```

#### 3. StockResults.jsx (第20行)
```javascript
// ❌ 错误：同步调用异步方法
const allStocks = DataService.getStocks(criteria);

// ✅ 应该：
const allStocks = await DataService.getStocks(criteria);
```

#### 4. History.jsx (第16行)
```javascript
// ❌ 错误：同步调用异步方法
const history = DataService.getScreeningHistory();

// ✅ 应该：
const history = await DataService.getScreeningHistory();
```

#### 5. HistoryDetail.jsx (第11行)
```javascript
// ❌ 错误：同步调用异步方法
const historyRecord = DataService.getScreeningHistoryById(id);

// ✅ 应该：
const historyRecord = await DataService.getScreeningHistoryById(id);
```

## 修复方案

### 需要修改的地方

1. **所有调用API的函数都需要添加 `async` 关键字**
2. **所有调用API的地方都需要添加 `await` 关键字**
3. **需要处理路由参数转换（股票ID → 股票代码）**

### 修复步骤

1. 修改StockDetail.jsx
   - 添加async到handleScreening函数
   - 将getStockById改为getStockByCode
   - 添加await

2. 修改Screening.jsx
   - 添加async到handleScreening函数
   - 添加await到API调用

3. 修改StockResults.jsx
   - 添加async到useEffect回调
   - 添加await到API调用

4. 修改History.jsx
   - 添加async到useEffect回调
   - 添加await到API调用

5. 修改HistoryDetail.jsx
   - 添加async到useEffect回调
   - 添加await到API调用

## 预期效果

修复后，前端将：
- ✅ 真正调用后端API
- ✅ 获取真实的股票市场数据
- ✅ 实现前后端数据同步
- ✅ 支持筛选历史和自选股的持久化存储
