import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DataService from '../services/dataService';

const HistoryDetail = () => {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // 异步调用API获取历史记录详情
        const historyRecord = await DataService.getScreeningHistoryById(id);

        if (historyRecord) {
          setDetail(historyRecord);
        }
      } catch (error) {
        console.error('获取历史记录详情失败:', error);
      }
    };

    fetchDetail();
  }, [id]);

  if (!detail) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-ink-gray dark:text-gray-300 font-body text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 返回按钮 */}
      <Link
        to="/history"
        className="inline-flex items-center space-x-2 text-bamboo hover:text-bamboo-light font-body mb-6 transition-colors"
      >
        <span>←</span>
        <span>返回历史记录</span>
      </Link>

      {/* 标题和时间 */}
      <div className="mb-8">
        <h1 className="font-title text-4xl text-ink-black dark:text-white mb-2">
          筛选记录详情
        </h1>
        <p className="text-ink-gray dark:text-gray-300 font-body text-lg">
          筛选时间：<span className="font-data">{detail.timestamp}</span>
        </p>
      </div>

      {/* 筛选条件卡片 */}
      <div className="card-chinese mb-6">
        <h3 className="font-title text-xl text-ink-black dark:text-white mb-4">
          筛选条件
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(detail.criteria).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between items-center p-4 bg-paper-light dark:bg-gray-700 rounded-sm"
            >
              <span className="text-ink-gray dark:text-gray-300 font-body">
                {key}:
              </span>
              <span className="font-data text-ink-black dark:text-white font-medium">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 统计摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card-chinese">
          <div className="text-ink-gray dark:text-gray-300 font-body mb-2">筛选结果</div>
          <div className="font-data text-3xl text-bamboo font-bold">
            {detail.resultCount}
            <span className="text-lg text-ink-gray dark:text-gray-300 ml-1">只</span>
          </div>
        </div>
        <div className="card-chinese">
          <div className="text-ink-gray dark:text-gray-300 font-body mb-2">平均涨幅</div>
          <div className={`font-data text-3xl font-bold ${
            detail.avgChange > 0 ? 'text-seal-red' : 'text-bamboo'
          }`}>
            {detail.avgChange > 0 ? '+' : ''}{detail.avgChange.toFixed(2)}%
          </div>
        </div>
        <div className="card-chinese">
          <div className="text-ink-gray dark:text-gray-300 font-body mb-2">上涨/下跌</div>
          <div className="flex items-center space-x-2">
            <span className="font-data text-2xl text-seal-red font-bold">
              {detail.summary.upCount}
            </span>
            <span className="text-ink-gray dark:text-gray-300">/</span>
            <span className="font-data text-2xl text-bamboo font-bold">
              {detail.summary.downCount}
            </span>
          </div>
        </div>
        <div className="card-chinese">
          <div className="text-ink-gray dark:text-gray-300 font-body mb-2">总市值</div>
          <div className="font-data text-3xl text-ink-black dark:text-white font-bold">
            {detail.summary.totalMarketCap}
          </div>
        </div>
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card-chinese">
          <h3 className="font-title text-xl text-ink-black dark:text-white mb-4">
            估值统计
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border-ink dark:border-gray-600 pb-3">
              <span className="text-ink-gray dark:text-gray-300 font-body">平均市盈率</span>
              <span className="font-data text-lg text-ink-black dark:text-white font-medium">
                {detail.summary.avgPE}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border-ink dark:border-gray-600 pb-3">
              <span className="text-ink-gray dark:text-gray-300 font-body">平均市净率</span>
              <span className="font-data text-lg text-ink-black dark:text-white font-medium">
                {detail.summary.avgPB}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-gray dark:text-gray-300 font-body">涨停/跌停</span>
              <span className="font-data text-lg text-ink-black dark:text-white font-medium">
                {detail.summary.limitUp} / {detail.summary.limitDown}
              </span>
            </div>
          </div>
        </div>

        <div className="card-chinese">
          <h3 className="font-title text-xl text-ink-black dark:text-white mb-4">
            涨跌分布
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border-ink dark:border-gray-600 pb-3">
              <span className="text-ink-gray dark:text-gray-300 font-body">上涨股票</span>
              <span className="font-data text-lg text-seal-red font-medium">
                {detail.summary.upCount} 只 ({((detail.summary.upCount / detail.resultCount) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border-ink dark:border-gray-600 pb-3">
              <span className="text-ink-gray dark:text-gray-300 font-body">下跌股票</span>
              <span className="font-data text-lg text-bamboo font-medium">
                {detail.summary.downCount} 只 ({((detail.summary.downCount / detail.resultCount) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-gray dark:text-gray-300 font-body">平盘股票</span>
              <span className="font-data text-lg text-ink-gray dark:text-gray-300 font-medium">
                {detail.resultCount - detail.summary.upCount - detail.summary.downCount} 只
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选结果列表 */}
      <div className="card-chinese">
        <h3 className="font-title text-xl text-ink-black dark:text-white mb-4">
          筛选结果列表（前5只）
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-ink dark:border-gray-600">
                <th className="px-6 py-4 text-left font-title text-bamboo dark:text-bamboo-light text-lg">
                  序号
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
                <th className="px-6 py-4 text-center font-title text-bamboo dark:text-bamboo-light text-lg">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {detail.results.map((stock, index) => (
                <tr
                  key={stock.code}
                  className="border-b border-border-ink dark:border-gray-600 hover:bg-paper-light dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 text-ink-gray dark:text-gray-300 font-body">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-data text-ink-black dark:text-white">
                    {stock.code}
                  </td>
                  <td className="px-6 py-4 font-body text-ink-black dark:text-white font-medium">
                    {stock.name}
                  </td>
                  <td className="px-6 py-4 text-right font-data text-ink-black dark:text-white">
                    ¥{stock.price.toFixed(2)}
                  </td>
                  <td className={`px-6 py-4 text-right font-data font-medium ${
                    stock.change > 0 ? 'text-seal-red' : 'text-bamboo'
                  }`}>
                    {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-right font-data text-ink-black dark:text-white">
                    {stock.volume}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/stocks/${stock.code}`}
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

        {/* 查看全部按钮 */}
        <div className="mt-6 text-center">
          <button className="px-6 py-3 border border-bamboo text-bamboo rounded-sm hover:bg-bamboo hover:text-white transition-colors font-body">
            查看全部 {detail.resultCount} 只股票
          </button>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button className="px-6 py-3 bg-bamboo text-white rounded-sm hover:bg-bamboo-light transition-colors font-body">
          重新筛选
        </button>
        <button className="px-6 py-3 border border-border-ink dark:border-gray-600 text-ink-gray dark:text-gray-300 rounded-sm hover:bg-paper-light dark:hover:bg-gray-700 transition-colors font-body">
          导出报告
        </button>
        <button className="px-6 py-3 border border-seal-red text-seal-red rounded-sm hover:bg-seal-red hover:text-white transition-colors font-body">
          删除记录
        </button>
      </div>
    </div>
  );
};

export default HistoryDetail;
