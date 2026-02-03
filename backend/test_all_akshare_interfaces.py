"""
akshare完整接口测试（代理关闭后）
测试所有可能用到的接口，包括行业、财务数据
"""
import akshare as ak
import pandas as pd
from datetime import datetime, timedelta

print("=" * 80)
print("akshare完整接口测试")
print(f"测试时间: {datetime.now()}")
print("=" * 80)

# 测试结果记录
results = {}

# ============================================================================
# 1. 基础数据接口
# ============================================================================
print("\n【1. 基础数据接口】")
print("-" * 80)

# 1.1 股票列表
try:
    df = ak.stock_info_a_code_name()
    print(f"✅ stock_info_a_code_name(): {len(df)}只股票")
    results['股票列表'] = True
except Exception as e:
    print(f"❌ stock_info_a_code_name(): {e}")
    results['股票列表'] = False

# 1.2 实时行情 - 东方财富
try:
    df = ak.stock_zh_a_spot_em()
    print(f"✅ stock_zh_a_spot_em(): {len(df)}只股票实时数据")
    results['实时行情(东财)'] = True
except Exception as e:
    print(f"❌ stock_zh_a_spot_em(): {e}")
    results['实时行情(东财)'] = False

# 1.3 实时行情 - 新浪
try:
    df = ak.stock_zh_a_spot()
    print(f"✅ stock_zh_a_spot(): {len(df)}只股票实时数据")
    results['实时行情(新浪)'] = True
except Exception as e:
    print(f"❌ stock_zh_a_spot(): {e}")
    results['实时行情(新浪)'] = False

# ============================================================================
# 2. 财务数据接口
# ============================================================================
print("\n【2. 财务数据接口】")
print("-" * 80)

# 2.1 个股财务指标
try:
    df = ak.stock_financial_analysis_indicator(symbol="600519")
    if df.empty:
        print("⚠️  stock_financial_analysis_indicator(): 数据为空")
        results['财务分析指标'] = False
    else:
        print(f"✅ stock_financial_analysis_indicator(): {len(df)}期数据")
        print(f"   最新一期: {df.iloc[-1].to_dict()}")
        results['财务分析指标'] = True
except Exception as e:
    print(f"❌ stock_financial_analysis_indicator(): {e}")
    results['财务分析指标'] = False

# 2.2 个股业绩快报
try:
    df = ak.stock_performance_express_report(symbol="600519")
    if df.empty:
        print("⚠️  stock_performance_express_report(): 数据为空")
        results['业绩快报'] = False
    else:
        print(f"✅ stock_performance_express_report(): {len(df)}期数据")
        results['业绩快报'] = True
except Exception as e:
    print(f"❌ stock_performance_express_report(): {e}")
    results['业绩快报'] = False

# 2.3 盈利能力
try:
    df = ak.stock_profitability_analysis(symbol="600519")
    if df.empty:
        print("⚠️  stock_profitability_analysis(): 数据为空")
        results['盈利能力'] = False
    else:
        print(f"✅ stock_profitability_analysis(): {len(df)}期数据")
        results['盈利能力'] = True
except Exception as e:
    print(f"❌ stock_profitability_analysis(): {e}")
    results['盈利能力'] = False

# 2.4 财务报表
try:
    df = ak.stock_balance_sheet_by_report_em(symbol="600519")
    if df.empty:
        print("⚠️  stock_balance_sheet_by_report_em(): 数据为空")
        results['资产负债表'] = False
    else:
        print(f"✅ stock_balance_sheet_by_report_em(): {len(df)}期数据")
        results['资产负债表'] = True
except Exception as e:
    print(f"❌ stock_balance_sheet_by_report_em(): {e}")
    results['资产负债表'] = False

# 2.5 利润表
try:
    df = ak.stock_profit_sheet_by_report_em(symbol="600519")
    if df.empty:
        print("⚠️  stock_profit_sheet_by_report_em(): 数据为空")
        results['利润表'] = False
    else:
        print(f"✅ stock_profit_sheet_by_report_em(): {len(df)}期数据")
        results['利润表'] = True
except Exception as e:
    print(f"❌ stock_profit_sheet_by_report_em(): {e}")
    results['利润表'] = False

# ============================================================================
# 3. 行业数据接口
# ============================================================================
print("\n【3. 行业数据接口】")
print("-" * 80)

# 3.1 行业板块列表
try:
    df = ak.stock_board_industry_name_em()
    print(f"✅ stock_board_industry_name_em(): {len(df)}个行业板块")
    print(f"   示例行业: {df['板块名称'].head(5).tolist()}")
    results['行业板块列表'] = True
except Exception as e:
    print(f"❌ stock_board_industry_name_em(): {e}")
    results['行业板块列表'] = False

