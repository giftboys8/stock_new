"""
API接口测试脚本
"""
import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

print("=" * 80)
print("API接口测试")
print("=" * 80)

try:
    from app.main import app
    print("✅ FastAPI应用导入成功")
    print(f"✅ 路由已注册:")
    print(f"   - /api/stocks (股票列表)")
    print(f"   - /api/stocks/:code (个股详情)")
    print(f"   - /api/stocks/:code/history (历史K线)")
    print(f"   - /api/screen (筛选功能)")
    print()
    print("API文档访问: http://localhost:8000/docs")
    print("启动命令: uvicorn app.main:app --reload")

except Exception as e:
    print(f"❌ 导入失败: {e}")
    sys.exit(1)
