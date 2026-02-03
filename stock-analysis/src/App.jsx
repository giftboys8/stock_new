import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Screening from './pages/Screening';
import StockResults from './pages/StockResults';
import StockDetail from './pages/StockDetail';
import Report from './pages/Report';
import History from './pages/History';
import HistoryDetail from './pages/HistoryDetail';
import Watchlist from './pages/Watchlist';
import { MountainBackground, Birds, StarrySky, WaterReflection } from './components/decorations/ChineseDecorations';

function Navigation() {
  const location = useLocation();
  const { toggleTheme, isDark } = useTheme();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-paper/95 dark:bg-[#1a2835]/95 backdrop-blur-sm border-b border-border-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="font-title text-2xl text-bamboo hover:opacity-80 transition-opacity">
              📊 股票分析系统
            </Link>
          </div>

          {/* 导航菜单 */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-body transition-colors ${
                isActive('/')
                  ? 'text-ink-black dark:text-white'
                  : 'text-ink-gray dark:text-gray-300 hover:text-bamboo dark:hover:text-bamboo-light'
              }`}
            >
              首页
            </Link>
            <Link
              to="/stocks"
              className={`font-body transition-colors ${
                isActive('/stocks')
                  ? 'text-ink-black dark:text-white'
                  : 'text-ink-gray dark:text-gray-300 hover:text-bamboo dark:hover:text-bamboo-light'
              }`}
            >
              选股结果
            </Link>
            <Link
              to="/history"
              className={`font-body transition-colors ${
                isActive('/history')
                  ? 'text-ink-black dark:text-white'
                  : 'text-ink-gray dark:text-gray-300 hover:text-bamboo dark:hover:text-bamboo-light'
              }`}
            >
              历史记录
            </Link>
            <Link
              to="/watchlist"
              className={`font-body transition-colors ${
                isActive('/watchlist')
                  ? 'text-ink-black dark:text-white'
                  : 'text-ink-gray dark:text-gray-300 hover:text-bamboo dark:hover:text-bamboo-light'
              }`}
            >
              自选股
            </Link>
          </div>

          {/* 主题切换按钮 */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="px-4 py-2 border border-border-ink dark:border-gray-600 rounded-sm hover:bg-paper-light dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 bg-white dark:bg-[#2a3a4a]"
            >
              <span>{isDark ? '🌙 夜间' : '☀️ 日间'}</span>
            </button>
            <span className="text-ink-gray dark:text-gray-300 font-body">欢迎，客官</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen text-ink-black dark:text-white transition-colors duration-300 relative z-10">
      <Navigation />

      {/* 主内容区 */}
      <main className="page-enter">
        <Routes>
          <Route path="/" element={<Screening />} />
          <Route path="/stocks" element={<StockResults />} />
          <Route path="/stocks/:id" element={<StockDetail />} />
          <Route path="/stocks/:id/report" element={<Report />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<HistoryDetail />} />
          <Route path="/watchlist" element={<Watchlist />} />
        </Routes>
      </main>

      {/* 底部诗词 */}
      <footer className="text-center py-12 text-ink-light">
        <div className="font-title text-base space-y-2">
          <p>投资有风险，入市需谨慎</p>
          <p>本系统仅供参考，不构成投资建议</p>
        </div>
      </footer>

      {/* 装饰组件 */}
      <MountainBackground />
      <Birds />
      <StarrySky />
      <WaterReflection />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}

export default App;
