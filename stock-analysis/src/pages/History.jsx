import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataService from '../services/dataService';

// TODO: 后端迁移 -> GET /api/screening-history
const History = () => {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);

  // 从后端API加载历史记录
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const history = await DataService.getScreeningHistory();
    setHistoryList(history);
  };
  const [sortBy, setSortBy] = useState('timestamp');

  // 排序逻辑
  const sortedHistory = [...historyList].sort((a, b) => {
    if (sortBy === 'timestamp') return new Date(b.timestamp) - new Date(a.timestamp);
    if (sortBy === 'resultCount') return b.resultCount - a.resultCount;
    if (sortBy === 'avgChange') return b.avgChange - a.avgChange;
    return 0;
  });

  // 格式化筛选条件显示
  const formatCriteria = (criteria) => {
    return Object.entries(criteria)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' | ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="font-title text-4xl text-ink-black dark:text-white mb-2">
          历史记录
        </h1>
        <p className="text-ink-gray dark:text-gray-300 font-body">
          共有 <span className="text-bamboo font-bold">{historyList.length}</span> 条筛选历史
        </p>
      </div>

      {/* 排序工具栏 */}
      <div className="card-chinese mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-ink-gray dark:text-gray-300 font-body">排序：</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-border-ink dark:border-gray-600 rounded-sm bg-white dark:bg-[#2a3a4a] text-ink-black dark:text-white font-body focus:outline-none focus:ring-2 focus:ring-bamboo"
            >
              <option value="timestamp">时间</option>
              <option value="resultCount">结果数量</option>
              <option value="avgChange">平均涨幅</option>
            </select>
          </div>

          <button
            onClick={async () => {
              if (window.confirm('确定要清空所有历史记录吗？')) {
                await DataService.clearScreeningHistory();
                await loadHistory(); // 重新加载历史记录
              }
            }}
            className="px-4 py-2 border border-seal-red text-seal-red rounded-sm hover:bg-seal-red hover:text-white transition-colors font-body"
          >
            清空历史
          </button>
        </div>
      </div>

      {/* 历史记录列表 */}
      <div className="space-y-6">
        {sortedHistory.map((record) => (
          <div key={record.id} className="card-chinese hover:shadow-ink-lg transition-shadow">
            <div className="flex flex-wrap items-start justify-between gap-4">
              {/* 左侧信息 */}
              <div className="flex-1 min-w-0">
                {/* 时间和ID */}
                <div className="flex items-center space-x-4 mb-3">
                  <span className="font-data text-ink-gray dark:text-gray-300">
                    {record.timestamp}
                  </span>
                  <span className="px-2 py-1 bg-bamboo/10 text-bamboo rounded-sm font-body text-xs">
                    #{record.id}
                  </span>
                </div>

                {/* 筛选条件 */}
                <div className="mb-4">
                  <div className="text-ink-gray dark:text-gray-300 font-body text-sm mb-2">
                    筛选条件：
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(record.criteria).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-3 py-1 bg-paper-light dark:bg-gray-700 text-ink-black dark:text-white rounded-sm font-body text-sm"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 主要股票 */}
                <div>
                  <div className="text-ink-gray dark:text-gray-300 font-body text-sm mb-2">
                    代表股票：
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {record.topStocks && Array.isArray(record.topStocks) ? record.topStocks.map((stock, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo/10 text-indigo rounded-sm font-body text-sm"
                      >
                        {stock}
                      </span>
                    )) : null}
                  </div>
                </div>
              </div>

              {/* 右侧统计数据 */}
              <div className="flex flex-col items-end space-y-3">
                {/* 结果数量 */}
                <div className="text-right">
                  <div className="text-ink-gray dark:text-gray-300 font-body text-sm mb-1">
                    筛选结果
                  </div>
                  <div className="font-data text-3xl text-bamboo font-bold">
                    {record.resultCount}
                    <span className="text-lg text-ink-gray dark:text-gray-300 ml-1">只</span>
                  </div>
                </div>

                {/* 平均涨幅 */}
                <div className="text-right">
                  <div className="text-ink-gray dark:text-gray-300 font-body text-sm mb-1">
                    平均涨幅
                  </div>
                  <div className={`font-data text-2xl font-medium ${
                    record.avgChange > 0 ? 'text-seal-red' : 'text-bamboo'
                  }`}>
                    {record.avgChange > 0 ? '+' : ''}{record.avgChange.toFixed(2)}%
                  </div>
                </div>

                {/* 查看详情按钮 */}
                <Link
                  to={`/history/${record.id}`}
                  className="inline-block px-6 py-2 bg-bamboo text-white rounded-sm hover:bg-bamboo-light transition-colors font-body text-center"
                >
                  查看详情
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {sortedHistory.length === 0 && (
        <div className="card-chinese text-center py-12">
          <p className="text-ink-gray dark:text-gray-300 font-body text-lg">
            暂无历史记录
          </p>
        </div>
      )}

      {/* 分页 */}
      <div className="mt-8 flex justify-center">
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-border-ink dark:border-gray-600 rounded-sm text-ink-gray dark:text-gray-300 hover:bg-bamboo hover:text-white transition-colors font-body disabled:opacity-50">
            上一页
          </button>
          <button className="px-4 py-2 bg-bamboo text-white rounded-sm font-body">
            1
          </button>
          <button className="px-4 py-2 border border-border-ink dark:border-gray-600 rounded-sm text-ink-gray dark:text-gray-300 hover:bg-bamboo hover:text-white transition-colors font-body">
            下一页
          </button>
        </div>
      </div>
    </div>
  );
};

export default History;
