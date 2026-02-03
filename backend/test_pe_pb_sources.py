"""
测试不同akshare接口获取PE/PB数据
"""
import akshare as ak
import pandas as pd

print("=" * 80)
print("测试不同akshare接口获取PE/PB数据")
print("=" * 80)

# 测试股票
test_code = '600519'  # 贵州茅台

# ==================== 接口1: stock_individual_info_em ====================
print("\n1️⃣ 测试 stock_individual_info_em (原接口)")
try:
    df = ak.stock_individual_info_em(symbol=test_code)
    if not df.empty:
        print(f"✅ 成功！字段: {df['item'].tolist()}")
        # 查找PE/PB
        pe_row = df[df['item'].str.contains('市盈率', na=False)]
        pb_row = df[df['item'].str.contains('市净率', na=False)]
        print(f"PE: {pe_row['value'].values if not pe_row.empty else '未找到'}")
        print(f"PB: {pb_row['value'].values if not pb_row.empty else '未找到'}")
    else:
        print("❌ 返回空数据")
except Exception as e:
    print(f"❌ 失败: {e}")

# ==================== 接口2: stock_zh_a_spot (实时行情) ====================
print("\n2️⃣ 测试 stock_zh_a_spot (实时行情)")
try:
    df = ak.stock_zh_a_spot()
    print(f"✅ 成功！共{len(df)}只股票")
    print(f"   字段: {df.columns.tolist()}")

    # 查找茅台
    stock = df[df['代码'] == test_code]
    if not stock.empty:
        print(f"   茅台数据: {stock.iloc[0].to_dict()}")
    else:
        # 可能代码格式不同
        stock = df[df['代码'].str.contains('600519', na=False)]
        if not stock.empty:
            print(f"   茅台数据: {stock.iloc[0].to_dict()}")

except Exception as e:
    print(f"❌ 失败: {e}")

# ==================== 接口3: stock_a_lg_indicator (财务指标) ====================
print("\n3️⃣ 测试 stock_a_lg_indicator (历史财务指标)")
try:
    # 获取最近一个季度的数据
    df = ak.stock_a_lg_indicator(symbol=test_code)
    if not df.empty:
        print(f"✅ 成功！共{len(df)}条记录")
        print(f"   字段: {df.columns.tolist()}")
        latest = df.iloc[-1]
        print(f"   最新数据: {latest.to_dict()}")
    else:
        print("❌ 返回空数据")
except Exception as e:
    print(f"❌ 失败: {e}")

# ==================== 接口4: stock_em_pf_indicator (东方财富指标) ====================
print("\n4️⃣ 测试 stock_em_pf_indicator (东方财富PE/PB指标)")
try:
    df = ak.stock_em_pf_indicator(symbol=test_code)
    if not df.empty:
        print(f"✅ 成功！共{len(df)}条记录")
        print(f"   字段: {df.columns.tolist()}")
        latest = df.iloc[-1]
        print(f"   最新PE: {latest.get('市盈率PE', 'N/A')}")
        print(f"   最新PB: {latest.get('市净率PB', 'N/A')}")
    else:
        print("❌ 返回空数据")
except Exception as e:
    print(f"❌ 失败: {e}")

# ==================== 接口5: stock_board_industry_name_em (行业板块) ====================
print("\n5️⃣ 测试 stock_board_industry_name_em (查看是否有行业指标)")
try:
    # 获取行业成分股
    industries = ak.stock_board_industry_name_em()
    print(f"✅ 成功！共{len(industries)}个行业")
    print(f"   板块名称字段: {industries.columns.tolist()}")

    # 查看是否有指标数据
    if '市盈率' in industries.columns or 'PE' in industries.columns:
        print("   ✅ 包含市盈率数据！")
        print(industries[['板块名称', '市盈率', '市净率']].head() if '市盈率' in industries.columns else industries.head())
    else:
        print("   ❌ 不包含市盈率数据")

except Exception as e:
    print(f"❌ 失败: {e}")

print("\n" + "=" * 80)
print("结论")
print("=" * 80)
print("请查看以上哪个接口可以获取到PE/PB数据")
print("推荐使用可用的接口替换 stock_individual_info_em")
