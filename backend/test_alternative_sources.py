"""
测试不同的历史数据源，找到可用的替代方案
"""
import akshare as ak
import pandas as pd
from datetime import datetime, timedelta

# 禁用代理
import os
for key in ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']:
    if key in os.environ:
        del os.environ[key]

print("=" * 80)
print("测试不同的历史数据源")
print("=" * 80)
print()

# 测试参数
code = '600519'  # 贵州茅台
end_date = datetime.now().strftime('%Y%m%d')
start_date = (datetime.now() - timedelta(days=10)).strftime('%Y%m%d')

tests = [
    {
        'name': 'stock_zh_a_hist (东财历史)',
        'func': lambda: ak.stock_zh_a_hist(symbol=code, period='daily', start_date=start_date, end_date=end_date, adjust='qfq'),
        'desc': '标准历史K线接口'
    },
    {
        'name': 'stock_zh_a_spot_em (东财实时)',
        'func': lambda: ak.stock_zh_a_spot_em(),
        'desc': '实时行情接口（可能受代理影响）'
    },
]

for i, test in enumerate(tests, 1):
    print(f"测试 {i}: {test['name']}")
    print(f"描述: {test['desc']}")
    try:
        df = test['func']()
        if df is not None and not df.empty:
            print(f"✅ 成功! 获取 {len(df)} 条数据")
            print(f"   列名: {list(df.columns)[:5]}...")
            if len(df) > 0:
                print(f"   最新一行: {df.iloc[-1].to_dict()}")
        else:
            print(f"⚠️  返回空数据")
    except Exception as e:
        print(f"❌ 失败: {type(e).__name__}: {str(e)[:100]}")
    print()

print("=" * 80)
print("结论和建议")
print("=" * 80)
print("""
问题分析：
1. stock_zh_a_hist() 调用 push2his.eastmoney.com
2. 该服务器对某些IP/网络环境有访问限制
3. 即使禁用代理仍然被拒绝连接

可能的原因：
- IP地理位置限制
- eastmoney.com反爬虫机制
- 需要特定的Cookie/Session
- 临时服务器问题

解决方案：
1. 方案A: 使用本地缓存 + 定时任务（数据稳定后缓存起来）
2. 方案B: 寻找其他数据源（如tushare、baostock等）
3. 方案C: 部署到有更好网络环境的服务器
4. 方案D: 暂时只实现股票列表功能，历史数据作为TODO

当前建议：方案A + 方案D的组合
- 股票列表API ✅ 已可用
- 个股详情/历史K线 → 标记为待办，使用备用数据源
""")
