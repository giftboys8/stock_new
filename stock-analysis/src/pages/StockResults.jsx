import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataService from '../services/dataService';

const StockResults = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [sortBy, setSortBy] = useState('change');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [watchlistStatus, setWatchlistStatus] = useState({}); // {code: boolean}

  // 优先从 sessionStorage 获取筛选结果
  useEffect(() => {
    const loadStocks = async () => {
      try {
        const savedResults = sessionStorage.getItem('screeningResults');
        if (savedResults) {
          const results = JSON.parse(savedResults);
          // 在开发模式下 StrictMode 会导致 useEffect 执行两次
          // 如果这里清除，第二次执行时就获取不到数据了
          // sessionStorage.removeItem('screeningResults');
          setStocks(results);
          await loadWatchlistStatus(results.map(s => s.code));
          setLoading(false);
          return;
        }

        const savedFilter = sessionStorage.getItem('currentFilter');
        if (savedFilter) {
          setStocks([]);
          setLoading(false);
          return;
        }

        setStocks([]);
        setLoading(false);
      } catch (error) {
        console.error('加载股票数据失败:', error);
        setLoading(false);
      }
    };

    loadStocks();
  }, []);

  // 加载自选股状态
  const loadWatchlistStatus = async (stockCodes) => {
    try {
      const watchlist = await DataService.getWatchlist();
      const watchlistCodes = new Set(watchlist.map(item => item.stock_code));
      const status = {};
      stockCodes.forEach(code => {
        status[code] = watchlistCodes.has(code);
      });
      setWatchlistStatus(status);
    } catch (error) {
      console.error('加载自选股状态失败:', error);
    }
  };

  // 快速切换自选股
  const toggleWatchlist = async (stock, e) => {
    e.preventDefault(); // 防止触发Link点击
    e.stopPropagation();

    try {
      if (watchlistStatus[stock.code]) {
        // 从自选股删除 - 需要先获取id
        const watchlist = await DataService.getWatchlist();
        const item = watchlist.find(w => w.stock_code === stock.code);
        if (item) {
          await DataService.removeFromWatchlist(item.id);
          setWatchlistStatus(prev => ({ ...prev, [stock.code]: false }));
        }
      } else {
        // 添加到自选股
        await DataService.addToWatchlist({
          stock_code: stock.code,
          stock_name: stock.name,
          notes: ''
        });
        setWatchlistStatus(prev => ({ ...prev, [stock.code]: true }));
      }
    } catch (error) {
      console.error('操作自选股失败:', error);
      alert('操作失败，请稍后重试');
    }
  };

  // 排序和筛选逻辑
  const filteredStocks = stocks
    .filter(stock => {
      if (filterStatus === 'up') return stock.change > 0;
      if (filterStatus === 'down') return stock.change < 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'change') return b.change - a.change;
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'volume') {
        const volA = parseFloat(a.volume) || 0;
        const volB = parseFloat(b.volume) || 0;
        return volB - volA;
      }
      return 0;
    });


  /**
   * 重新筛选
   * TODO: 后端迁移时 -> 返回首页或调用 API 重新筛选
   */
  const handleRescreen = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-chinese text-center py-12">
          <p className="text-ink-gray dark:text-gray-300 font-body text-lg">
            正在筛选中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="font-title text-4xl text-ink-black dark:text-white mb-2">
          选股结果
        </h1>
        <p className="text-ink-gray dark:text-gray-300 font-body">
          共筛选出 <span className="text-bamboo font-bold">{filteredStocks.length}</span> 只股票
        </p>
      </div>

      {/* 筛选和排序工具栏 */}
      <div className="card-chinese mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 状态筛选 */}
          <div className="flex items-center space-x-4">
            <span className="text-ink-gray dark:text-gray-300 font-body">筛选：</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-sm transition-colors font-body ${
                  filterStatus === 'all'
                    ? 'bg-bamboo text-white'
                    : 'bg-paper-light dark:bg-gray-700 text-ink-gray dark:text-gray-300 hover:bg-bamboo/10'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterStatus('up')}
                className={`px-4 py-2 rounded-sm transition-colors font-body ${
                  filterStatus === 'up'
                    ? 'bg-bamboo text-white'
                    : 'bg-paper-light dark:bg-gray-700 text-ink-gray dark:text-gray-300 hover:bg-bamboo/10'
                }`}
              >
                上涨
              </button>
              <button
                onClick={() => setFilterStatus('down')}
                className={`px-4 py-2 rounded-sm transition-colors font-body ${
                  filterStatus === 'down'
                    ? 'bg-bamboo text-white'
                    : 'bg-paper-light dark:bg-gray-700 text-ink-gray dark:text-gray-300 hover:bg-bamboo/10'
                }`}
              >
                下跌
              </button>
            </div>
          </div>

          {/* 排序方式 */}
          <div className="flex items-center space-x-4">
            <span className="text-ink-gray dark:text-gray-300 font-body">排序：</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-border-ink dark:border-gray-600 rounded-sm bg-white dark:bg-[#2a3a4a] text-ink-black dark:text-white font-body focus:outline-none focus:ring-2 focus:ring-bamboo"
            >
              <option value="change">涨跌幅</option>
              <option value="price">价格</option>
              <option value="volume">成交量</option>
            </select>
          </div>
        </div>
      </div>

      {/* 股票列表 */}
      <div className="card-chinese">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-ink dark:border-gray-600">
                <th className="px-6 py-4 text-left font-title text-bamboo dark:text-bamboo-light text-lg">
                  序号
                </th>
                <th className="px-6 py-4 text-center font-title text-bamboo dark:text-bamboo-light text-lg">
                  自选
                </th>
                <th className="px-6 py-4 text-left font-title text-bamboo dark:text-bamboo-light text-lg">
                  股票代码
                </th>
                <th className="px-6 py-4 text-left font-title text-bamboo dark:text-bamboo-light text-lg">
                  股票名称
                </th>
                <th className="px-6 py-4 text-right font-title text-bamboo dark:text-bamboo-light text-lg">
                  当前价格
                </th>
                <th className="px-6 py-4 text-right font-title text-bamboo dark:text-bamboo-light text-lg">
                  涨跌幅
                </th>
                <th className="px-6 py-4 text-right font-title text-bamboo dark:text-bamboo-light text-lg">
                  成交量
                </th>
                <th className="px-6 py-4 text-right font-title text-bamboo dark:text-bamboo-light text-lg">
                  市盈率
                </th>
                <th className="px-6 py-4 text-right font-title text-bamboo dark:text-bamboo-light text-lg">
                  市净率
                </th>
                <th className="px-6 py-4 text-right font-title text-bamboo dark:text-bamboo-light text-lg">
                  总市值
                </th>
                <th className="px-6 py-4 text-center font-title text-bamboo dark:text-bamboo-light text-lg">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock, index) => (
                <tr
                  key={stock.id}
                  className="border-b border-border-ink dark:border-gray-600 hover:bg-paper-light dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 text-ink-gray dark:text-gray-300 font-body">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={(e) => toggleWatchlist(stock, e)}
                      className={`text-2xl transition-all hover:scale-125 ${
                        watchlistStatus[stock.code]
                          ? 'text-seal-red'
                          : 'text-ink-gray dark:text-gray-500 hover:text-bamboo'
                      }`}
                      title={watchlistStatus[stock.code] ? '从自选股删除' : '加入自选股'}
                    >
                      {watchlistStatus[stock.code] ? '⭐' : '☆'}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-data text-ink-black dark:text-white">
                    {stock.code}
                  </td>
                  <td className="px-6 py-4 font-body text-ink-black dark:text-white font-medium">
                    {stock.name}
                  </td>
                  <td className="px-6 py-4 text-right font-data text-ink-black dark:text-white">
                    {stock.price ? `¥${stock.price.toFixed(2)}` : '-'}
                  </td>
                  <td className={`px-6 py-4 text-right font-data font-medium ${
                    stock.change > 0
                      ? 'text-seal-red'
                      : stock.change < 0
                      ? 'text-bamboo'
                      : 'text-ink-gray'
                  }`}>
                    {stock.change !== null && stock.change !== undefined
                      ? `${stock.change > 0 ? '+' : ''}${stock.change.toFixed(2)}%`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-data text-ink-black dark:text-white">
                    {stock.volume || '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-data text-ink-black dark:text-white">
                    {stock.pe ? stock.pe.toFixed(1) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-data text-ink-black dark:text-white">
                    {stock.pb ? stock.pb.toFixed(1) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-data text-ink-black dark:text-white">
                    {stock.marketCap || stock.market_cap || '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/stocks/${stock.id}`}
                      className="inline-block px-4 py-2 bg-bamboo text-white rounded-sm hover:bg-bamboo-light transition-colors font-body text-sm"
                    >
                      查看详情
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 空状态 */}
        {filteredStocks.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-ink-gray dark:text-gray-300 font-body text-lg mb-4">
              暂无符合条件的股票
            </p>
            <button
              onClick={handleRescreen}
              className="px-6 py-2 bg-bamboo text-white rounded-sm hover:bg-bamboo-light transition-colors font-body"
            >
              重新筛选
            </button>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleRescreen}
          className="px-6 py-3 border border-bamboo text-bamboo rounded-sm hover:bg-bamboo hover:text-white transition-colors font-body"
        >
          重新筛选
        </button>
      </div>

      {/* TODO: 添加分页功能
      <div className="mt-6 flex justify-center">
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-border-ink dark:border-gray-600 rounded-sm text-ink-gray dark:text-gray-300 hover:bg-bamboo hover:text-white transition-colors font-body disabled:opacity-50">
            上一页
          </button>
          <button className="px-4 py-2 bg-bamboo text-white rounded-sm font-body">
            1
          </button>
          <button className="px-4 py-2 border border-border-ink dark:border-gray-600 rounded-sm text-ink-gray dark:text-gray-300 hover:bg-bamboo hover:text-white transition-colors font-body">
            2
          </button>
          <button className="px-4 py-2 border border-border-ink dark:border-gray-600 rounded-sm text-ink-gray dark:text-gray-300 hover:bg-bamboo hover:text-white transition-colors font-body">
            3
          </button>
          <button className="px-4 py-2 border border-border-ink dark:border-gray-600 rounded-sm text-ink-gray dark:text-gray-300 hover:bg-bamboo hover:text-white transition-colors font-body">
            下一页
          </button>
        </div>
      </div>
      */}
    </div>
  );
};

export default StockResults;
