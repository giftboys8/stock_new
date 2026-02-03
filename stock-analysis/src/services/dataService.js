/**
 * 数据服务层 - 统一数据访问接口
 *
 * 已迁移到后端FastAPI
 * 所有方法现在调用真实的API接口
 */

import API from './api';

class DataService {
  // ==================== 股票数据相关 ====================

  /**
   * 获取所有股票数据
   * 后端API: GET /api/stocks
   */
  static async getStocks(criteria = {}) {
    try {
      const stocks = await API.stock.getStocks({
        page: 1,
        pageSize: 100,
        search: criteria.search,
        market: criteria.market,
      });

      // 如果有筛选条件，在前端进行筛选
      if (Object.keys(criteria).length > 0 && !criteria.search && !criteria.market) {
        return this._filterStocks(stocks, criteria);
      }

      return stocks;
    } catch (error) {
      console.error('获取股票数据失败:', error);
      // 降级到模拟数据
      return this._getMockStockData();
    }
  }

  /**
   * 根据代码获取股票详情
   * 后端API: GET /api/stocks/:code
   */
  static async getStockByCode(code) {
    try {
      return await API.stock.getStockByCode(code);
    } catch (error) {
      console.error(`获取股票 ${code} 详情失败:`, error);
      // 降级到模拟数据
      const allStocks = this._getMockStockData();
      return allStocks.find(stock => stock.code === code);
    }
  }

  /**
   * 获取股票历史K线
   * 后端API: GET /api/stocks/:code/history
   */
  static async getStockHistory(code, period = 'daily', startDate, endDate) {
    try {
      const data = await API.stock.getStockHistory(code, period, startDate, endDate);
      return data.data || [];
    } catch (error) {
      console.error(`获取股票 ${code} 历史数据失败:`, error);
      return [];
    }
  }

  // ==================== 筛选功能相关 ====================

  /**
   * 执行股票筛选（异步）- 返回任务ID
   * 后端API: POST /api/screen
   */
  static async screenStocksAsync(criteria) {
    try {
      const response = await API.screening.screenStocks(criteria);
      return response; // { taskId, status, message }
    } catch (error) {
      console.error('创建筛选任务失败:', error);
      throw error;
    }
  }

  /**
   * 查询筛选任务状态
   * 后端API: GET /api/screen/task/{taskId}
   */
  static async getScreeningTaskStatus(taskId) {
    try {
      return await API.screening.getTaskStatus(taskId);
    } catch (error) {
      console.error(`查询任务状态失败 [${taskId}]:`, error);
      throw error;
    }
  }

  /**
   * 轮询筛选任务直到完成
   * @param {String} taskId - 任务ID
   * @param {Function} onProgress - 进度回调函数 (progress, status)
   * @param {Number} interval - 轮询间隔（毫秒）
   * @returns {Promise<Object>} 完成的任务结果
   */
  static async pollScreeningTask(taskId, onProgress = null, interval = 2000) {
    const maxAttempts = 1800; // 最多轮询60分钟（1800 * 2秒）- 足够处理5000+只股票
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        attempts++;

        try {
          const taskStatus = await this.getScreeningTaskStatus(taskId);

          // 调用进度回调
          if (onProgress) {
            onProgress(taskStatus.progress, taskStatus.status, taskStatus);
          }

          // 检查任务状态
          if (taskStatus.status === 'completed') {
            console.log('✅ 筛选任务完成:', taskStatus);
            resolve(taskStatus);
            return;
          }

          if (taskStatus.status === 'failed') {
            console.error('❌ 筛选任务失败:', taskStatus.error);
            reject(new Error(taskStatus.error || '筛选任务失败'));
            return;
          }

          // 继续轮询
          if (attempts < maxAttempts) {
            setTimeout(poll, interval);
          } else {
            reject(new Error('筛选任务超时'));
          }

        } catch (error) {
          console.error('轮询任务状态失败:', error);
          reject(error);
        }
      };

