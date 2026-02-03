"""
测试baostock作为替代数据源

baostock是一个免费、开源的证券数据平台
官网: http://baostock.com/
"""
import sys

print("=" * 80)
print("测试 baostock 替代数据源")
print("=" * 80)
print()

try:
    import baostock as bs
    print("✅ baostock 已安装")
    print(f"   版本: {bs.__version__}")

    # 登录系统
    lg = bs.login()
    if lg.error_code != '0':
        print(f"❌ 登录失败: {lg.error_msg}")
    else:
        print(f"✅ 登录成功")

        # 测试获取历史数据
        print()
        print("测试获取贵州茅台(600519)历史数据...")

        rs = bs.query_history_k_data_plus(
            "sh.600519",
            "date,code,open,high,low,close,preclose,volume,amount,adjustflag,turn,tradestatus,pctChg,isST",
            start_date='2026-01-20',
            end_date='2026-01-28',
            frequency="d",
            adjustflag="2"  # 2: 前复权
        )

        if rs.error_code != '0':
            print(f"❌ 查询失败: {rs.error_msg}")
        else:
            data_list = []
            while (rs.error_code == '0') & rs.next():
                data_list.append(rs.get_row_data())

            print(f"✅ 成功获取 {len(data_list)} 条数据")
            if data_list:
                print(f"   最新数据: {data_list[-1]}")

        # 登出系统
        bs.logout()

except ImportError:
    print("❌ baostock 未安装")
    print()
    print("安装命令:")
    print("  pip install baostock")
    print()
    print("使用说明:")
    print("  1. 免费开源，不需要注册")
    print("  2. 数据质量高，来源于交易所")
    print("  3. 接口简单，返回标准格式")
    print("  4. 支持历史K线、财务指标等")
    print()
    print("可以作为eastmoney的完美替代！")

print()
print("=" * 80)
