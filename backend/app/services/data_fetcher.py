"""
数据获取服务 - 封装akshare接口（改进版）

特性：
- 多数据源降级策略
- 重试机制
- 内存缓存
- 完善的错误处理和日志记录
- 自动禁用代理（避免连接问题）

数据源优先级：
1. baostock - 稳定免费的数据源（历史K线、实时行情）
2. akshare - 备用数据源（股票列表、个股信息）
"""
import akshare as ak
import baostock as bs
import pandas as pd
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from urllib.parse import urlparse
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
import time
import os
import random

import threading
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import StockQuote

logger = logging.getLogger(__name__)

# ========== User Agent 池 ==========
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
]

# ========== Monkey Patch requests ==========
# 自动为所有requests请求添加随机User-Agent，模拟真实浏览器，防止被封禁
def patch_requests_user_agent():
    original_request = requests.Session.request
    original_init = requests.Session.__init__
    host_lock = threading.Lock()
    host_last_ts: Dict[str, float] = {}
    host_intervals: Dict[str, float] = {
        "eastmoney.com": 1.0,
        "sina.com.cn": 0.8,
        "baostock.com": 0.0
    }
    def patched_init(self, *args, **kwargs):
        original_init(self, *args, **kwargs)
        retry = Retry(total=3, connect=3, read=3, status=3, backoff_factor=0.5, status_forcelist=[429, 500, 502, 503, 504], raise_on_status=False)
        adapter = HTTPAdapter(max_retries=retry, pool_connections=64, pool_maxsize=64)
        self.mount("http://", adapter)
        self.mount("https://", adapter)
        try:
            self.trust_env = False
        except Exception:
            pass
    
    def patched_request(self, method, url, *args, **kwargs):
        headers = kwargs.get('headers', {})
        if not any(k.lower() == 'user-agent' for k in headers):
            headers['User-Agent'] = random.choice(USER_AGENTS)
            if 'eastmoney.com' in url:
                headers['Referer'] = 'https://quote.eastmoney.com/'
        if not any(k.lower() == 'accept' for k in headers):
            headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        if not any(k.lower() == 'accept-language' for k in headers):
            headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8'
        if not any(k.lower() == 'connection' for k in headers):
            headers['Connection'] = 'keep-alive'
        kwargs['headers'] = headers
        try:
            host = urlparse(url).netloc
            key = None
            for h, interval in host_intervals.items():
                if h in host:
                    key = h
                    min_interval = interval
                    break
            if key is None:
                min_interval = 0.5
                key = host or "default"
            with host_lock:
                last = host_last_ts.get(key, 0.0)
                now = time.time()
                diff = now - last
                if diff < min_interval:
                    time.sleep(min_interval - diff + random.random() * 0.05)
                host_last_ts[key] = time.time()
        except Exception:
            pass
        return original_request(self, method, url, *args, **kwargs)
    
    requests.Session.__init__ = patched_init
    requests.Session.request = patched_request
    logger.info("已启用随机User-Agent伪装")

# 应用Patch
patch_requests_user_agent()

# ========== 全局禁用代理 ==========
# akshare和baostock在代理环境下经常连接失败，直接禁用
for proxy_key in ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']:
    if proxy_key in os.environ:
        del os.environ[proxy_key]
        logger.info(f"已禁用代理: {proxy_key}")
# =================================


from contextlib import contextmanager

@contextmanager
def disable_proxy():
    """临时禁用代理的上下文管理器"""
    old_http_proxy = os.environ.get('HTTP_PROXY')
    old_https_proxy = os.environ.get('HTTPS_PROXY')
    old_http_proxy_lower = os.environ.get('http_proxy')
    old_https_proxy_lower = os.environ.get('https_proxy')

    # 删除所有代理环境变量
    for key in ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']:
        if key in os.environ:
            del os.environ[key]

    try:
        yield
    finally:
        # 恢复原来的代理设置
        if old_http_proxy is not None:
            os.environ['HTTP_PROXY'] = old_http_proxy
        if old_https_proxy is not None:
            os.environ['HTTPS_PROXY'] = old_https_proxy
        if old_http_proxy_lower is not None:
            os.environ['http_proxy'] = old_http_proxy_lower
        if old_https_proxy_lower is not None:
            os.environ['https_proxy'] = old_https_proxy_lower


class SimpleCache:
    """简单的内存缓存"""

    def __init__(self, ttl: int = 300):  # 默认5分钟TTL
        self.cache = {}
        self.ttl = ttl

    def get(self, key: str):
        """获取缓存"""
        if key in self.cache:
            data, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                logger.debug(f"缓存命中: {key}")
                return data
            else:
                # 过期，删除
                del self.cache[key]
        return None

    def set(self, key: str, value):
        """设置缓存"""
        self.cache[key] = (value, time.time())
        logger.debug(f"缓存设置: {key}")

    def clear(self):
        """清空缓存"""
        self.cache.clear()
        logger.info("缓存已清空")


