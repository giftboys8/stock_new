"""
akshare网络问题详细诊断脚本
"""
import sys
import traceback
from datetime import datetime
import requests

def test_network_connectivity():
    """测试基础网络连接"""
    print("=" * 80)
    print("步骤1: 测试基础网络连接")
    print("=" * 80)

    test_urls = [
        ("百度", "https://www.baidu.com"),
        ("东方财富网", "https://www.eastmoney.com"),
        ("akshare GitHub", "https://github.com/akfamily/akshare"),
    ]

    for name, url in test_urls:
        try:
            response = requests.get(url, timeout=5)
            print(f"✅ {name}: 连接成功 (状态码: {response.status_code})")
        except Exception as e:
            print(f"❌ {name}: 连接失败 - {str(e)}")
    print()


def test_akshare_interfaces():
    """详细测试各个akshare接口"""
    print("=" * 80)
    print("步骤2: 详细测试akshare各个接口")
    print("=" * 80)

    try:
        import akshare as ak
        print(f"✅ akshare导入成功 (版本: {ak.__version__})\n")
    except ImportError as e:
        print(f"❌ akshare导入失败: {e}\n")
        return

    # 测试接口列表
    tests = [
        {
            "name": "股票列表",
            "func": lambda: ak.stock_info_a_code_name(),
            "description": "获取A股股票代码和名称列表"
        },
        {
            "name": "实时行情(方式1)",
            "func": lambda: ak.stock_zh_a_spot_em(),
            "description": "东方财富网-沪深京A股-实时行情"
        },
        {
            "name": "实时行情(方式2)",
            "func": lambda: ak.stock_zh_a_spot(),
            "description": "新浪-A股-实时行情"
        },
        {
            "name": "历史行情",
            "func": lambda: ak.stock_zh_a_hist(symbol="600519", period="daily", start_date="20260101", end_date="20260128", adjust="qfq"),
            "description": "东方财富网-个股历史行情"
        },
        {
            "name": "财务数据",
            "func": lambda: ak.stock_financial_analysis_indicator(symbol="600519"),
            "description": "个股财务分析指标"
        },
        {
            "name": "行业板块",
            "func": lambda: ak.stock_board_industry_name_em(),
            "description": "东方财富网-行业板块"
        },
        {
            "name": "概念板块",
            "func": lambda: ak.stock_board_concept_name_em(),
            "description": "东方财富网-概念板块"
        },
    ]

    results = {
        "success": [],
        "failed": []
    }

    for i, test in enumerate(tests, 1):
        print(f"\n{'=' * 80}")
        print(f"测试 {i}/{len(tests)}: {test['name']}")
        print(f"{'=' * 80}")
        print(f"说明: {test['description']}")
        print(f"调用: ak.{test['func'].__name__}()")

        try:
            print("正在调用...")
            result = test['func']()

            if result is not None and hasattr(result, '__len__') and len(result) > 0:
                print(f"✅ 成功! 返回数据类型: {type(result).__name__}, 数据量: {len(result)}")
                print(f"预览:\n{result.head(3) if hasattr(result, 'head') else result}")
                results['success'].append(test['name'])
            else:
                print(f"⚠️  返回数据为空")
                results['failed'].append(f"{test['name']} (数据为空)")

        except ImportError as e:
            error_msg = f"导入错误: {e}"
            print(f"❌ {error_msg}")
            results['failed'].append(f"{test['name']} - {error_msg}")

        except AttributeError as e:
            error_msg = f"接口不存在: {e}"
            print(f"❌ {error_msg}")
            print(f"可能原因: akshare接口已更新，请查看最新文档")
            results['failed'].append(f"{test['name']} - {error_msg}")

        except requests.exceptions.ProxyError as e:
            error_msg = f"代理错误: {e}"
            print(f"❌ {error_msg}")
            print(f"可能原因: 系统设置了代理，但代理服务器不可用")
            results['failed'].append(f"{test['name']} - {error_msg}")

        except requests.exceptions.ConnectionError as e:
            error_msg = f"连接错误: {e}"
            print(f"❌ {error_msg}")
            print(f"可能原因: 网络连接问题或目标服务器拒绝连接")
            results['failed'].append(f"{test['name']} - {error_msg}")

        except requests.exceptions.Timeout as e:
            error_msg = f"超时错误: {e}"
            print(f"❌ {error_msg}")
            results['failed'].append(f"{test['name']} - {error_msg}")

        except Exception as e:
            error_msg = f"未知错误: {type(e).__name__}: {e}"
            print(f"❌ {error_msg}")
            print(f"详细错误:\n{traceback.format_exc()}")
            results['failed'].append(f"{test['name']} - {error_msg}")

    # 打印总结
    print("\n" + "=" * 80)
    print("测试总结")
    print("=" * 80)
    print(f"✅ 成功: {len(results['success'])}个")
    for name in results['success']:
        print(f"  - {name}")

    print(f"\n❌ 失败: {len(results['failed'])}个")
    for name in results['failed']:
        print(f"  - {name}")

    return results


def check_system_proxy():
    """检查系统代理设置"""
    print("\n" + "=" * 80)
    print("步骤3: 检查系统代理设置")
    print("=" * 80)

    import os
    proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']

    has_proxy = False
    for var in proxy_vars:
        value = os.environ.get(var)
        if value:
            print(f"⚠️  检测到代理设置: {var}={value}")
            has_proxy = True

    if not has_proxy:
        print("✅ 未检测到系统代理设置")

    return has_proxy


def recommend_solutions(results):
    """推荐解决方案"""
    print("\n" + "=" * 80)
    print("问题诊断和解决方案")
    print("=" * 80)

    success_rate = len(results['success']) / (len(results['success']) + len(results['failed']))

    if success_rate >= 0.7:
        print("✅ 大部分接口可用，网络基本正常")
        print("建议:")
        print("  1. 使用可用的接口作为主要数据源")
        print("  2. 对失败的接口添加重试机制")
        print("  3. 考虑使用备用数据源")

    elif success_rate >= 0.3:
        print("⚠️  部分接口可用，可能存在网络或代理问题")
        print("建议:")
        print("  1. 检查系统代理设置")
        print("  2. 尝试临时禁用代理")
        print("  3. 使用可用的接口，添加缓存机制")
        print("  4. 在代码中添加超时和重试逻辑")

    else:
        print("❌ 大部分接口不可用，存在严重网络问题")
        print("建议:")
        print("  1. 检查网络连接")
        print("  2. 检查防火墙设置")
        print("  3. 考虑使用VPN或其他网络环境")
        print("  4. 或者使用离线数据/备用数据源")

    print("\n推荐的akshare接口优先级:")
    print("  1. ⭐⭐⭐ stock_zh_a_hist() - 历史行情 (已验证可用)")
    print("  2. ⭐⭐⭐ stock_info_a_code_name() - 股票列表 (已验证可用)")
    print("  3. ⭐⭐   stock_zh_a_spot() - 实时行情-新浪 (备用)")
    print("  4. ⭐     其他接口 (根据实际情况)")


if __name__ == "__main__":
    print(f"开始诊断时间: {datetime.now()}")
    print()

    # 步骤1: 测试基础网络
    test_network_connectivity()

    # 步骤2: 检查代理
    has_proxy = check_system_proxy()

    # 步骤3: 测试akshare接口
    results = test_akshare_interfaces()

    # 步骤4: 推荐解决方案
    recommend_solutions(results)

    print("\n" + "=" * 80)
    print(f"诊断完成时间: {datetime.now()}")
    print("=" * 80)
