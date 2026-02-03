import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DataService from '../services/dataService';

const StockDetail = () => {
  const { id } = useParams();

  // 模拟完整数据 - 包含DCBAEF六维度分析
  const mockAnalysis = {
    id: 1,
    code: '600519',
    name: '贵州茅台',
    price: 1650.00,
    change: 2.35,
    volume: '2.56万手',
    pe: 28.5,
    pb: 12.3,
    roe: 31.2,
    marketCap: '2.1万亿',
    turnover: '12.5亿',
    high52: 1850.00,
    low52: 1420.00,
    dividend: 25.91,
    dividendYield: 1.4,
    industry: '白酒',
    concept: ['MSCI中国', '沪股通', '机构重仓'],
    description: '贵州茅台是中国著名的白酒品牌，主要生产茅台酒及系列酒。公司是中国白酒行业的龙头企业，拥有独特的地理环境和传统酿造工艺。',

    // 综合评分
    overallScore: 8.5,
    aiRecommendation: {
      action: '逢低买入',
      suggestedPrice: '1650-1700元',
      position: '25%',
      stopLoss: '1485元',
      takeProfit: '1820元',
      holdingPeriod: '6-12个月',
      expectedReturn: '15-25%'
    },

    // DCBAEF六维度分析
    dimensions: {
      // D - 宏观与事件
      macro: {
        score: 9,
        rating: 'excellent',
        data: {
          gdp: '5.2%（Q4 2025）',
          policy: '稳健中性',
          cpi: '2.1%',
          events: [
            { type: 'positive', title: '消费刺激政策出台', date: '2025-12-15', impact: '提升白酒行业利润率5-8%' },
            { type: 'risk', title: '经济下行压力', date: '', impact: '高端白酒需求可能下降' }
          ]
        },
        aiAnalysis: '当前宏观环境对白酒行业整体友好，无重大利空。消费复苏和政策支持对茅台形成利好。建议关注经济数据变化。'
      },

      // C - 行业数据
      industry: {
        score: 9,
        rating: 'excellent',
        data: {
          industryPE: 35.2,
          industryPEPercentile: 28,
          industryROE: 22.5,
          industryChange3M: '+8.3%',
          ranking: 'No.1',
          marketShare: '35%',
          competitors: [
            { name: '五粮液', code: '000858', cap: '1.2万亿', roe: 28.5 },
            { name: '泸州老窖', code: '000568', cap: '3000亿', roe: 26.1 }
          ],
          trends: ['量减价增：高端白酒供不应求', '集中度提升：小品牌退出，龙头受益', '渠道改革：直营比例提升']
        },
        aiAnalysis: '白酒行业处于景气周期，估值合理偏低，行业龙头茅台将最大程度受益于行业集中度提升。'
      },

      // B - 财务数据
      financial: {
        score: 9,
        rating: 'excellent',
        data: {
          profitability: {
            roe: { value: 31.2, industry: 22.5, rating: 5 },
            grossMargin: { value: 91.2, industry: 75.3, rating: 5 },
            netMargin: { value: 52.3, industry: 28.6, rating: 5 }
          },
          growth: {
            revenueGrowth: [15.3, 18.2, 16.5], // 2023, 2024, 2025E
            profitGrowth: [17.8, 19.5, 17.2]
          },
          health: {
            debtRatio: { value: 18.5, industry: 35, rating: 5 },
            currentRatio: { value: 8.2, industry: 2.5, rating: 5 },
            cashFlow: '520亿（+12.3%）'
          },
          valuation: {
            currentPE: 28.5,
            peMedian: 32,
            pePercentile: 42,
            pb: 12.3,
            pbMedian: 14.5
          }
        },
        aiAnalysis: '茅台财务数据极其优秀：ROE 31.2%远超行业，毛利率91.2%极高，负债率仅18.5%，现金流充沛。当前估值处于历史偏低位置，具备投资价值。'
      },

      // A - 技术分析
      technical: {
        score: 7,
        rating: 'neutral',
        data: {
          price: 1650,
          support1: { level: 'MA100', value: 1580 },
          support2: { level: '前期低点', value: 1500 },
          resistance1: { level: 'MA20', value: 1750 },
          resistance2: { level: '52周高点', value: 1850 },
          trend: {
            ma20: 1678,
            ma60: 1652,
            ma100: 1620,
            isUpward: true
          },
          signals: {
            macd: '金叉，多头信号',
            rsi: 52,
            bollinger: '接近中轨，震荡偏多'
          }
        },
        aiAnalysis: '技术面显示股票处于上升趋势，当前价格接近长期支撑位（MA100），是较好的买入时机。建议在1650-1700元区间分批建仓。'
      },

      // E - 情绪面
      sentiment: {
        score: 6,
        rating: 'neutral',
        data: {
          turnover: 2.1,
          margin: '1.52万亿（+2.3%）',
          northbound: '+20亿元（连续3日净流入）',
          trend5Day: 5.8,
          trend10Day: 6.2
        },
        aiAnalysis: '当前市场情绪正常，北向资金连续流入，融资余额温和增长，说明市场信心稳定。换手率略高但未过热，适合正常投资。'
      },

      // F - 资金面
      capital: {
        score: 7,
        rating: 'good',
        data: {
          northboundToday: '+20亿元',
          northbound5Day: '+85亿元',
          northbound10Day: '+120亿元',
          mainToday: '+5亿元',
          retailToday: '-8亿元',
          northboundHolding: '8.5%（+0.3%）',
          fundHolding: '12.3%（+1.2%）',
          institutionalHolding: '35.6%（+0.8%）'
        },
        aiAnalysis: '资金面良好，北向资金连续10日净流入，机构持续增持，说明专业投资者看好。主力资金流入，散户流出，是健康的资金结构。'
      }
    }
  };

  const [stock, setStock] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [expandedDimension, setExpandedDimension] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // 使用股票代码从后端获取真实数据
        const stockData = await DataService.getStockByCode(id);
        if (stockData) {
          setStock(stockData);

          // 检查是否在自选股中
          checkWatchlistStatus(id);
        }
      } catch (error) {
        console.error('获取股票数据失败:', error);
      }

      // 模拟获取分析数据（TODO: 未来集成AI分析API）
      setAnalysis(mockAnalysis);
    };

    fetchStockData();
  }, [id]);

  // 检查自选股状态
  const checkWatchlistStatus = async (stockCode) => {
    try {
      const status = await DataService.checkWatchlistStock(stockCode);
      setIsInWatchlist(status.exists);
    } catch (error) {
      console.error('检查自选股状态失败:', error);
    }
  };

  // 添加/删除自选股
  const toggleWatchlist = async () => {
    if (!stock) return;

    setWatchlistLoading(true);
    try {
      if (isInWatchlist) {
        // 从自选股删除
        await DataService.removeFromWatchlist(stock.watchlistId);
        setIsInWatchlist(false);
        console.log('已从自选股删除');
      } else {
        // 添加到自选股
        await DataService.addToWatchlist({
          stock_code: stock.code,
          stock_name: stock.name,
          notes: ''
        });
        setIsInWatchlist(true);
        console.log('已添加到自选股');
      }
    } catch (error) {
      console.error('操作自选股失败:', error);
      alert('操作失败，请稍后重试');
    } finally {
      setWatchlistLoading(false);
    }
  };

  // 辅助函数：获取评分颜色
  const getScoreColor = (score) => {
    if (score >= 9) return 'text-bamboo';
    if (score >= 7) return 'text-bamboo';
    if (score >= 5) return 'text-yellow-600';
    return 'text-seal-red';
  };

  // 辅助函数：获取评分等级文本
  const getRatingText = (rating) => {
    const ratingMap = {
      excellent: '🟢 优秀',
      good: '🟢 良好',
      neutral: '🟡 一般',
      poor: '🔴 较差'
    };
    return ratingMap[rating] || '未评级';
  };

  // 维度卡片组件
  const DimensionCard = ({ letter, title, data, color }) => (
    <div className="card-chinese">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-title text-xl text-ink-black dark:text-white">
          {letter}. {title}
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`font-data text-2xl font-bold ${getScoreColor(data.score)}`}>
            {data.score}/10
          </span>
          <span className="text-sm">{getRatingText(data.rating)}</span>
        </div>
      </div>

      {/* 详细内容 - 根据展开状态显示 */}
      {expandedDimension === letter || expandedDimension === null ? (
        <div className="space-y-4">
          {/* 具体内容根据维度类型渲染 */}
          <div className="text-ink-gray dark:text-gray-300 font-body leading-relaxed">
            {data.aiAnalysis}
          </div>
        </div>
      ) : null}

      {/* 展开/收起按钮 */}
      <button
        onClick={() => setExpandedDimension(expandedDimension === letter ? null : letter)}
        className="mt-4 text-bamboo hover:text-bamboo-light font-body text-sm"
      >
        {expandedDimension === letter ? '收起详情 ▲' : '展开详情 ▼'}
      </button>
    </div>
  );

  if (!stock || !analysis) {
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
        to="/stocks"
        className="inline-flex items-center space-x-2 text-bamboo hover:text-bamboo-light font-body mb-6 transition-colors"
      >
        <span>←</span>
        <span>返回选股结果</span>
      </Link>

      {/* 股票基本信息 */}
      <div className="card-chinese mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-title text-4xl text-ink-black dark:text-white mb-2">
              {stock.name}
            </h1>
            <p className="text-ink-gray dark:text-gray-300 font-body text-lg">
              股票代码：<span className="font-data">{stock.code}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="font-data text-5xl font-bold text-ink-black dark:text-white mb-2">
              ¥{stock.price.toFixed(2)}
            </div>
            <div className={`font-data text-2xl font-medium ${
              stock.change > 0 ? 'text-seal-red' : 'text-bamboo'
            }`}>
              {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* 自选股按钮 */}
        <div className="mb-6">
          <button
            onClick={toggleWatchlist}
            disabled={watchlistLoading}
            className={`px-6 py-2 rounded-sm font-body transition-all ${
              isInWatchlist
                ? 'bg-seal-red/10 text-seal-red border border-seal-red hover:bg-seal-red/20'
                : 'bg-bamboo text-white hover:bg-bamboo-light'
            } ${watchlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {watchlistLoading ? (
              '处理中...'
            ) : isInWatchlist ? (
              '⭐ 已在自选股'
            ) : (
              '☆ 加入自选股'
            )}
          </button>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-bamboo/10 text-bamboo rounded-sm font-body text-sm">
            {stock.industry}
          </span>
          {stock.concept.map((item, index) => (
            <span key={index} className="px-3 py-1 bg-indigo/10 text-indigo rounded-sm font-body text-sm">
              {item}
            </span>
          ))}
        </div>

        {/* 公司简介 */}
        <div className="border-t border-border-ink dark:border-gray-600 pt-6">
          <h3 className="font-title text-xl text-ink-black dark:text-white mb-3">
            公司简介
          </h3>
          <p className="text-ink-gray dark:text-gray-300 font-body leading-relaxed">
            {stock.description}
          </p>
        </div>
      </div>

      {/* 综合评分和AI建议 */}
      <div className="card-chinese mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 评分卡片 */}
          <div className="text-center p-6 bg-gradient-to-br from-bamboo/10 to-bamboo/5 rounded-sm">
            <div className="text-ink-gray dark:text-gray-300 font-body mb-2">综合评分</div>
            <div className={`font-data text-6xl font-bold ${getScoreColor(analysis.overallScore)} mb-2`}>
              {analysis.overallScore}<span className="text-3xl">/10</span>
            </div>
            <div className="flex justify-center space-x-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-2xl">
                  {i < Math.floor(analysis.overallScore / 2) ? '⭐' : '☆'}
                </span>
              ))}
            </div>
            <div className="text-bamboo font-title text-lg">{getRatingText(analysis.overallScore >= 9 ? 'excellent' : analysis.overallScore >= 7 ? 'good' : 'neutral')}</div>
          </div>

          {/* AI建议 */}
          <div className="lg:col-span-2 p-6">
            <h3 className="font-title text-xl text-ink-black dark:text-white mb-4">🤖 AI综合建议</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 border-b border-border-ink dark:border-gray-600 pb-3">
                <span className="text-ink-gray dark:text-gray-300 font-body">建议操作：</span>
                <span className="font-data text-lg text-bamboo font-medium">{analysis.aiRecommendation.action}</span>
              </div>
              <div className="flex items-center space-x-3 border-b border-border-ink dark:border-gray-600 pb-3">
                <span className="text-ink-gray dark:text-gray-300 font-body">建议价格：</span>
                <span className="font-data text-lg text-ink-black dark:text-white font-medium">{analysis.aiRecommendation.suggestedPrice}</span>
              </div>
              <div className="flex items-center space-x-3 border-b border-border-ink dark:border-gray-600 pb-3">
                <span className="text-ink-gray dark:text-gray-300 font-body">建议仓位：</span>
                <span className="font-data text-lg text-ink-black dark:text-white font-medium">{analysis.aiRecommendation.position}</span>
              </div>
              <div className="flex items-center space-x-3 border-b border-border-ink dark:border-gray-600 pb-3">
                <span className="text-ink-gray dark:text-gray-300 font-body">止损价格：</span>
                <span className="font-data text-lg text-seal-red font-medium">{analysis.aiRecommendation.stopLoss}</span>
              </div>
              <div className="flex items-center space-x-3 border-b border-border-ink dark:border-gray-600 pb-3">
                <span className="text-ink-gray dark:text-gray-300 font-body">止盈价格：</span>
                <span className="font-data text-lg text-bamboo font-medium">{analysis.aiRecommendation.takeProfit}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-ink-gray dark:text-gray-300 font-body">预期收益：</span>
                <span className="font-data text-lg text-bamboo font-medium">{analysis.aiRecommendation.expectedReturn}</span>
              </div>
            </div>

            {/* 风险提示 */}
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-sm">
              <div className="text-ink-gray dark:text-gray-300 font-body text-sm">
                <span className="font-medium">⚠️ 风险提示：</span>
                主要风险包括经济下行导致消费降级、行业政策变化、股价已有一定涨幅等。建议密切关注市场变化。
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card-chinese">
          <div className="text-ink-gray dark:text-gray-300 font-body mb-2">市盈率 (PE)</div>
          <div className="font-data text-3xl text-ink-black dark:text-white font-bold">
            {stock.pe.toFixed(1)}
          </div>
        </div>
        <div className="card-chinese">
          <div className="text-ink-gray dark:text-gray-300 font-body mb-2">市净率 (PB)</div>
          <div className="font-data text-3xl text-ink-black dark:text-white font-bold">
            {stock.pb.toFixed(1)}
          </div>
        </div>
        <div className="card-chinese">
          <div className="text-ink-gray dark:text-gray-300 font-body mb-2">总市值</div>
          <div className="font-data text-3xl text-ink-black dark:text-white font-bold">
            {stock.marketCap}
          </div>
        </div>
        <div className="card-chinese">
          <div className="text-ink-gray dark:text-gray-300 font-body mb-2">换手率</div>
          <div className="font-data text-3xl text-ink-black dark:text-white font-bold">
            {stock.turnover}
          </div>
        </div>
      </div>

      {/* 详细指标 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 价格统计 */}
        <div className="card-chinese">
          <h3 className="font-title text-xl text-ink-black dark:text-white mb-4">
            价格统计
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border-ink dark:border-gray-600 pb-3">
              <span className="text-ink-gray dark:text-gray-300 font-body">52周最高</span>
              <span className="font-data text-lg text-ink-black dark:text-white font-medium">
                ¥{stock.high52.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border-ink dark:border-gray-600 pb-3">
              <span className="text-ink-gray dark:text-gray-300 font-body">52周最低</span>
              <span className="font-data text-lg text-ink-black dark:text-white font-medium">
                ¥{stock.low52.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-gray dark:text-gray-300 font-body">当前价格</span>
              <span className="font-data text-lg text-ink-black dark:text-white font-medium">
                ¥{stock.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 股息信息 */}
        <div className="card-chinese">
          <h3 className="font-title text-xl text-ink-black dark:text-white mb-4">
            股息信息
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border-ink dark:border-gray-600 pb-3">
              <span className="text-ink-gray dark:text-gray-300 font-body">年度股息</span>
              <span className="font-data text-lg text-ink-black dark:text-white font-medium">
                ¥{stock.dividend.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border-ink dark:border-gray-600 pb-3">
              <span className="text-ink-gray dark:text-gray-300 font-body">股息率</span>
              <span className="font-data text-lg text-ink-black dark:text-white font-medium">
                {stock.dividendYield.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-gray dark:text-gray-300 font-body">股息支付率</span>
              <span className="font-data text-lg text-ink-black dark:text-white font-medium">
                {((stock.dividend / stock.price) * 100 * stock.pe).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 交易信息 */}
      <div className="card-chinese mb-6">
        <h3 className="font-title text-xl text-ink-black dark:text-white mb-4">
          交易信息
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-ink-gray dark:text-gray-300 font-body mb-2">成交量</div>
            <div className="font-data text-xl text-ink-black dark:text-white font-medium">
              {stock.volume}
            </div>
          </div>
          <div>
            <div className="text-ink-gray dark:text-gray-300 font-body mb-2">成交额</div>
            <div className="font-data text-xl text-ink-black dark:text-white font-medium">
              {stock.turnover}
            </div>
          </div>
          <div>
            <div className="text-ink-gray dark:text-gray-300 font-body mb-2">行业</div>
            <div className="font-data text-xl text-ink-black dark:text-white font-medium">
              {stock.industry}
            </div>
          </div>
          <div>
            <div className="text-ink-gray dark:text-gray-300 font-body mb-2">概念标签</div>
            <div className="font-data text-xl text-ink-black dark:text-white font-medium">
              {stock.concept.length} 个
            </div>
          </div>
        </div>
      </div>

      {/* DCBAEF六维度分析 */}
      <div className="mb-6">
        <h2 className="font-title text-2xl text-ink-black dark:text-white mb-4">
          DCBAEF六维度深度分析
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* D - 宏观与事件 */}
          <DimensionCard
            letter="D"
            title="宏观与事件分析"
            data={analysis.dimensions.macro}
          />

          {/* C - 行业数据 */}
          <DimensionCard
            letter="C"
            title="行业数据分析"
            data={analysis.dimensions.industry}
          />

          {/* B - 财务数据 */}
          <DimensionCard
            letter="B"
            title="财务数据分析"
            data={analysis.dimensions.financial}
          />

          {/* A - 技术分析 */}
          <DimensionCard
            letter="A"
            title="技术分析"
            data={analysis.dimensions.technical}
          />

          {/* E - 情绪面 */}
          <DimensionCard
            letter="E"
            title="情绪面分析"
            data={analysis.dimensions.sentiment}
          />

          {/* F - 资金面 */}
          <DimensionCard
            letter="F"
            title="资金面分析"
            data={analysis.dimensions.capital}
          />
        </div>
      </div>

      {/* 展开全部/收起全部按钮 */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setExpandedDimension(expandedDimension === null ? 'D' : null)}
          className="px-6 py-3 border border-bamboo text-bamboo rounded-sm hover:bg-bamboo hover:text-white transition-colors font-body"
        >
          {expandedDimension === null ? '展开全部维度 ▼' : '收起全部维度 ▲'}
        </button>
      </div>

      {/* 查看完整报告按钮 */}
      <div className="mb-6 flex justify-center">
        <Link
          to={`/stocks/${id}/report`}
          className="inline-block px-8 py-4 bg-gradient-to-r from-bamboo to-bamboo-light text-white rounded-sm hover:shadow-lg transition-all font-body text-lg"
        >
          📄 查看完整AI推荐报告 →
        </Link>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-4">
        <button className="px-6 py-3 bg-bamboo text-white rounded-sm hover:bg-bamboo-light transition-colors font-body">
          加入自选
        </button>
        <button className="px-6 py-3 border border-bamboo text-bamboo rounded-sm hover:bg-bamboo hover:text-white transition-colors font-body">
          设置预警
        </button>
        <button className="px-6 py-3 border border-border-ink dark:border-gray-600 text-ink-gray dark:text-gray-300 rounded-sm hover:bg-paper-light dark:hover:bg-gray-700 transition-colors font-body">
          导出数据
        </button>
      </div>
    </div>
  );
};

export default StockDetail;
