/**
 * API服务层 - 连接后端FastAPI
 *
 * 基础URL配置
 * 优先使用环境变量，否则回退到 /api (适配 Nginx 代理)
 */
const API_BASE_URL = '/api';

/**
 * API请求封装
 */
async function request(url, options = {}) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);

    // 处理204 No Content
    if (response.status === 204) {
      return null;
    }

    // 处理非JSON响应
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API请求失败 [${options.method || 'GET'}] ${url}:`, error);
    throw error;
  }
}

/**
 * 股票相关API
 */
const StockAPI = {
  /**
   * 获取股票列表
   * @param {Object} params - 查询参数
   * @param {Number} params.page - 页码
   * @param {Number} params.pageSize - 每页数量
   * @param {String} params.search - 搜索关键词
   * @param {String} params.market - 市场筛选
   */
  async getStocks(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      pageSize: params.pageSize || 100,
      ...(params.search && { search: params.search }),
      ...(params.market && { market: params.market }),
    });

    const data = await request(`/stocks?${queryParams}`);
    return data.stocks || [];
  },

  /**
   * 获取股票详情
   * @param {String} code - 股票代码
   */
  async getStockByCode(code) {
    return await request(`/stocks/${code}`);
  },

  /**
   * 获取历史K线数据
   * @param {String} code - 股票代码
   * @param {String} period - 周期 (daily/weekly/monthly)
   * @param {String} startDate - 开始日期 (YYYYMMDD)
   * @param {String} endDate - 结束日期 (YYYYMMDD)
   */
  async getStockHistory(code, period = 'daily', startDate = null, endDate = null) {
    const queryParams = new URLSearchParams({ period });
    if (startDate) queryParams.set('start_date', startDate);
    if (endDate) queryParams.set('end_date', endDate);

    return await request(`/stocks/${code}/history?${queryParams}`);
  },
};

/**
 * 筛选相关API
 */
const ScreeningAPI = {
  /**
   * 执行股票筛选（异步）
   * @param {Object} criteria - 筛选条件
   * @returns {Object} { taskId, status, message }
   */
  async screenStocks(criteria) {
    return await request('/screen', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  },

  /**
   * 查询筛选任务状态
   * @param {String} taskId - 任务ID
   * @returns {Object} 任务状态和结果
   */
  async getTaskStatus(taskId) {
    return await request(`/screen/task/${taskId}`);
  },

  /**
   * 获取筛选策略列表
   */
  async getStrategies() {
    return await request('/screen/strategies');
  },

  /**
   * 取消正在执行的任务
   * @param {String} taskId - 任务ID
   */
  async cancelTask(taskId) {
    return await request(`/screen/task/${taskId}/cancel`, {
      method: 'POST',
    });
  },

  /**
   * 获取当前正在执行的活动任务
   * @returns {Object} { active, task }
   */
  async getActiveTask() {
    return await request('/screen/active');
  },
};

/**
 * 筛选历史API
 */
const ScreeningHistoryAPI = {
  /**
   * 保存筛选历史
   * @param {Object} record - 筛选记录
   */
  async save(record) {
    return await request('/screening-history', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },

  /**
   * 获取筛选历史列表
   * @param {Object} params - 查询参数
   */
  async getList(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    });

    return await request(`/screening-history?${queryParams}`);
  },

  /**
   * 获取单条筛选历史详情
   * @param {Number} id - 历史记录ID
   */
  async getById(id) {
    return await request(`/screening-history/${id}`);
  },

  /**
   * 删除筛选历史
   * @param {Number} id - 历史记录ID
   */
  async delete(id) {
    return await request(`/screening-history/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * 清空所有筛选历史
   */
  async clearAll() {
    return await request('/screening-history', {
      method: 'DELETE',
    });
  },
};

/**
 * 自选股API
 */
const WatchlistAPI = {
  /**
   * 添加自选股
   * @param {Object} item - 自选股信息
   */
  async add(item) {
    return await request('/watchlist', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  /**
   * 获取自选股列表
   * @param {Object} params - 查询参数
   */
  async getList(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      pageSize: params.pageSize || 50,
    });

    return await request(`/watchlist?${queryParams}`);
  },

  /**
   * 检查股票是否在自选股中
   * @param {String} stockCode - 股票代码
   */
  async checkStock(stockCode) {
    return await request(`/watchlist/stock/${stockCode}`);
  },

  /**
   * 删除自选股
   * @param {Number} id - 自选股记录ID
   */
  async delete(id) {
    return await request(`/watchlist/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * 统一的API服务导出
 */
const API = {
  stock: StockAPI,
  screening: ScreeningAPI,
  screeningHistory: ScreeningHistoryAPI,
  watchlist: WatchlistAPI,
};

export default API;
