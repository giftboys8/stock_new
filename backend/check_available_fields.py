"""
检查stock_zh_a_spot()返回的字段，确认是否包含PE、PB等数据
"""
import akshare as ak
import pandas as pd

print("=" * 80)
print("检查 stock_zh_a_spot() 返回的数据字段")
print("=" * 80)

# 获取实时行情
df = ak.stock_zh_a_spot()

print(f"\n总共 {len(df)} 只股票")
print(f"\n数据列（字段）：")
print(df.columns.tolist())

print("\n" + "=" * 80)
print("贵州茅台(600519)的数据示例：")
print("=" * 80)

# 查找贵州茅台
stock_data = df[df['代码'] == '600519']

if not stock_data.empty:
    row = stock_data.iloc[0]
    print(f"\n股票名称: {row['名称']}")
    print(f"最新价: {row['最新价']}")
    print(f"涨跌幅: {row['涨跌幅']}%")

    # 检查是否有PE、PB等财务指标
    print("\n可用的财务指标字段：")
    financial_fields = ['市盈率-动态', '市盈率-静态', '市净率', '市销率', '股息率']
    for field in financial_fields:
        if field in df.columns:
            value = row.get(field, 'N/A')
            print(f"  ✅ {field}: {value}")
        else:
            print(f"  ❌ {field}: 字段不存在")

    print("\n所有字段及其值：")
    for col in df.columns:
        value = row[col]
        print(f"  {col}: {value}")
else:
    print("未找到贵州茅台数据")

# 随机查看5只股票的数据
print("\n" + "=" * 80)
print("随机5只股票的完整数据：")
print("=" * 80)
print(df.sample(5).to_string())

print("\n" + "=" * 80)
print("结论：")
print("=" * 80)
if '市盈率-动态' in df.columns and '市净率' in df.columns:
    print("✅ stock_zh_a_spot() 已包含 PE(市盈率-动态) 和 PB(市净率)")
    print("✅ 不需要额外的财务数据接口，可以满足基本筛选需求")
else:
    print("❌ stock_zh_a_spot() 不包含完整的财务指标")

print("\n可用的筛选字段：")
print("  - 价格相关: 最新价, 涨跌幅, 涨跌额")
print("  - 估值相关: 市盈率-动态, 市净率 (如果有)")
print("  - 成交相关: 成交量, 成交额")
print("  - 市值相关: 总市值 (如果有)")
