import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MountainBackground, Seal, Birds, Clouds, StarrySky, WaterReflection } from '../components/decorations/ChineseDecorations';
import DataService from '../services/dataService';
import API from '../services/api';

function Screening() {
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigatingRef = useRef(false);

  const [selectedStrategy, setSelectedStrategy] = useState('B');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 筛选状态
  const [isScreening, setIsScreening] = useState(false);
  const [screeningProgress, setScreeningProgress] = useState(0);
  const [screeningStatus, setScreeningStatus] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState(null); // 保存当前任务ID

  const [filterCriteria, setFilterCriteria] = useState({
    minMarketCap: 50,
    peMin: 10,
    peMax: 40,
    industry: '全部',
    changeType: 'all'
  });

  const strategies = [
    {
      id: 'A',
      name: '稳健型',
      description: '适合熊市',
      details: '严格筛选：PE 15-30，ROE >20%',
      result: '约50-80只股票',
      scenario: '市场环境不佳，追求防守',
      peMin: 15,
      peMax: 30
    },
    {
      id: 'B',
      name: '平衡型',
      description: '适合震荡市',
      badge: '推荐',
      details: '适中筛选：PE 10-40，ROE >15%',
      result: '约80-150只股票',
      scenario: '市场震荡，均衡配置',
      peMin: 10,
      peMax: 40
    },
    {
      id: 'C',
      name: '成长型',
      description: '适合牛市',
      details: '宽松筛选：PE 0-50，ROE >10%',
      result: '约150-250只股票',
      scenario: '市场向好，追求进攻',
      peMin: 0,
      peMax: 50
    }
  ];

  // ==================== 恢复任务功能 ====================
  useEffect(() => {
    checkAndRestoreTask();

    // 添加路由变化监听（离开页面时提示）
    const unlisten = navigate(location.pathname, { replace: true });

    return () => {
      // 组件卸载时检查是否有正在进行的任务
      handleBeforeUnload();
    };
  }, []);

  /**
   * 检查并恢复活动任务
   */
  const checkAndRestoreTask = async () => {
    try {
      // 1. 检查后端是否有活动任务
      const activeTaskResponse = await API.screening.getActiveTask();

      if (activeTaskResponse.active && activeTaskResponse.task) {
        const task = activeTaskResponse.task;

        // 2. 如果任务正在执行，恢复进度显示
        if (task.status === 'processing' || task.status === 'pending') {
          console.log('发现进行中的任务，正在恢复...', task);

          setCurrentTaskId(task.taskId);  // 使用驼峰格式 taskId
          setIsScreening(true);
          setScreeningProgress(task.progress || 0);
          setScreeningStatus(`恢复筛选进度... ${task.progress.toFixed(0)}%`);

          // 3. 继续轮询任务状态
          continuePollingTask(task.taskId);  // 使用驼峰格式 taskId

          // 4. 提示用户
          alert('检测到后台有正在进行的筛选任务，已自动恢复进度');
        }
      }
    } catch (error) {
      console.error('检查活动任务失败:', error);
    }
  };

  /**
   * 继续轮询任务状态
   */
  const continuePollingTask = async (taskId) => {
    try {
      const finalResult = await DataService.pollScreeningTask(
        taskId,
        (progress, status, taskStatus) => {
          setScreeningProgress(progress);
          setScreeningStatus(`正在筛选股票... ${progress.toFixed(0)}%`);
        },
        10000
      );

      // 任务完成
      const results = finalResult.results || [];
      console.log(`✅ 筛选完成，共 ${results.length} 只股票`);

      // 保存到sessionStorage并跳转
      sessionStorage.setItem('screeningResults', JSON.stringify(results));
      sessionStorage.setItem('currentFilter', JSON.stringify(finalResult.criteria || {}));

      // 清除taskId
      setCurrentTaskId(null);
      localStorage.removeItem('lastScreeningTaskId');

      navigate('/stocks');

    } catch (error) {
      console.error('任务执行失败:', error);
      alert(`筛选失败: ${error.message}`);
      setCurrentTaskId(null);
      setIsScreening(false);
    }
  };

  /**
   * 页面离开前的处理
   */
  const handleBeforeUnload = (event) => {
    // 如果有正在进行的任务，提示用户
    if (isScreening && currentTaskId && !isNavigatingRef.current) {
      // 注意：现代浏览器可能无法自定义提示信息
      const message = '筛选任务正在后台运行，确定要离开吗？';

      // 保存taskId到localStorage，以便返回时恢复
      localStorage.setItem('lastScreeningTaskId', currentTaskId);

      // 标记为正在导航，避免重复提示
      isNavigatingRef.current = true;

      // 对于浏览器刷新/关闭
      if (event) {
        event.returnValue = message;
        return message;
      }

      // 对于React Router导航，使用confirm
      const shouldLeave = window.confirm(message + '\n\n点击"确定"继续后台运行\n点击"取消"停留在当前页面');

      if (!shouldLeave) {
        isNavigatingRef.current = false;
      }

      return shouldLeave;
    }
  };

  // ==================== 筛选功能 ====================

  const handleStartScreening = async () => {
    const currentStrategy = strategies.find(s => s.id === selectedStrategy);
    if (!currentStrategy) return;

    const criteria = {
      strategy: currentStrategy.name,
      industry: filterCriteria.industry,
      peMin: currentStrategy.peMin,
      peMax: currentStrategy.peMax,
      pbMin: 0,
      pbMax: 10,
      marketCapMin: filterCriteria.minMarketCap,
      changeType: filterCriteria.changeType
    };

    setIsScreening(true);
    setScreeningProgress(0);
    setScreeningStatus('正在创建筛选任务...');

    try {
      // 1. 创建筛选任务
      const taskResponse = await DataService.screenStocksAsync(criteria);
      const taskId = taskResponse.taskId;

      console.log('✅ 筛选任务已创建:', taskId);

      // 2. 保存taskId到state和localStorage
      setCurrentTaskId(taskId);
      localStorage.setItem('lastScreeningTaskId', taskId);

      // 3. 开始轮询任务状态
      const finalResult = await DataService.pollScreeningTask(
        taskId,
        (progress, status, taskStatus) => {
          setScreeningProgress(progress);
          setScreeningStatus(`正在筛选股票... ${progress.toFixed(0)}%`);
          console.log(`进度: ${progress.toFixed(0)}%, 状态: ${status}`);
        },
        10000
      );

      // 4. 筛选完成
      const results = finalResult.results || [];
      console.log(`✅ 筛选完成，共 ${results.length} 只股票`);

      const avgChange = results.length > 0
        ? results.reduce((sum, stock) => sum + (stock.change || 0), 0) / results.length
        : 0;

      // 5. 保存筛选历史
      const historyRecord = {
        criteria: {
          strategy: currentStrategy.name,
          industry: criteria.industry,
          peRange: `${criteria.peMin}-${criteria.peMax}`,
          marketCap: `>${criteria.marketCapMin}亿`,
          changeRange: criteria.changeType === 'all' ? '全部' : criteria.changeType === 'up' ? '上涨' : '下跌'
        },
        results: results.slice(0, 10),
        resultCount: results.length,
        avgChange: avgChange,
        topStocks: results.slice(0, 3).map(s => s.name)
      };

      await DataService.saveScreeningHistory(historyRecord);

      // 6. 保存结果并跳转
      sessionStorage.setItem('screeningResults', JSON.stringify(results));
      sessionStorage.setItem('currentFilter', JSON.stringify(criteria));

      // 7. 清除taskId
      setCurrentTaskId(null);
      localStorage.removeItem('lastScreeningTaskId');

      navigate('/stocks');

    } catch (error) {
      console.error('筛选失败:', error);
      alert(`筛选失败: ${error.message}`);
    } finally {
      setIsScreening(false);
      setScreeningProgress(0);
      setScreeningStatus('');
      setCurrentTaskId(null);
    }
  };

  const updateCriteria = (key, value) => {
    setFilterCriteria(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      {/* 页面引言 */}
      <div className="text-center py-12 bg-paper rounded-sm border border-border-ink mb-8">
        <h1 className="font-title text-4xl mb-6 text-ink-black tracking-widest">
          漏斗选股
        </h1>
        <p className="font-title text-lg text-bamboo tracking-wider mb-4">
          抽丝剥茧寻良骥，沙里淘金得如意
        </p>
        <p className="font-body text-ink-gray dark:text-gray-300 max-w-2xl mx-auto">
          借助AI之力，从五千只股票中筛选出真正的优质标的<br />
          以价值投资为本，辅以技术分析，助您稳健投资
        </p>
      </div>

      {/* 壹 · 选择筛选策略 */}
      <section className="mb-8">
        <div className="font-title text-xl mb-6 pb-3 border-b border-border-ink">
          壹 · 选择筛选策略
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy.id)}
              className={`
                cursor-pointer p-6 bg-white dark:bg-gray-800 rounded-sm border-2 transition-all
                ${selectedStrategy === strategy.id
                  ? 'border-bamboo shadow-lg'
                  : 'border-transparent hover:border-bamboo-light'}
              `}
            >
              {strategy.badge && (
                <div className="mb-3">
                  <span className="px-2 py-1 bg-bamboo text-white text-xs rounded">
                    {strategy.badge}
                  </span>
                </div>
              )}
              <h3 className="font-title text-2xl mb-2 text-ink-black dark:text-white">
                {strategy.name}
              </h3>
              <p className="text-sm text-ink-gray dark:text-gray-400 mb-2">
                {strategy.description}
              </p>
              <p className="font-body text-sm text-ink-light dark:text-gray-300 mb-3">
                {strategy.details}
              </p>
              <p className="font-body text-xs text-bamboo">
                {strategy.result}
              </p>
              <p className="font-body text-xs text-ink-gray dark:text-gray-400 mt-2">
                适用：{strategy.scenario}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 贰 · 高级选项（可展开） */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-border-ink">
          <div className="font-title text-xl">
            贰 · 高级选项
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-bamboo hover:underline"
          >
            {showAdvanced ? '收起' : '展开'}
          </button>
        </div>

        {showAdvanced && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-sm border border-border-ink">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-body text-sm mb-2">行业筛选</label>
                <select
                  value={filterCriteria.industry}
                  onChange={(e) => updateCriteria('industry', e.target.value)}
                  className="w-full p-2 border border-border-ink rounded dark:bg-gray-700"
                >
                  <option>全部</option>
                  <option>金融</option>
                  <option>科技</option>
                  <option>消费</option>
                  <option>医药</option>
                </select>
              </div>

              <div>
                <label className="block font-body text-sm mb-2">涨跌幅</label>
                <select
                  value={filterCriteria.changeType}
                  onChange={(e) => updateCriteria('changeType', e.target.value)}
                  className="w-full p-2 border border-border-ink rounded dark:bg-gray-700"
                >
                  <option value="all">全部</option>
                  <option value="up">上涨</option>
                  <option value="down">下跌</option>
                </select>
              </div>

              <div>
                <label className="block font-body text-sm mb-2">最小市值（亿）</label>
                <input
                  type="number"
                  value={filterCriteria.minMarketCap}
                  onChange={(e) => updateCriteria('minMarketCap', parseFloat(e.target.value))}
                  className="w-full p-2 border border-border-ink rounded dark:bg-gray-700"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 叁 · 开始筛选按钮 */}
      <section className="mb-8">
        <div className="text-center">
          {isScreening ? (
            // 筛选进行中状态
            <div className="bg-white dark:bg-gray-800 p-8 rounded-sm border border-border-ink">
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-bamboo transition-all duration-300"
                    style={{ width: `${screeningProgress}%` }}
                  />
                </div>
              </div>
              <p className="font-title text-lg mb-2">
                {screeningStatus}
              </p>
              <p className="font-body text-sm text-ink-gray dark:text-gray-400">
                筛选任务在后台运行中，您可以离开此页面
              </p>
              <p className="font-body text-xs text-ink-light dark:text-gray-500 mt-2">
                返回时将自动恢复进度
              </p>
            </div>
          ) : (
            // 正常状态
            <button
              onClick={handleStartScreening}
              className="px-12 py-4 bg-bamboo text-white font-title text-xl rounded-sm
                       hover:bg-bamboo-dark transition-colors shadow-lg hover:shadow-xl"
            >
              开始筛选
            </button>
          )}
        </div>
      </section>

      {/* 装饰元素 */}
      <MountainBackground />
      <Birds />
      <Clouds />
      <WaterReflection />
    </div>
  );
}

export default Screening;
