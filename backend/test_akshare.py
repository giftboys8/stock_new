"""
akshare API 测试脚本
用于验证数据获取功能是否正常
"""
import sys
from datetime import datetime

def test_akshare():
    """测试akshare数据获取"""
    print("=" * 60)
    print("akshare API 测试")
    print("=" * 60)

    try:
        import akshare as ak
        print("✅ akshare 导入成功")
    except ImportError as e:
        print(f"❌ akshare 导入失败: {e}")
        print("请运行: pip install akshare")
        return False

    print(f"akshare 版本: {ak.__version__}")
    print()

    # 测试1: 获取股票列表
    print("-" * 60)
    print("测试1: 获取A股股票列表")
    print("-" * 60)
    try:
        df = ak.stock_info_a_code_name()
        print(f"✅ 成功获取 {len(df)} 只股票")
        print(f"前5只股票:")
        print(df.head())
        print()
    except Exception as e:
        print(f"❌ 获取股票列表失败: {e}")
        print()

    # 测试2: 获取实时行情(以贵州茅台为例)
    print("-" * 60)
    print("测试2: 获取实时行情 (600519 贵州茅台)")
    print("-" * 60)
    try:
        df = ak.stock_zh_a_spot_em()
        stock_data = df[df['代码'] == '600519']

        if not stock_data.empty:
            row = stock_data.iloc[0]
            print(f"✅ 成功获取行情数据")
            print(f"  股票名称: {row['名称']}")
            print(f"  最新价: {row['最新价']}")
            print(f"  涨跌幅: {row['涨跌幅']}%")
            print(f"  成交量: {row['成交量']}")
            print(f"  市盈率: {row.get('市盈率-动态', 'N/A')}")
            print(f"  市净率: {row.get('市净率', 'N/A')}")
            print(f"  总市值: {row['总市值']}")
        else:
            print("❌ 未找到股票600519的数据")
        print()
    except Exception as e:
        print(f"❌ 获取行情数据失败: {e}")
        print()

    # 测试3: 获取历史行情
    print("-" * 60)
    print("测试3: 获取历史行情 (600519)")
    print("-" * 60)
    try:
        from datetime import datetime, timedelta

        end_date = datetime.now().strftime("%Y%m%d")
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y%m%d")

        df = ak.stock_zh_a_hist(
            symbol="600519",
            period="daily",
            start_date=start_date,
            end_date=end_date,
            adjust="qfq"
        )

        print(f"✅ 成功获取 {len(df)} 条历史数据")
        print(f"最近5天数据:")
        print(df.tail().to_string())
        print()
    except Exception as e:
        print(f"❌ 获取历史数据失败: {e}")
        print()

    # 测试4: 获取财务数据
    print("-" * 60)
    print("测试4: 获取财务数据 (600519)")
    print("-" * 60)
    try:
        df = ak.stock_financial_analysis_indicator(symbol="600519")

        if not df.empty:
            latest = df.iloc[-1]
            print(f"✅ 成功获取财务数据")
            print(f"  ROE(净资产收益率): {latest.get('净资产收益率', 'N/A')}")
            print(f"  毛利率: {latest.get('销售毛利率', 'N/A')}")
            print(f"  资产负债率: {latest.get('资产负债率', 'N/A')}")
            print(f"  营业收入同比增长: {latest.get('营业总收入同比增长', 'N/A')}")
        else:
            print("❌ 未找到财务数据")
        print()
    except Exception as e:
        print(f"❌ 获取财务数据失败: {e}")
        print()

    # 测试5: 获取行业数据
    print("-" * 60)
    print("测试5: 获取行业板块数据")
    print("-" * 60)
    try:
        df = ak.stock_board_industry_name_em()
        print(f"✅ 成功获取 {len(df)} 个行业板块")
        print(f"前5个板块:")
        print(df.head())
        print()
    except Exception as e:
        print(f"❌ 获取行业数据失败: {e}")
        print()

    print("=" * 60)
    print("测试完成!")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = test_akshare()
    sys.exit(0 if success else 1)