class DataFetcher:
    """数据获取服务 - 封装akshare和baostock接口（改进版）"""

    def __init__(self, timeout: int = 30, cache_ttl: int = 300):
        self.timeout = timeout
        self.cache = SimpleCache(ttl=cache_ttl)
        self.max_retries = 3
        self.bs_logged_in = False
        self.em_circuit_until = 0.0
        self.sina_circuit_until = 0.0
        self.em_fail = 0
        self.sina_fail = 0
        self.ak_circuit_until = 0.0
        self.ak_fail = 0
        self.ak_sema = threading.Semaphore(10)
        
        # 线程锁：baostock接口不是线程安全的，并发调用会导致数据错乱或socket错误
        self.bs_lock = threading.Lock()

        # 全市场行情缓存（stock_zh_a_spot的缓存）
        self.stock_spot_cache = {}
        self.spot_cache_time = None
        self.spot_cache_ttl = 300  # 全市场缓存5分钟 (因为获取一次需要40s+)

        # 登录baostock
        self._login_baostock()

    def _login_baostock(self):
        """登录baostock"""
        with self.bs_lock:
            try:
                lg = bs.login()
                if lg.error_code == '0':
                    self.bs_logged_in = True
                    logger.info("✅ baostock登录成功")
                else:
                    self.bs_logged_in = False
                    logger.warning(f"⚠️ baostock登录失败: {lg.error_msg}")
            except Exception as e:
                self.bs_logged_in = False
                logger.warning(f"⚠️ baostock初始化失败: {e}")

    def __del__(self):
        """析构函数，登出baostock"""
        if self.bs_logged_in:
            try:
                with self.bs_lock:
                    bs.logout()
                    logger.info("baostock已登出")
            except:
                pass

    # ==================== 股票列表 ====================

    def get_stock_list(self) -> List[Dict]:
        """
        获取A股股票列表（带缓存和重试）

        Returns:
            股票列表，每只股票包含：code, name, industry, market
        """
        cache_key = "stock_list"

        # 尝试从缓存获取
        cached = self.cache.get(cache_key)
        if cached:
            return cached

        # 从API获取
        for attempt in range(self.max_retries):
            try:
                logger.info(f"获取股票列表（尝试 {attempt + 1}/{self.max_retries}）")
                with disable_proxy():
                    df = ak.stock_info_a_code_name()

                # 转换为标准格式
                stocks = []
                for _, row in df.iterrows():
                    stocks.append({
                        'code': row['code'],
                        'name': row['name'],
                        'industry': '未知',
                        'market': self._get_market_type(row['code'])
                    })

                logger.info(f"✅ 成功获取 {len(stocks)} 只股票")

                # 存入缓存
                self.cache.set(cache_key, stocks)
                return stocks

            except Exception as e:
                logger.warning(f"获取股票列表失败（尝试 {attempt + 1}/{self.max_retries}）: {e}")
                if attempt < self.max_retries - 1:
                    time.sleep(2 ** attempt)  # 指数退避
                else:
                    logger.error(f"获取股票列表最终失败: {e}")
                    return []

    # ==================== 股票行情（多数据源降级） ====================

    def _refresh_spot_cache(self) -> bool:
        """
        刷新全市场行情缓存（使用stock_zh_a_spot一次性获取所有股票）

        Returns:
            是否刷新成功
        """
        df = None
        last_error = None
        
        for attempt in range(3):
            try:
                logger.info(f"刷新全市场行情缓存... (尝试 {attempt+1}/3)")
                with disable_proxy():
                    use_em = time.time() >= self.em_circuit_until
                    use_sina = time.time() >= self.sina_circuit_until
                    if use_em:
                        try:
                            df = ak.stock_zh_a_spot_em()
                        except Exception as e_em:
                            self.em_fail += 1
                            if "decode value starting with character '<'" in str(e_em) or "RemoteDisconnected" in str(e_em):
                                if self.em_fail >= 2:
                                    self.em_circuit_until = time.time() + 600
                            logger.warning(f"stock_zh_a_spot_em 失败: {e_em}，尝试旧接口")
                    if df is None and use_sina:
                        try:
                            df = ak.stock_zh_a_spot()
                        except Exception as e_sina:
                            self.sina_fail += 1
                            if "decode value starting with character '<'" in str(e_sina) or "RemoteDisconnected" in str(e_sina):
                                if self.sina_fail >= 2:
                                    self.sina_circuit_until = time.time() + 600
                            logger.warning(f"stock_zh_a_spot (sina) 失败: {e_sina}")
                            raise e_sina

                        # 重命名列以匹配后续逻辑
                        rename_map = {
                            'code': '代码',
                            'name': '名称',
                            'trade': '最新价',
                            'changepercent': '涨跌幅',
                            'open': '今开',
                            'high': '最高',
                            'low': '最低',
                            'volume': '成交量',
                            'amount': '成交额'
                        }
                        df = df.rename(columns=rename_map)
                        # 确保有时间戳
                        if '时间戳' not in df.columns:
                            df['时间戳'] = str(datetime.now())
                
                if df is not None and not df.empty:
                    break
            except Exception as e:
                last_error = e
                logger.warning(f"刷新全市场行情缓存失败 (尝试 {attempt+1}/3): {e}")
                time.sleep(1.5 + attempt * 1.0 + random.random() * 0.3)

        if df is None or df.empty:
            logger.error(f"全市场行情数据获取失败，最终错误: {last_error}")
            # 关键修复：即使失败也更新时间戳，防止后续每个请求都重复尝试刷新，导致死循环和被封禁
            # 设置较短的TTL（例如60秒），稍后再试
            self.spot_cache_time = time.time()
            return False

        try:
            # 转换为字典 {code: {data}}
            self.stock_spot_cache = {}
            for _, row in df.iterrows():
                self.stock_spot_cache[row['代码']] = {
                    'code': row['代码'],
                    'name': row['名称'],
                    'price': float(row['最新价']),
                    'change': float(row['涨跌幅']),
                    'open': float(row['今开']),
                    'high': float(row['最高']),
                    'low': float(row['最低']),
                    'volume': int(row['成交量']),
                    'amount': float(row['成交额']),
                    'date': str(row['时间戳'])
                }

            self.spot_cache_time = time.time()
            logger.info(f"✅ 全市场行情缓存已更新，共 {len(self.stock_spot_cache)} 只股票")
            
            # 异步批量保存到数据库，防止阻塞
            threading.Thread(target=self._batch_save_to_db, args=(df,), daemon=True).start()
            
            return True

        except Exception as e:
            logger.error(f"解析全市场行情数据失败: {e}")
            return False

    def _batch_save_to_db(self, df):
        """批量保存行情到数据库"""
        try:
            logger.info("开始批量保存行情到数据库...")
            db = SessionLocal()
            try:
                # 为了性能，这里使用粗暴的删除后插入，或者upsert
                # 考虑到SQLite的并发性，我们尽量使用事务
                # 注意：这里假设df列名已经是中文
                
                # 获取现有所有股票代码
                # existing_codes = set(code for code, in db.query(StockQuote.stock_code).all())
                
                # 逐条更新太慢，使用bulk_save_objects或直接执行SQL
                # 这里简单起见，遍历更新，但每100条commit一次
                
                count = 0
                for _, row in df.iterrows():
                    code = row['代码']
                    quote = db.query(StockQuote).filter(StockQuote.stock_code == code).first()
                    if not quote:
                        quote = StockQuote(stock_code=code)
                        db.add(quote)
                    
                    quote.price = float(row['最新价'])
                    quote.change_percent = float(row['涨跌幅'])
                    quote.volume = str(row['成交量'])
                    quote.turnover = str(row['成交额'])
                    # 全市场接口通常没有PE/PB
                    
                    quote.timestamp = datetime.now()
                    
                    count += 1
                    if count % 100 == 0:
                        db.commit()
                
                db.commit()
                logger.info(f"✅ 批量保存完成，共更新 {count} 条记录")
                
            except Exception as e:
                db.rollback()
                logger.error(f"批量保存数据库失败: {e}")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"批量保存线程异常: {e}")

    def get_stock_quote(self, code: str) -> Optional[Dict]:
        """
        获取单只股票行情（优化版：优先使用全市场缓存 -> 数据库 -> 实时API）

        优先级:
        1. 全市场内存缓存 (stock_zh_a_spot)
        2. 数据库缓存 (StockQuote表, 30分钟内有效)
        3. 单股缓存 (内存)
        4. 历史数据降级 (实时API)

        Args:
            code: 股票代码（如 '600519'）

        Returns:
            股票行情数据
        """
        # 1. 检查全市场缓存是否需要刷新
        current_time = time.time()
        if (self.spot_cache_time is None or
            current_time - self.spot_cache_time > self.spot_cache_ttl):
            # 需要刷新缓存
            if not self.stock_spot_cache:
                # 第一次使用，主动刷新
                self._refresh_spot_cache()
            elif current_time - self.spot_cache_time > self.spot_cache_ttl:
                # 缓存过期，后台刷新（不阻塞当前请求）
                import threading
                threading.Thread(target=self._refresh_spot_cache, daemon=True).start()

        # 2. 优先从全市场缓存中查找
        if code in self.stock_spot_cache:
            return self.stock_spot_cache[code]

        # 3. 尝试从数据库获取缓存
        try:
            db = SessionLocal()
            try:
                db_quote = db.query(StockQuote).filter(StockQuote.stock_code == code).first()
                if db_quote:
                    # 检查是否过期 (例如30分钟)
                    time_diff = datetime.now() - db_quote.timestamp
                    if time_diff.total_seconds() < 1800: # 30分钟
                        logger.debug(f"从数据库获取股票 {code} 行情缓存")
                        return {
                            'code': db_quote.stock_code,
                            'name': self._get_stock_name(code), # 假设名称变化不大
                            'price': db_quote.price,
                            'change': db_quote.change_percent,
                            'volume': db_quote.volume,
                            'amount': db_quote.turnover,
                            'pe': db_quote.pe,
                            'pb': db_quote.pb,
                            'market_cap': db_quote.market_cap,
                            'date': db_quote.timestamp.strftime("%Y-%m-%d"),
                            'is_realtime': False,
                            'delay': '30分钟内',
                            'timestamp': db_quote.timestamp.isoformat()
                        }
            finally:
                db.close()
        except Exception as e:
            logger.error(f"读取数据库缓存失败: {e}")

        # 4. 单股内存缓存
        cache_key = f"quote_{code}"
        cached = self.cache.get(cache_key)
        if cached:
            logger.debug(f"从内存缓存获取股票 {code} 行情")
            return cached

        # 5. 降级方案：从历史数据获取 (API)
        logger.info(f"从API获取股票 {code} 行情")
        quote_data = self._get_quote_from_history(code)

        if quote_data:
            self.cache.set(cache_key, quote_data)
            # 同时也保存到数据库
            self._save_to_db(quote_data)

        return quote_data

    def get_stock_quote_latest(self, code: str) -> Optional[Dict]:
        """
        获取单只股票最新一天行情（简化版，用于筛选）

        与get_stock_quote的区别：
        - 不使用全市场缓存（避免预热5000+股票）
        - 只获取最新一天数据（不获取30天历史）
        - 直接使用baostock稳定接口

        Args:
            code: 股票代码（如 '600519'）

        Returns:
            股票行情数据
        """
        # 1. 先检查内存缓存
        cache_key = f"quote_{code}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached

        # 2. 直接获取最新一天数据（使用baostock）
        quote_data = self._get_quote_latest_day(code)

        if quote_data:
            self.cache.set(cache_key, quote_data)

        return quote_data
        
    def _save_to_db(self, data: Dict):
        """保存行情数据到数据库"""
        try:
            db = SessionLocal()
            try:
                code = data.get('code')
                if not code:
                    return
                    
                # 查找现有记录或创建新记录
                quote = db.query(StockQuote).filter(StockQuote.stock_code == code).first()
                if not quote:
                    quote = StockQuote(stock_code=code)
                    db.add(quote)
                
                # 更新字段
                quote.price = data.get('price', 0.0)
                quote.change_percent = data.get('change', 0.0)
                quote.volume = str(data.get('volume', '0'))
                quote.turnover = str(data.get('turnover', '0'))
                # PE/PB/MarketCap 可能在data中没有，需要检查
                if 'pe' in data: quote.pe = data.get('pe')
                if 'pb' in data: quote.pb = data.get('pb')
                if 'market_cap' in data: quote.market_cap = str(data.get('market_cap'))
                
                quote.timestamp = datetime.now()
                db.commit()
            except Exception as e:
                db.rollback()
                logger.error(f"保存股票 {data.get('code')} 到数据库失败: {e}")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"数据库连接失败: {e}")

    def _get_quote_from_history(self, code: str) -> Optional[Dict]:
        """
        从历史数据获取最新一天作为"实时"行情

        优先级:
        1. baostock（稳定免费）
        2. akshare（备用）

        优点: 接口100%可用，数据准确
        缺点: 有几分钟延迟（可接受）
        """
        # 优先使用baostock
        if self.bs_logged_in:
            quote_data = self._get_quote_from_baostock(code)
            if quote_data:
                return quote_data

        # 降级使用akshare
        return self._get_quote_from_akshare(code)

    def _get_quote_latest_day(self, code: str) -> Optional[Dict]:
        """
        只获取最新一天的行情数据（简化版，用于筛选）

        与_get_quote_from_baostock的区别：
        - 只获取一天数据（start_date = end_date）
        - 不获取30天历史，减少数据传输和处理
        - 不使用akshare降级（避免触发限流）

        Args:
            code: 股票代码

        Returns:
            股票行情数据
        """
        # 只使用baostock，不降级到akshare（避免并发触发限流）
        if self.bs_logged_in:
            return self._get_quote_one_day_baostock(code)

        return None

    def _get_quote_from_baostock(self, code: str) -> Optional[Dict]:
        """使用baostock获取最新行情"""
        # 加锁，防止多线程竞争
        with self.bs_lock:
            # 确保已登录
            if not self.bs_logged_in:
                try:
                    lg = bs.login()
                    if lg.error_code == '0':
                        self.bs_logged_in = True
                    else:
                        return None
                except:
                    return None
            
            try:
                # 转换股票代码格式 (600519 -> sh.600519)
                bs_code = self._convert_to_baostock_code(code)

                # 获取最近几天的数据 (处理跨年/节假日问题)
                current_date = datetime.now()
                end_date = current_date.strftime("%Y-%m-%d")
                start_date = (current_date - timedelta(days=30)).strftime("%Y-%m-%d")

                rs = bs.query_history_k_data_plus(
                    bs_code,
                    "date,code,open,high,low,close,preclose,volume,amount,pctChg",
                    start_date=start_date,
                    end_date=end_date,
                    frequency="d",
                    adjustflag="2"  # 2: 前复权
                )

                if rs.error_code != '0':
                    logger.warning(f"baostock查询失败: {rs.error_msg}")
                    # 如果是未登录错误，尝试重连
                    if "login" in str(rs.error_msg).lower():
                        bs.login() # 尝试重连
                    return None

                # 解析数据
                data_list = []
                while (rs.error_code == '0') & rs.next():
                    data_list.append(rs.get_row_data())

                # 如果当前年份数据为空，尝试查询更长时间范围
                if not data_list:
                    # logger.warning(f"baostock返回空数据: {code} ({start_date} - {end_date})")
                    return None
                    # logger.warning(f"baostock返回空数据: {code} ({start_date} - {end_date})")
                    return None


                # 获取最新一天
                try:
                    latest = data_list[-1]
                except IndexError:
                    logger.warning(f"baostock数据列表为空: {code}")
                    return None

                return {
                    'code': code,
                    'name': self._get_stock_name(code),
                    'price': float(latest[5]) if latest[5] else 0.0,  # close
                    'change': float(latest[9]) if latest[9] else 0.0,  # pctChg
                    'open': float(latest[3]) if latest[3] else 0.0,    # open
                    'high': float(latest[4]) if latest[4] else 0.0,    # high
                    'low': float(latest[2]) if latest[2] else 0.0,     # low
                    'volume': self._format_volume(int(latest[7]) if latest[7] else 0),  # volume
                    'turnover': self._format_turnover(float(latest[8]) if latest[8] else 0.0),  # amount
                    'date': latest[0],  # date
                    'is_realtime': False,
                    'delay': '1天',
                    'timestamp': datetime.now().isoformat()
                }

            except Exception as e:
                logger.warning(f"baostock获取行情失败: {e}")
                return None

    def _get_quote_from_akshare(self, code: str) -> Optional[Dict]:
        """使用akshare获取最新行情（备用）"""
        try:
            if time.time() < self.ak_circuit_until:
                return None
            now = datetime.now()
            if now.year > 2025:
                end_date = "20251231"
                start_date = "20251130"
            else:
                end_date = now.strftime("%Y%m%d")
                start_date = (now - timedelta(days=5)).strftime("%Y%m%d")

            df = None
            last_error = None
            
            with disable_proxy():
                for attempt in range(3):
                    try:
                        self.ak_sema.acquire()
                        df = ak.stock_zh_a_hist(
                            symbol=code,
                            period="daily",
                            start_date=start_date,
                            end_date=end_date,
                            adjust="qfq"
                        )
                        break
                    except Exception as e:
                        last_error = e
                        logger.warning(f"akshare获取股票 {code} 行情失败 (尝试 {attempt+1}/3): {e}")
                        if "RemoteDisconnected" in str(e) or "decode value starting with character '<'" in str(e):
                            self.ak_fail += 1
                            if self.ak_fail >= 2:
                                self.ak_circuit_until = time.time() + 600
                        if attempt < 2:
                            # 增加随机等待时间，避免并发请求被封禁
                            sleep_time = (2 + attempt * 2) + random.random()
                            time.sleep(sleep_time)
                    finally:
                        try:
                            self.ak_sema.release()
                        except Exception:
                            pass
            
            if df is None:
                if last_error:
                    # 记录详细错误但不抛出，避免中断整个筛选流程
                    logger.error(f"akshare获取股票 {code} 最终失败: {last_error}")
                return None

            if df.empty:
                logger.warning(f"akshare股票 {code} 历史数据为空")
                return None

            # 获取最新一天
            latest = df.iloc[-1]

            return {
                'code': code,
                'name': self._get_stock_name(code),
                'price': float(latest['收盘']),
                'change': float(latest['涨跌幅']),
                'open': float(latest['开盘']),
                'high': float(latest['最高']),
                'low': float(latest['最低']),
                'volume': self._format_volume(latest['成交量']),
                'turnover': self._format_turnover(latest['成交额']),
                'date': str(latest['日期']),
                'is_realtime': False,
                'delay': '几分钟',
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"akshare获取股票 {code} 行情失败: {e}")
            return None

    def _get_quote_one_day_baostock(self, code: str) -> Optional[Dict]:
        """
        使用baostock只获取最新一天的行情（简化版）

        与_get_quote_from_baostock的区别：
        - start_date = end_date = 最近交易日（只获取一天）
        - 减少数据传输和处理时间
        """
        # 加锁，防止多线程竞争
        with self.bs_lock:
            # 确保已登录
            if not self.bs_logged_in:
                try:
                    lg = bs.login()
                    if lg.error_code == '0':
                        self.bs_logged_in = True
                    else:
                        return None
                except:
                    return None

            try:
                # 转换股票代码格式 (600519 -> sh.600519)
                bs_code = self._convert_to_baostock_code(code)

                # 只获取最近一天的数据
                # 使用昨天的日期
                current_date = datetime.now()
                query_date = (current_date - timedelta(days=1)).strftime("%Y-%m-%d")

                rs = bs.query_history_k_data_plus(
                    bs_code,
                    "date,code,open,high,low,close,preclose,volume,amount,pctChg",
                    start_date=query_date,
                    end_date=query_date,
                    frequency="d",
                    adjustflag="2"  # 2: 前复权
                )

                if rs.error_code != '0':
                    logger.warning(f"baostock查询失败 {code}: {rs.error_msg}")
                    return None

                # 解析数据
                data_list = []
                while (rs.error_code == '0') & rs.next():
                    data_list.append(rs.get_row_data())

                if not data_list:
                    # 如果一天没数据，尝试获取最近5天（可能节假日）
                    end_date = (current_date - timedelta(days=1)).strftime("%Y-%m-%d")
                    start_date = (current_date - timedelta(days=6)).strftime("%Y-%m-%d")

                    rs = bs.query_history_k_data_plus(
                        bs_code,
                        "date,code,open,high,low,close,preclose,volume,amount,pctChg",
                        start_date=start_date,
                        end_date=end_date,
                        frequency="d",
                        adjustflag="2"
                    )

                    while (rs.error_code == '0') & rs.next():
                        data_list.append(rs.get_row_data())

                    if not data_list:
                        return None

                # 获取最新一天
                latest = data_list[-1]

                return {
                    'code': code,
                    'name': self._get_stock_name(code),
                    'price': float(latest[5]) if latest[5] else 0.0,  # close
                    'change': float(latest[9]) if latest[9] else 0.0,  # pctChg
                    'open': float(latest[3]) if latest[3] else 0.0,    # open
                    'high': float(latest[4]) if latest[4] else 0.0,    # high
                    'low': float(latest[2]) if latest[2] else 0.0,     # low
                    'volume': self._format_volume(int(latest[7]) if latest[7] else 0),  # volume
                    'turnover': self._format_turnover(float(latest[8]) if latest[8] else 0.0),  # amount
                    'date': latest[0],  # date
                    'is_realtime': False,
                    'delay': '1天',
                    'timestamp': datetime.now().isoformat()
                }

            except Exception as e:
                logger.warning(f"baostock获取一天行情失败 {code}: {e}")
                return None

    def _get_quote_one_day_akshare(self, code: str) -> Optional[Dict]:
        """
        使用akshare只获取最新一天的行情（简化版）

        与_get_quote_from_akshare的区别：
        - start_date = end_date = 最近交易日（只获取一天）
        - 减少数据传输和处理时间
        """
        try:
            if time.time() < self.ak_circuit_until:
                return None

            now = datetime.now()
            end_date = now.strftime("%Y%m%d")
            start_date = (now - timedelta(days=4)).strftime("%Y%m%d")

            df = None
            last_error = None

            with disable_proxy():
                for attempt in range(3):
                    try:
                        self.ak_sema.acquire()
                        df = ak.stock_zh_a_hist(
                            symbol=code,
                            period="daily",
                            start_date=start_date,
                            end_date=end_date,
                            adjust="qfq"
                        )
                        break
                    except Exception as e:
                        last_error = e
                        logger.warning(f"akshare获取股票 {code} 一天行情失败 (尝试 {attempt+1}/3): {e}")
                        if "RemoteDisconnected" in str(e) or "decode value starting with character '<'" in str(e):
                            self.ak_fail += 1
                            if self.ak_fail >= 2:
                                self.ak_circuit_until = time.time() + 600
                        if attempt < 2:
                            sleep_time = (1 + attempt * 1) + random.random()
                            time.sleep(sleep_time)
                    finally:
                        try:
                            self.ak_sema.release()
                        except Exception:
                            pass

            if df is None:
                return None

            if df.empty:
                return None

            # 获取最新一天
            latest = df.iloc[-1]

            return {
                'code': code,
                'name': self._get_stock_name(code),
                'price': float(latest['收盘']),
                'change': float(latest['涨跌幅']),
                'open': float(latest['开盘']),
                'high': float(latest['最高']),
                'low': float(latest['最低']),
                'volume': self._format_volume(latest['成交量']),
                'turnover': self._format_turnover(latest['成交额']),
                'date': str(latest['日期']),
                'is_realtime': False,
                'delay': '1天',
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"akshare获取股票 {code} 一天行情失败: {e}")
            return None

    def _convert_to_baostock_code(self, code: str) -> str:
        """
        转换股票代码为baostock格式

        Args:
            code: 股票代码（如 '600519'）

        Returns:
            baostock格式代码（如 'sh.600519'）
        """
        if code.startswith('6'):
            return f"sh.{code}"
        elif code.startswith('0') or code.startswith('3'):
            return f"sz.{code}"
        else:
            return code

    def _get_stock_name(self, code: str) -> str:
        """获取股票名称（从缓存或列表）"""
        # 从股票列表缓存获取
        stock_list = self.cache.get("stock_list")
        if stock_list:
            for stock in stock_list:
                if stock['code'] == code:
                    return stock['name']

        # 如果缓存没有，返回股票代码
        return code

    # ==================== 历史行情 ====================

    def get_stock_history(self, code: str, period: str = "daily",
                         start_date: str = None, end_date: str = None) -> pd.DataFrame:
        """
        获取股票历史行情（带缓存和重试）

        优先使用baostock，失败后使用akshare

        Args:
            code: 股票代码
            period: 周期 (daily, weekly, monthly)
            start_date: 开始日期 (YYYYMMDD)
            end_date: 结束日期 (YYYYMMDD)

        Returns:
            历史行情DataFrame
        """
        cache_key = f"history_{code}_{period}_{start_date}_{end_date}"

        # 尝试缓存
        cached = self.cache.get(cache_key)
        if cached is not None and not cached.empty:
            logger.info(f"从缓存获取股票 {code} 历史数据")
            return cached

        # 优先使用baostock
        if self.bs_logged_in:
            df = self._get_history_from_baostock(code, period, start_date, end_date, cache_key)
            if not df.empty:
                return df

        # 降级使用akshare
        return self._get_history_from_akshare(code, period, start_date, end_date, cache_key)

    def _get_history_from_baostock(self, code: str, period: str,
                                   start_date: str, end_date: str, cache_key: str) -> pd.DataFrame:
        """使用baostock获取历史数据"""
        try:
            # 转换日期格式 (YYYYMMDD -> YYYY-MM-DD)
            if end_date:
                end_date_bs = f"{end_date[:4]}-{end_date[4:6]}-{end_date[6:]}"
            else:
                end_date_bs = datetime.now().strftime("%Y-%m-%d")

            if start_date:
                start_date_bs = f"{start_date[:4]}-{start_date[4:6]}-{start_date[6:]}"
            else:
                start_date_bs = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")

            # 转换周期
            period_map = {"daily": "d", "weekly": "w", "monthly": "m"}
            frequency = period_map.get(period, "d")

            # 转换股票代码
            bs_code = self._convert_to_baostock_code(code)

            logger.info(f"使用baostock获取股票 {code} 历史数据")

            rs = bs.query_history_k_data_plus(
                bs_code,
                "date,code,open,high,low,close,preclose,volume,amount,pctChg,turn",
                start_date=start_date_bs,
                end_date=end_date_bs,
                frequency=frequency,
                adjustflag="2"  # 2: 前复权
            )

            if rs.error_code != '0':
                logger.warning(f"baostock查询失败: {rs.error_msg}")
                return pd.DataFrame()

            # 解析数据
            data_list = []
            while (rs.error_code == '0') & rs.next():
                data_list.append(rs.get_row_data())

            if not data_list:
                logger.warning(f"baostock返回空数据")
                return pd.DataFrame()

            # 转换为DataFrame
            df = pd.DataFrame(data_list, columns=[
                '日期', '代码', '开盘', '最高', '最低', '收盘', '前收盘',
                '成交量', '成交额', '涨跌幅', '换手率'
            ])

            # 转换数据类型
            df['开盘'] = df['开盘'].astype(float)
            df['最高'] = df['最高'].astype(float)
            df['最低'] = df['最低'].astype(float)
            df['收盘'] = df['收盘'].astype(float)
            df['前收盘'] = df['前收盘'].astype(float)
            df['成交量'] = df['成交量'].astype(int)
            df['成交额'] = df['成交额'].astype(float)
            df['涨跌幅'] = df['涨跌幅'].astype(float)
            df['换手率'] = df['换手率'].astype(float)

            # 计算涨跌额 = 收盘 - 前收盘
            df['涨跌额'] = df['收盘'] - df['前收盘']

            logger.info(f"✅ baostock成功获取股票 {code} 历史数据，共 {len(df)} 条")

            # 存入缓存
            self.cache.set(cache_key, df)
            return df

        except Exception as e:
            logger.warning(f"baostock获取历史数据失败: {e}")
            return pd.DataFrame()

    def _get_history_from_akshare(self, code: str, period: str,
                                  start_date: str, end_date: str, cache_key: str) -> pd.DataFrame:
        """使用akshare获取历史数据（备用）"""
        for attempt in range(self.max_retries):
            try:
                # 默认最近3个月
                if not end_date:
                    end_date = datetime.now().strftime("%Y%m%d")
                if not start_date:
                    start_date = (datetime.now() - timedelta(days=90)).strftime("%Y%m%d")

                logger.info(f"使用akshare获取股票 {code} 历史数据（{start_date} - {end_date}）")

                with disable_proxy():
                    df = ak.stock_zh_a_hist(
                        symbol=code,
                        period=period,
                        start_date=start_date,
                        end_date=end_date,
                        adjust="qfq"  # 前复权
                    )

                if df.empty:
                    logger.warning(f"akshare股票 {code} 历史数据为空")
                    return pd.DataFrame()

                logger.info(f"✅ akshare成功获取股票 {code} 历史数据，共 {len(df)} 条")

                # 存入缓存（历史数据缓存时间可以长一些）
                self.cache.set(cache_key, df)
                return df

            except Exception as e:
                logger.warning(f"akshare获取股票 {code} 历史数据失败（尝试 {attempt + 1}/{self.max_retries}）: {e}")
                if attempt < self.max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    logger.error(f"akshare获取股票 {code} 历史数据最终失败: {e}")
                    return pd.DataFrame()

    # ==================== 股票详细信息 ====================

    def get_stock_info(self, code: str) -> Optional[Dict]:
        """
        获取股票详细信息（暂时禁用，API超时）

        Args:
            code: 股票代码

        Returns:
            股票详细信息
        """
        # 暂时直接返回None，避免API超时
        logger.debug(f"股票 {code} 详细信息获取已禁用（API超时问题）")
        return None

    def get_stock_indicators(self, code: str) -> Optional[Dict]:
        """
        获取股票关键指标（PE、PB、市值等）

        Args:
            code: 股票代码

        Returns:
            包含PE、PB、市值等指标的字典
        """
        # 先获取股票详细信息
        info = self.get_stock_info(code)
        if not info:
            return None

        try:
            # 提取关键指标
            indicators = {}

            # 市盈率（动态）
            pe = info.get('市盈率-动态', '0')
            if pe and pe != '-':
                # 移除可能的单位和其他字符
                pe = str(pe).replace('--', '0').strip()
                try:
                    indicators['pe'] = float(pe)
                except ValueError:
                    indicators['pe'] = None
            else:
                indicators['pe'] = None

            # 市净率
            pb = info.get('市净率', '0')
            if pb and pb != '-':
                pb = str(pb).replace('--', '0').strip()
                try:
                    indicators['pb'] = float(pb)
                except ValueError:
                    indicators['pb'] = None
            else:
                indicators['pb'] = None

            # 总市值
            market_cap = info.get('总市值', '0')
            if market_cap and market_cap != '-':
                # 解析市值字符串（如 "25600.35亿"）
                market_cap = self._parse_market_cap_str(market_cap)
                indicators['market_cap'] = market_cap
                indicators['market_cap_str'] = self._format_market_cap(market_cap)
            else:
                indicators['market_cap'] = 0
                indicators['market_cap_str'] = '未知'

            # 流通市值
            float_cap = info.get('流通市值', '0')
            if float_cap and float_cap != '-':
                float_cap = self._parse_market_cap_str(float_cap)
                indicators['float_cap'] = float_cap
            else:
                indicators['float_cap'] = 0

            logger.debug(f"股票 {code} 指标: PE={indicators.get('pe')}, PB={indicators.get('pb')}, 市值={indicators.get('market_cap_str')}")

            return indicators

        except Exception as e:
            logger.warning(f"解析股票 {code} 指标失败: {e}")
            return None

    def _parse_market_cap_str(self, market_cap_str: str) -> float:
        """
        解析市值字符串为数值（亿元）

        Args:
            market_cap_str: 市值字符串（如 "25600.35亿", "2.56万亿"）

        Returns:
            市值数值（亿元）
        """
        if not market_cap_str or market_cap_str == '-':
            return 0

        market_cap_str = str(market_cap_str).strip()

        # 提取数字和单位
        import re
        match = re.search(r'([\d.]+)(\w*)', market_cap_str)
        if not match:
            return 0

        value = float(match.group(1))
        unit = match.group(2)

        # 转换单位
        if '万亿' in unit:
            return value * 10000  # 万亿 -> 亿
        elif '亿' in unit:
            return value  # 已经是亿
        elif '万' in unit:
            return value / 10000  # 万 -> 亿
        elif '亿' in market_cap_str:
            # 再次检查字符串中是否包含"亿"
            if '万亿' in market_cap_str:
                return value * 10000
            return value
        else:
            return value

    # ==================== 辅助方法 ====================

    def _get_market_type(self, code: str) -> str:
        """判断股票市场类型"""
        if code.startswith('6'):
            return '沪市主板'
        elif code.startswith('0'):
            return '深市主板'
        elif code.startswith('3'):
            return '创业板'
        elif code.startswith('688'):
            return '科创板'
        else:
            return '未知'

    def _format_volume(self, volume: float) -> str:
        """格式化成交量"""
        if pd.isna(volume):
            return "未知"
        volume = float(volume)
        if volume >= 100000000:
            return f"{volume / 100000000:.2f}亿手"
        elif volume >= 10000:
            return f"{volume / 10000:.2f}万手"
        else:
            return f"{volume}手"

    def _format_turnover(self, turnover: float) -> str:
        """格式化成交额"""
        if pd.isna(turnover):
            return "未知"
        turnover = float(turnover)
        if turnover >= 100000000:
            return f"{turnover / 100000000:.2f}亿"
        elif turnover >= 10000:
            return f"{turnover / 10000:.2f}万"
        else:
            return f"{turnover}"

    def _format_market_cap(self, market_cap: float) -> str:
        """格式化市值"""
        if pd.isna(market_cap):
            return "未知"
        market_cap = float(market_cap)
        if market_cap >= 1000000000000:
            return f"{market_cap / 1000000000000:.2f}万亿"
        elif market_cap >= 100000000:
            return f"{market_cap / 100000000:.2f}亿"
        else:
            return f"{market_cap / 10000:.2f}万"

    # ==================== PE/PB数据（从数据库） ====================

    def get_stock_pe_pb(self, code: str) -> Dict:
        """
        从数据库获取股票的PE/PB数据

        Args:
            code: 股票代码

        Returns:
            {pe: float or None, pb: float or None}
        """
        try:
            from app.database import SessionLocal
            from app.models import StockQuote

            db = SessionLocal()
            try:
                quote = db.query(StockQuote).filter(
                    StockQuote.stock_code == code
                ).order_by(StockQuote.timestamp.desc()).first()

                if quote and (quote.pe is not None or quote.pb is not None):
                    return {
                        'pe': float(quote.pe) if quote.pe is not None else None,
                        'pb': float(quote.pb) if quote.pb is not None else None
                    }
                else:
                    return {'pe': None, 'pb': None}
            finally:
                db.close()

        except Exception as e:
            logger.warning(f"从数据库获取股票 {code} PE/PB失败: {e}")
            return {'pe': None, 'pb': None}

    # ==================== 缓存管理 ====================

    def clear_cache(self):
        """清空所有缓存"""
        self.cache.clear()
        logger.info("所有缓存已清空")

    def get_cache_stats(self) -> Dict:
        """获取缓存统计信息"""
        return {
            'cache_size': len(self.cache.cache),
            'cache_keys': list(self.cache.cache.keys()),
            'ttl': self.cache.ttl
        }


# 创建全局实例
data_fetcher = DataFetcher()
