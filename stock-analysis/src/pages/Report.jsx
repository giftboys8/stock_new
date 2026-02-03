import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Report = () => {
  const { id } = useParams();

  // 模拟完整推荐报告数据
  const mockReport = {
    stockCode: '600519',
    stockName: '贵州茅台',
    reportDate: '2026-01-28',
    analyst: 'AI智能分析系统',

    // 综合评分
    overallScore: 8.5,

    // 评分明细
    scores: {
      macro: 9,
      industry: 9,
      financial: 9,
      technical: 7,
      sentiment: 6,
      capital: 7
    },

    // 推荐理由
    reasons: [
      '基本面极其优秀：ROE 31.2%，毛利率91.2%，现金流充沛',
      '估值合理：当前PE 28.5处于历史42%分位，偏低',
      '行业景气：白酒行业集中度提升，龙头受益',
      '技术面良好：处于上升趋势，接近支撑位',
      '资金面支持：北向资金连续流入，机构增持'
    ],

    // 操作建议
    recommendation: {
      action: '逢低买入',
      actionType: 'buy', // buy, hold, sell, avoid
      confidence: '高',
      suggestedPrice: {
        min: 1650,
        max: 1700,
        current: 1650,
        description: '建议在1650-1700元区间分2-3次建仓'
      },
      position: {
        percentage: 25,
        description: '如果持有4只股票，建议配置25%仓位'
      }
    },

    // 止盈止损计划
    profitLossPlan: [
      { level: 1, price: 1820, profit: '+10%', sell: 20, description: '第一止盈位：1820元（+10%），卖出20%' },
      { level: 2, price: 1950, profit: '+20%', sell: 30, description: '第二止盈位：1950元（+20%），再卖出30%' },
      { level: 3, price: 2145, profit: '+30%', sell: 30, description: '第三止盈位：2145元（+30%），再卖出30%' },
      { level: 4, price: 2475, profit: '+50%', sell: 20, description: '清仓位：2475元（+50%），全部卖出' },
      { level: -1, price: 1485, profit: '-10%', sell: 100, isStopLoss: true, description: '止损位：1485元（-10%），坚决清仓' }
    ],

    // 风险提示
    risks: [
      { level: 'high', title: '经济下行风险', description: '经济下行导致消费降级，高端白酒需求下降' },
      { level: 'medium', title: '政策变化风险', description: '行业政策变化（如消费税上调）可能影响利润' },
      { level: 'medium', title: '短期回调风险', description: '股价已从低点反弹+15%，短期有回调压力' }
    ],

    // 持有周期和预期收益
    holdingPeriod: '6-12个月',
    expectedReturn: {
      min: 15,
      max: 25,
      description: '预期收益：15-25%'
    },

    // 免责声明
    disclaimer: '本报告由AI系统自动生成，仅供参考，不构成投资建议。投资有风险，入市需谨慎。'
  };

  const [report, setReport] = useState(null);

  useEffect(() => {
    // TODO: 后端迁移 -> GET /api/report/:id
    setReport(mockReport);
  }, [id]);

  // 辅助函数：获取评分颜色
  const getScoreColor = (score) => {
    if (score >= 9) return 'text-bamboo';
    if (score >= 7) return 'text-bamboo';
    if (score >= 5) return 'text-yellow-600';
    return 'text-seal-red';
  };

  // 辅助函数：获取操作建议颜色
  const getActionColor = (actionType) => {
    const colorMap = {
      buy: 'bg-bamboo',
      hold: 'bg-yellow-600',
      sell: 'bg-seal-red',
      avoid: 'bg-gray-600'
    };
    return colorMap[actionType] || 'bg-gray-600';
  };

  // 辅助函数：获取风险等级颜色
  const getRiskColor = (level) => {
    const colorMap = {
      high: 'border-seal-red bg-seal-red/5',
      medium: 'border-yellow-600 bg-yellow-600/5',
      low: 'border-bamboo bg-bamboo/5'
    };
    return colorMap[level] || 'border-gray-600';
  };

  if (!report) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-ink-gray dark:text-gray-300 font-body text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to={`/stocks/${id}`}
          className="inline-flex items-center space-x-2 text-bamboo hover:text-bamboo-light font-body transition-colors"
        >
          <span>←</span>
          <span>返回股票详情</span>
        </Link>
        <div className="flex space-x-4">
          <button className="px-4 py-2 border border-bamboo text-bamboo rounded-sm hover:bg-bamboo hover:text-white transition-colors font-body text-sm">
            📄 导出PDF
          </button>
          <button className="px-4 py-2 border border-border-ink dark:border-gray-600 text-ink-gray dark:text-gray-300 rounded-sm hover:bg-paper-light dark:hover:bg-gray-700 transition-colors font-body text-sm">
            🔗 分享链接
          </button>
        </div>
      </div>

      {/* 报告标题 */}
      <div className="card-chinese mb-6">
        <div className="text-center pb-6 border-b border-border-ink dark:border-gray-600">
          <h1 className="font-title text-4xl text-ink-black dark:text-white mb-3">
            AI投资推荐报告
          </h1>
          <p className="text-ink-gray dark:text-gray-300 font-body text-lg mb-2">
            {report.stockName}（{report.stockCode}）
          </p>
          <p className="text-ink-gray dark:text-gray-300 font-body text-sm">
            报告日期：{report.reportDate} | 分析师：{report.analyst}
          </p>
        </div>
      </div>

      {/* 综合评分 */}
      <div className="card-chinese mb-6">
        <div className="text-center p-8 bg-gradient-to-br from-bamboo/10 to-bamboo/5 rounded-sm">
          <div className="text-ink-gray dark:text-gray-300 font-body mb-3">综合评分</div>
          <div className={`font-data text-7xl font-bold ${getScoreColor(report.overallScore)} mb-3`}>
            {report.overallScore}<span className="text-3xl">/10</span>
          </div>
          <div className="flex justify-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-3xl">
                {i < Math.floor(report.overallScore / 2) ? '⭐' : '☆'}
              </span>
            ))}
          </div>

          {/* 操作建议 */}
          <div className="mt-6">
            <div className={`inline-block px-8 py-4 ${getActionColor(report.recommendation.actionType)} text-white rounded-sm`}>
              <div className="font-title text-2xl mb-1">{report.recommendation.action}</div>
              <div className="font-body text-sm opacity-90">信心度：{report.recommendation.confidence}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 六维度评分 */}
      <div className="card-chinese mb-6">
        <h3 className="font-title text-xl text-ink-black dark:text-white mb-4">
          六维度评分详情
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(report.scores).map(([key, score]) => {
            const labels = {
              macro: 'D. 宏观与事件',
              industry: 'C. 行业数据',
              financial: 'B. 财务数据',
              technical: 'A. 技术分析',
              sentiment: 'E. 情绪面',
              capital: 'F. 资金面'
            };
            return (
              <div key={key} className="text-center p-4 bg-paper-light dark:bg-gray-700 rounded-sm">
                <div className="text-ink-gray dark:text-gray-300 font-body text-sm mb-2">
                  {labels[key]}
                </div>
                <div className={`font-data text-2xl font-bold ${getScoreColor(score)}`}>
                  {score}/10
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 推荐理由 */}
      <div className="card-chinese mb-6">
        <h3 className="font-title text-xl text-ink-black dark:text-white mb-4">
          💡 推荐理由
        </h3>
        <div className="space-y-3">
          {report.reasons.map((reason, index) => (
            <div key={index} className="flex items-start space-x-3">
              <span className="text-bamboo font-title mt-1">{index + 1}.</span>
              <p className="text-ink-gray dark:text-gray-300 font-body flex-1">
                {reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 操作建议详情 */}
      <div className="card-chinese mb-6">
        <h3 className="font-title text-xl text-ink-black dark:text-white mb-4">
          🎯 操作建议
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-paper-light dark:bg-gray-700 rounded-sm">
            <span className="text-ink-gray dark:text-gray-300 font-body">建议价格区间</span>
            <span className="font-data text-xl text-ink-black dark:text-white font-medium">
              ¥{report.recommendation.suggestedPrice.min} - ¥{report.recommendation.suggestedPrice.max}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-paper-light dark:bg-gray-700 rounded-sm">
            <span className="text-ink-gray dark:text-gray-300 font-body">建议仓位</span>
            <span className="font-data text-xl text-bamboo font-medium">
              {report.recommendation.position.percentage}%
            </span>
          </div>
          <div className="text-ink-gray dark:text-gray-300 font-body text-sm bg-blue-50 dark:bg-blue-900/20 p-4 rounded-sm">
            💡 {report.recommendation.suggestedPrice.description}
          </div>
          <div className="text-ink-gray dark:text-gray-300 font-body text-sm bg-blue-50 dark:bg-blue-900/20 p-4 rounded-sm">
            💡 {report.recommendation.position.description}
          </div>
        </div>
      </div>

      {/* 止盈止损计划 */}
      <div className="card-chinese mb-6">
        <h3 className="font-title text-xl text-ink-black dark:text-white mb-4">
          📈 止盈止损计划
        </h3>
        <div className="space-y-3">
          {report.profitLossPlan.map((plan, index) => (
            <div
              key={index}
              className={`p-4 border-l-4 ${
                plan.isStopLoss
                  ? 'border-seal-red bg-seal-red/5'
                  : 'border-bamboo bg-bamboo/5'
              } rounded-sm`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-data text-lg text-ink-black dark:text-white font-medium">
                    {plan.description}
                  </div>
                  <div className="text-ink-gray dark:text-gray-300 font-body text-sm mt-1">
                    价格：¥{plan.price} | {plan.isStopLoss ? '止损' : '止盈'} {plan.profit}
                  </div>
                </div>
                {!plan.isStopLoss && (
                  <div className="text-right">
                    <div className="font-data text-2xl text-bamboo font-bold">
                      {plan.sell}%
                    </div>
                    <div className="text-ink-gray dark:text-gray-300 font-body text-xs">
                      卖出比例
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 风险提示 */}
      <div className="card-chinese mb-6">
        <h3 className="font-title text-xl text-ink-black dark:text-white mb-4">
          ⚠️ 风险提示
        </h3>
        <div className="space-y-4">
          {report.risks.map((risk, index) => (
            <div
              key={index}
              className={`p-4 border-l-4 ${getRiskColor(risk.level)} rounded-sm`}
            >
              <div className="font-title text-lg text-ink-black dark:text-white mb-2">
                {risk.title}
              </div>
              <div className="text-ink-gray dark:text-gray-300 font-body text-sm">
                {risk.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 预期收益和持有周期 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card-chinese text-center">
          <div className="text-ink-gray dark:text-gray-300 font-body mb-2">预期收益</div>
          <div className="font-data text-4xl text-bamboo font-bold mb-2">
            {report.expectedReturn.min}% - {report.expectedReturn.max}%
          </div>
          <div className="text-ink-gray dark:text-gray-300 font-body text-sm">
            {report.expectedReturn.description}
          </div>
        </div>
        <div className="card-chinese text-center">
          <div className="text-ink-gray dark:text-gray-300 font-body mb-2">建议持有周期</div>
          <div className="font-data text-4xl text-ink-black dark:text-white font-bold">
            {report.holdingPeriod}
          </div>
        </div>
      </div>

      {/* 免责声明 */}
      <div className="card-chinese">
        <div className="text-ink-gray dark:text-gray-300 font-body text-sm leading-relaxed">
          <div className="font-title text-ink-black dark:text-white mb-2">⚠️ 免责声明</div>
          {report.disclaimer}
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <button className="px-8 py-3 bg-bamboo text-white rounded-sm hover:bg-bamboo-light transition-colors font-body">
          打印报告
        </button>
        <button className="px-8 py-3 border border-bamboo text-bamboo rounded-sm hover:bg-bamboo hover:text-white transition-colors font-body">
          保存到本地
        </button>
        <button className="px-8 py-3 border border-border-ink dark:border-gray-600 text-ink-gray dark:text-gray-300 rounded-sm hover:bg-paper-light dark:hover:bg-gray-700 transition-colors font-body">
          返回选股结果
        </button>
      </div>
    </div>
  );
};

export default Report;