      // 开始轮询
      poll();
    });
  }

  /**
   * 执行股票筛选（旧版本，兼容性保留）
   * 后端API: POST /api/screen
   * @deprecated 请使用 screenStocksAsync + pollScreeningTask
   */
  static async screenStocks(criteria) {
    try {
      return await API.screening.screenStocks(criteria);
    } catch (error) {
      console.error('股票筛选失败:', error);
      // 降级：在前端使用模拟数据筛选
      const allStocks = this._getMockStockData();
      const filtered = this._filterStocks(allStocks, criteria);

      return {
        results: filtered,
        resultCount: filtered.length,
        avgChange: this._calculateAvgChange(filtered),
        topStocks: filtered.slice(0, 3).map(s => s.name),
      };
    }
  }

  /**
   * 获取筛选策略列表
   * 后端API: GET /api/screen/strategies
   */
  static async getScreeningStrategies() {
    try {
      return await API.screening.getStrategies();
    } catch (error) {
      console.error('获取筛选策略失败:', error);
      // 返回默认策略
      return {
        '稳健型': { peMin: 15, peMax: 30, marketCap: '>50亿' },
        '平衡型': { peMin: 10, peMax: 40, marketCap: '>50亿' },
        '成长型': { peMin: 0, peMax: 50, marketCap: '>30亿' },
      };
    }
  }

  // ==================== 历史记录相关 ====================

  /**
   * 保存筛选历史记录
   * 后端API: POST /api/screening-history
   */
  static async saveScreeningHistory(record) {
    try {
      return await API.screeningHistory.save({
        criteria: record.criteria,
        result_count: record.resultCount,
        avg_change: record.avgChange,
        top_stocks: record.topStocks,
        results: record.results.slice(0, 10), // 只保存前10条
      });
    } catch (error) {
      console.error('保存筛选历史失败:', error);
      // 降级到localStorage
      return this._saveScreeningHistoryToLocal(record);
    }
  }

  /**
   * 获取筛选历史记录
   * 后端API: GET /api/screening-history
   */
  static async getScreeningHistory(options = {}) {
    try {
      const data = await API.screeningHistory.getList({
        page: options.page || 1,
        pageSize: options.limit || 20,
      });
      return data.items || [];
    } catch (error) {
      console.error('获取筛选历史失败:', error);
      // 降级到localStorage
      return this._getScreeningHistoryFromLocal(options);
    }
  }

  /**
   * 根据ID获取单条历史记录
   * 后端API: GET /api/screening-history/:id
   */
  static async getScreeningHistoryById(id) {
    try {
      return await API.screeningHistory.getById(id);
    } catch (error) {
      console.error(`获取筛选历史 ${id} 失败:`, error);
      // 降级到localStorage
      const history = this._getScreeningHistoryFromLocal();
      return history.find(record => record.id === parseInt(id));
    }
  }

  /**
   * 删除单条历史记录
   * 后端API: DELETE /api/screening-history/:id
   */
  static async deleteScreeningHistory(id) {
    try {
      return await API.screeningHistory.delete(id);
    } catch (error) {
      console.error(`删除筛选历史 ${id} 失败:`, error);
      // 降级到localStorage
      return this._deleteScreeningHistoryFromLocal(id);
    }
  }

  /**
   * 清空所有历史记录
   * 后端API: DELETE /api/screening-history
   */
  static async clearScreeningHistory() {
    try {
      return await API.screeningHistory.clearAll();
    } catch (error) {
      console.error('清空筛选历史失败:', error);
      // 降级到localStorage
      return this._clearScreeningHistoryFromLocal();
    }
  }

  // ==================== 自选股相关 ====================

  /**
   * 添加自选股
   * 后端API: POST /api/watchlist
   */
  static async addWatchlist(stockCode) {
    try {
      return await API.watchlist.add({
        stock_code: stockCode,
        notes: '',
      });
    } catch (error) {
      console.error(`添加自选股 ${stockCode} 失败:`, error);
      // 降级到localStorage
      return this._addWatchlistToLocal(stockCode);
    }
  }

  /**
   * 移除自选股
   * 后端API: DELETE /api/watchlist/:id
   */
  static async removeWatchlist(stockCode) {
    try {
      // 先获取自选股列表找到ID
      const watchlistData = await API.watchlist.getList({ pageSize: 100 });
      const item = watchlistData.items.find(i => i.stock_code === stockCode);

      if (item) {
        return await API.watchlist.delete(item.id);
      }

      return false;
    } catch (error) {
      console.error(`移除自选股 ${stockCode} 失败:`, error);
      // 降级到localStorage
      return this._removeWatchlistFromLocal(stockCode);
    }
  }

  /**
   * 获取自选股列表
   * 后端API: GET /api/watchlist
   */
  static async getWatchlist() {
    try {
      const data = await API.watchlist.getList({ pageSize: 100 });
      return data.items || [];
    } catch (error) {
      console.error('获取自选股失败:', error);
      // 降级到localStorage
      return this._getWatchlistFromLocal();
    }
  }

  /**
   * 检查股票是否在自选股中
   * 后端API: GET /api/watchlist/stock/:code
   */
  static async isInWatchlist(stockCode) {
    try {
      const item = await API.watchlist.checkStock(stockCode);
      return item !== null;
    } catch (error) {
      console.error(`检查自选股 ${stockCode} 失败:`, error);
      // 降级到localStorage
      const watchlist = this._getWatchlistFromLocal();
      return watchlist.some(item => item.stock_code === stockCode);
    }
  }

  /**
   * 检查股票是否在自选股中（返回详细状态）
   * 后端API: GET /api/watchlist/stock/:code
   */
  static async checkWatchlistStock(stockCode) {
    try {
      const item = await API.watchlist.checkStock(stockCode);
      return {
        exists: true,
        id: item.id,
        ...item
      };
    } catch (error) {
      console.error(`检查自选股 ${stockCode} 失败:`, error);
      // 降级到localStorage
      const watchlist = this._getWatchlistFromLocal();
      const item = watchlist.find(item => item.stock_code === stockCode);
      if (item) {
        return {
          exists: true,
          id: item.id,
          ...item
        };
      }
      return { exists: false };
    }
  }

  /**
   * 添加股票到自选股
   * 后端API: POST /api/watchlist
   */
  static async addToWatchlist(stockInfo) {
    try {
      const result = await API.watchlist.add(stockInfo);
      return result;
    } catch (error) {
      console.error('添加自选股失败:', error);
      throw error;
    }
  }

  /**
   * 从自选股删除股票
   * 后端API: DELETE /api/watchlist/:id
   */
  static async removeFromWatchlist(id) {
    try {
      await API.watchlist.delete(id);
      return true;
    } catch (error) {
      console.error('删除自选股失败:', error);
      throw error;
    }
  }

  // ==================== 私有辅助方法 ====================

  /**
   * 根据条件筛选股票（前端筛选）
   */
  static _filterStocks(stocks, criteria) {
    return stocks.filter(stock => {
      // 行业筛选
      if (criteria.industry && criteria.industry !== '全部') {
        if (stock.industry !== criteria.industry) return false;
      }

      // 市盈率筛选
      if (criteria.peMin !== undefined && stock.pe < criteria.peMin) return false;
      if (criteria.peMax !== undefined && stock.pe > criteria.peMax) return false;

      // 市净率筛选
      if (criteria.pbMin !== undefined && stock.pb < criteria.pbMin) return false;
      if (criteria.pbMax !== undefined && stock.pb > criteria.pbMax) return false;

      // 市值筛选
      if (criteria.marketCap) {
        const capValue = this._parseMarketCap(stock.marketCap);
        const minCap = this._parseMarketCap(criteria.marketCap);
        if (capValue < minCap) return false;
      }

      // 涨跌幅筛选
      if (criteria.changeType === 'up' && stock.change <= 0) return false;
      if (criteria.changeType === 'down' && stock.change >= 0) return false;

      return true;
    });
  }

  /**
   * 计算平均涨幅
   */
  static _calculateAvgChange(stocks) {
    if (stocks.length === 0) return 0;
    const sum = stocks.reduce((acc, stock) => acc + (stock.change || 0), 0);
    return (sum / stocks.length).toFixed(2);
  }

  /**
   * 解析市值字符串为数值（亿）
   */
  static _parseMarketCap(marketCapStr) {
    if (!marketCapStr) return 0;
    const match = marketCapStr.match(/([\d.]+)(\w?)/);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2];

    if (unit === '万亿') return value * 10000;
    if (unit === '亿') return value * 100;
    if (unit === '万') return value / 10000;
    return value;
  }

  // ==================== LocalStorage降级方法 ====================

  static _saveScreeningHistoryToLocal(record) {
    const history = this._getScreeningHistoryFromLocal();
    const newRecord = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      criteria: record.criteria,
      result_count: record.resultCount,
      avg_change: record.avgChange,
      top_stocks: record.topStocks,
      results: record.results.slice(0, 10),
    };
    history.unshift(newRecord);
    const limitedHistory = history.slice(0, 100);
    localStorage.setItem('screeningHistory', JSON.stringify(limitedHistory));
    return newRecord;
  }

  static _getScreeningHistoryFromLocal(options = {}) {
    try {
      const historyData = localStorage.getItem('screeningHistory');
      let history = historyData ? JSON.parse(historyData) : [];
      const { limit, offset = 0 } = options;
      if (limit) {
        history = history.slice(offset, offset + limit);
      }
      return history;
    } catch (error) {
      return [];
    }
  }

  static _deleteScreeningHistoryFromLocal(id) {
    const history = this._getScreeningHistoryFromLocal();
    const filteredHistory = history.filter(record => record.id !== parseInt(id));
    localStorage.setItem('screeningHistory', JSON.stringify(filteredHistory));
    return true;
  }

  static _clearScreeningHistoryFromLocal() {
    localStorage.removeItem('screeningHistory');
    return true;
  }

  static _addWatchlistToLocal(stockCode) {
    const watchlist = this._getWatchlistFromLocal();
    if (!watchlist.some(item => item.stock_code === stockCode)) {
      watchlist.push({ stock_code: stockCode, added_at: new Date().toISOString() });
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }
    return true;
  }

  static _removeWatchlistFromLocal(stockCode) {
    const watchlist = this._getWatchlistFromLocal();
    const filteredWatchlist = watchlist.filter(item => item.stock_code !== stockCode);
    localStorage.setItem('watchlist', JSON.stringify(filteredWatchlist));
    return true;
  }

  static _getWatchlistFromLocal() {
    try {
      const watchlistData = localStorage.getItem('watchlist');
      return watchlistData ? JSON.parse(watchlistData) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * 获取模拟股票数据（降级方案）
   */
  static _getMockStockData() {
    return [
      {
        id: 1,
        code: '600519',
        name: '贵州茅台',
        price: 1856.00,
        change: 2.35,
        volume: '2.56万手',
        pe: 35.6,
        pb: 12.8,
        marketCap: '2.3万亿',
        turnover: '45.6亿',
        high52: 1980.00,
        low52: 1520.00,
        dividend: 25.91,
        dividendYield: 1.4,
        industry: '白酒',
        concept: ['MSCI中国', '沪股通', '机构重仓'],
        description: '贵州茅台是中国著名的白酒品牌，主要生产茅台酒及系列酒。公司是中国白酒行业的龙头企业，拥有独特的地理环境和传统酿造工艺。'
      },
      {
        id: 2,
        code: '000858',
        name: '五粮液',
        price: 168.50,
        change: 1.82,
        volume: '8.32万手',
        pe: 28.5,
        pb: 10.2,
        marketCap: '6500亿',
        turnover: '14.2亿',
        high52: 195.50,
        low52: 135.20,
        dividend: 15.68,
        dividendYield: 0.9,
        industry: '白酒',
        concept: ['MSCI中国', '深股通', '机构重仓'],
        description: '五粮液是中国知名的白酒品牌，以五粮浓香型白酒闻名。公司拥有"五粮液"、"五粮春"等多个品牌。'
      },
      {
        id: 3,
        code: '600036',
        name: '招商银行',
        price: 42.30,
        change: -0.56,
        volume: '15.6万手',
        pe: 8.5,
        pb: 1.2,
        marketCap: '1.1万亿',
        turnover: '6.6亿',
        high52: 48.50,
        low52: 32.80,
        dividend: 1.89,
        dividendYield: 4.5,
        industry: '银行',
        concept: ['MSCI中国', '沪股通', '机构重仓'],
        description: '招商银行是中国第一家完全由企业法人持股的股份制商业银行，以零售银行业务见长。'
      },
      {
        id: 4,
        code: '000001',
        name: '平安银行',
        price: 12.85,
        change: 0.78,
        volume: '22.3万手',
        pe: 6.8,
        pb: 0.85,
        marketCap: '2480亿',
        turnover: '2.9亿',
        high52: 15.20,
        low52: 10.50,
        dividend: 0.52,
        dividendYield: 4.0,
        industry: '银行',
        concept: ['深股通', '机构重仓'],
        description: '平安银行是平安集团旗下重要成员，致力于成为国际领先的个人金融生活服务提供商。'
      },
      {
        id: 5,
        code: '601318',
        name: '中国平安',
        price: 56.20,
        change: 1.25,
        volume: '18.9万手',
        pe: 9.2,
        pb: 1.5,
        marketCap: '1.0万亿',
        turnover: '10.6亿',
        high52: 65.80,
        low52: 42.30,
        dividend: 2.63,
        dividendYield: 4.7,
        industry: '保险',
        concept: ['MSCI中国', '沪股通', '机构重仓'],
        description: '中国平安是中国领先的综合金融服务集团，业务涵盖保险、银行、投资等领域。'
      }
    ];
  }
}

export default DataService;