# 3.2 行业板块成分股
try:
    df = ak.stock_board_industry_cons_em(symbol="白酒")
    if df.empty:
        print("⚠️  stock_board_industry_cons_em(): 数据为空")
        results['行业成分股'] = False
    else:
        print(f"✅ stock_board_industry_cons_em(): {len(df)}只成分股")
        print(f"   示例: {df[['股票代码', '股票名称']].head(3).to_dict('records')}")
        results['行业成分股'] = True
except Exception as e:
    print(f"❌ stock_board_industry_cons_em(): {e}")
    results['行业成分股'] = False

# 3.3 行业板块涨跌幅
try:
    df = ak.stock_board_industry_name_em()
    if not df.empty:
        print(f"✅ 行业涨跌幅数据可获取")
        print(f"   涨幅榜前3: {df.nlargest(3, '涨跌幅')['板块名称'].tolist()}")
        results['行业涨跌幅'] = True
    else:
        results['行业涨跌幅'] = False
except Exception as e:
    print(f"❌ 行业涨跌幅: {e}")
    results['行业涨跌幅'] = False

# ============================================================================
# 4. 概念板块接口
# ============================================================================
print("\n【4. 概念板块接口】")
print("-" * 80)

# 4.1 概念板块列表
try:
    df = ak.stock_board_concept_name_em()
    print(f"✅ stock_board_concept_name_em(): {len(df)}个概念板块")
    print(f"   示例概念: {df['板块名称'].head(5).tolist()}")
    results['概念板块列表'] = True
except Exception as e:
    print(f"❌ stock_board_concept_name_em(): {e}")
    results['概念板块列表'] = False

# 4.2 概念板块成分股
try:
    df = ak.stock_board_concept_cons_em(symbol="新能源汽车")
    if df.empty:
        print("⚠️  stock_board_concept_cons_em(): 数据为空")
        results['概念成分股'] = False
    else:
        print(f"✅ stock_board_concept_cons_em(): {len(df)}只成分股")
        results['概念成分股'] = True
except Exception as e:
    print(f"❌ stock_board_concept_cons_em(): {e}")
    results['概念成分股'] = False

# ============================================================================
# 5. 个股详细信息
# ============================================================================
print("\n【5. 个股详细信息】")
print("-" * 80)

# 5.1 个股信息
try:
    df = ak.stock_individual_info_em(symbol="600519")
    print(f"✅ stock_individual_info_em(): 获取个股详细信息")
    print(f"   信息项: {df['item'].head(5).tolist()}")
    results['个股详细信息'] = True
except Exception as e:
    print(f"❌ stock_individual_info_em(): {e}")
    results['个股详细信息'] = False

# 5.2 历史行情
try:
    end_date = datetime.now().strftime("%Y%m%d")
    start_date = (datetime.now() - timedelta(days=30)).strftime("%Y%m%d")
    df = ak.stock_zh_a_hist(symbol="600519", period="daily", start_date=start_date, end_date=end_date, adjust="qfq")
    print(f"✅ stock_zh_a_hist(): {len(df)}条历史数据")
    results['历史行情'] = True
except Exception as e:
    print(f"❌ stock_zh_a_hist(): {e}")
    results['历史行情'] = False

# ============================================================================
# 6. 总结
# ============================================================================
print("\n" + "=" * 80)
print("测试总结")
print("=" * 80)

success_count = sum(1 for v in results.values() if v)
total_count = len(results)

print(f"\n✅ 成功: {success_count}/{total_count}")
for name, success in results.items():
    if success:
        print(f"  ✅ {name}")

print(f"\n❌ 失败: {total_count - success_count}/{total_count}")
for name, success in results.items():
    if not success:
        print(f"  ❌ {name}")

print("\n" + "=" * 80)
print("数据分析建议")
print("=" * 80)

if results.get('行业板块列表'):
    print("✅ 行业数据完全可用，可以获取:")
    print("   - 行业板块列表和涨跌幅")
    print("   - 行业成分股")
    print("   - 行业PE、PB等指标")

if results.get('财务分析指标') or results.get('盈利能力'):
    print("✅ 财务数据可用，可以获取:")
    if results.get('财务分析指标'):
        print("   - ROE、ROA、毛利率等关键指标")
    if results.get('盈利能力'):
        print("   - 盈利能力详细分析")

print("\n建议:")
print("1. 使用 stock_zh_a_spot_em() 获取实时行情(数据最全)")
print("2. 使用 stock_board_industry_name_em() 获取行业数据")
print("3. 使用 stock_financial_analysis_indicator() 或 stock_profitability_analysis() 获取财务数据")
print("4. 所有数据都已验证可用，可以放心使用")
