import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataService from '../services/dataService';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('added_at');

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const data = await DataService.getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error('加载自选股失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id, stockName) => {
    if (!confirm(`确定要将 ${stockName} 从自选股中删除吗？`)) {
      return;
    }

    try {
      await DataService.removeFromWatchlist(id);
      // 从列表中移除
      setWatchlist(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('删除自选股失败:', error);
      alert('删除失败，请稍后重试');
    }
  };

  // 排序逻辑
  const sortedWatchlist = [...watchlist].sort((a, b) => {
    if (sortBy === 'added_at') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortBy === 'name') {
      return a.stock_name.localeCompare(b.stock_name, 'zh-CN');
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-chinese text-center py-12">
          <div className="font-body text-ink-gray dark:text-gray-300">
            加载中...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="font-title text-4xl text-ink-black dark:text-white mb-2">
          我的自选股
        </h1>
        <p className="font-body text-ink-gray dark:text-gray-300">
          共 {watchlist.length} 只股票
        </p>
      </div>

      {/* 空状态 */}
      {watchlist.length === 0 ? (
        <div className="card-chinese text-center py-16">
          <div className="text-6xl mb-4">☆</div>
          <h2 className="font-title text-2xl text-ink-black dark:text-white mb-3">
            还没有添加自选股
          </h2>
          <p className="font-body text-ink-gray dark:text-gray-300 mb-6">
            在筛选结果或股票详情页点击"☆ 加入自选股"按钮
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-bamboo text-white rounded-sm hover:bg-bamboo-light transition-colors font-body"
          >
            去筛选股票
          </Link>
        </div>
      ) : (
        <>
          {/* 排序选项 */}
          <div className="card-chinese mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-body text-ink-gray dark:text-gray-300">
                排序方式：
              </span>
              <button
                onClick={() => setSortBy('added_at')}
                className={`px-4 py-2 rounded-sm font-body transition-colors ${
                  sortBy === 'added_at'
                    ? 'bg-bamboo text-white'
                    : 'bg-paper-light dark:bg-gray-700 text-ink-gray dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                添加时间
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-4 py-2 rounded-sm font-body transition-colors ${
                  sortBy === 'name'
                    ? 'bg-bamboo text-white'
                    : 'bg-paper-light dark:bg-gray-700 text-ink-gray dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                股票名称
              </button>
            </div>
          </div>

          {/* 自选股列表 */}
          <div className="card-chinese">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-ink dark:border-gray-600">
                    <th className="px-6 py-4 text-left font-title text-bamboo dark:text-bamboo-light text-lg">
                      股票代码
                    </th>
                    <th className="px-6 py-4 text-left font-title text-bamboo dark:text-bamboo-light text-lg">
                      股票名称
                    </th>
                    <th className="px-6 py-4 text-left font-title text-bamboo dark:text-bamboo-light text-lg">
                      添加时间
                    </th>
                    <th className="px-6 py-4 text-left font-title text-bamboo dark:text-bamboo-light text-lg">
                      备注
                    </th>
                    <th className="px-6 py-4 text-center font-title text-bamboo dark:text-bamboo-light text-lg">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedWatchlist.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border-ink dark:border-gray-600 hover:bg-paper-light dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-data text-ink-black dark:text-white">
                        {item.stock_code}
                      </td>
                      <td className="px-6 py-4 font-body text-ink-black dark:text-white font-medium">
                        {item.stock_name}
                      </td>
                      <td className="px-6 py-4 font-body text-ink-gray dark:text-gray-300">
                        {new Date(item.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 font-body text-ink-gray dark:text-gray-300">
                        {item.notes || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/stocks/${item.stock_code}`}
                            className="inline-block px-4 py-2 bg-bamboo text-white rounded-sm hover:bg-bamboo-light transition-colors font-body text-sm"
                          >
                            查看详情
                          </Link>
                          <button
                            onClick={() => handleRemove(item.id, item.stock_name)}
                            className="px-4 py-2 border border-seal-red text-seal-red rounded-sm hover:bg-seal-red hover:text-white transition-colors font-body text-sm"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Watchlist;
