# Deep Seek API 使用指南

## 一、关于Deep Seek API Key

### 1.1 获取API Key

**步骤**：
1. 访问 Deep Seek 开放平台：https://platform.deepseek.com/
2. 注册账号（手机号或邮箱）
3. 进入"API Keys"页面
4. 点击"创建新的API Key"
5. 复制保存你的API Key（类似：`sk-xxxxx`）

**重要提示**：
- ⚠️ API Key只显示一次，请妥善保管
- ⚠️ 不要将API Key提交到Git仓库
- ⚠️ 建议设置使用限额（防止意外超支）

---

### 1.2 API Key的使用范围

**问题**：开通了Deep Seek API key，可以直接调用哪些模型？

**回答**：
✅ **一个API Key可以调用多个模型**

| 模型名称 | API调用 | 用途 |
|---------|---------|------|
| **deepseek-chat** | ✅ 可用 | 通用对话模型（推荐用于本项目） |
| **deepseek-coder** | ⚠️ 已合并 | 代码生成（已合并到deepseek-chat） |

**说明**：
- Deep Seek官方已经将`deepseek-coder`合并到`deepseek-chat`中
- 现在只需要调用`deepseek-chat`即可完成所有任务（包括代码生成）
- 通过调整prompt可以让它专注做代码生成任务

**API调用示例**：
```python
import requests

def call_deepseek(prompt, model="deepseek-chat"):
    """调用Deep Seek API"""
    url = "https://api.deepseek.com/v1/chat/completions"
    headers = {
        "Authorization": "Bearer sk-你的API-Key",  # 替换为你的API Key
        "Content-Type": "application/json"
    }
    data = {
        "model": model,  # 使用 deepseek-chat
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    response = requests.post(url, headers=headers, json=data)
    return response.json()

# 使用示例1：通用对话
result = call_deepseek("分析一下贵州茅台的投资价值")

# 使用示例2：代码生成（通过prompt指定）
code_prompt = """
请帮我写一段Python代码，使用akshare获取股票列表，并筛选出PE>15且ROE>20%的股票。
只返回代码，不需要解释。
"""
result = call_deepseek(code_prompt)
```

---

## 二、Deep Seek的模型选择

### 2.1 推荐使用的模型

| 模型 | 版本 | 推荐场景 |
|------|------|---------|
| **deepseek-chat** | 最新版 | 所有任务（推荐） |

**为什么不再单独提deepseek-coder？**
- Deep Seek官方已将coder能力整合到chat模型中
- 一个API Key、一个模型即可完成所有任务
- 简化了使用流程

---

### 2.2 本项目的模型使用策略

```
┌──────────────────────────────────────┐
│  项目运行时的AI任务                   │
├──────────────────────────────────────┤
│  • 新闻情感分析      → Deep Seek      │
│  • 事件影响分析      → Deep Seek      │
│  • 生成推荐报告      → Deep Seek      │
│  • 行业对比分析      → Deep Seek      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  开发阶段的代码生成                    │
├──────────────────────────────────────┤
│  • 写Python代码      → GPT-4/Claude   │
│  • 调试代码          → GPT-4/Claude   │
│  • 代码review        → GPT-4/Claude   │
└──────────────────────────────────────┘
```

**理由**：
- ✅ Deep Seek便宜，适合项目运行时高频调用
- ✅ GPT-4/Claude代码质量更好，适合开发阶段使用
- ✅ 你已有国外模型访问权限，充分利用

---

## 三、成本分析

### 3.1 Deep Seek价格（参考）

| 项目 | 价格 |
|------|------|
| 输入 | ¥1 / 1M tokens |
| 输出 | ¥2 / 1M tokens |

**实际成本估算**：

假设分析1只股票：
- 输入Prompt：约2000 tokens（包含新闻、财务数据、技术指标）
- 输出报告：约1000 tokens（简洁版+详细版）
- **单次分析成本**：约¥0.004（不到1分钱）

假设每天分析20只股票：
- **月成本**：¥0.004 × 20 × 22天 = **约¥1.76**（非常便宜！）

---

### 3.2 对比其他模型

| 模型 | 月成本（分析20只/天） | 性价比 |
|------|---------------------|--------|
| **Deep Seek** | ¥2-5 | ⭐⭐⭐⭐⭐ |
| GPT-4 | ¥50-100 | ⭐⭐⭐ |
| Claude | ¥40-80 | ⭐⭐⭐ |
| Qwen-Max | ¥5-10 | ⭐⭐⭐⭐ |

**结论**：Deep Seek性价比最高

---

## 四、快速开始

### 4.1 安装SDK

```bash
# 方式1：使用OpenAI SDK（推荐，因为Deep Seek兼容OpenAI格式）
pip install openai

# 方式2：直接使用requests（无需安装额外库）
# （上面的示例已经展示）
```

---

### 4.2 配置环境变量

**Linux/Mac**：
```bash
export DEEPSEEK_API_KEY="sk-你的API-Key"
```

**Windows**：
```cmd
set DEEPSEEK_API_KEY=sk-你的API-Key
```

**Python代码中读取**：
```python
import os

API_KEY = os.getenv("DEEPSEEK_API_KEY")
```

---

### 4.3 第一个API调用

```python
from openai import OpenAI

# 初始化客户端
client = OpenAI(
    api_key="sk-你的API-Key",
    base_url="https://api.deepseek.com/v1"
)

# 调用API
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "user", "content": "你好，请介绍一下你自己"}
    ],
    temperature=0.7
)

# 打印结果
print(response.choices[0].message.content)
```

---

## 五、本项目中的使用方式

### 5.1 封装Deep Seek调用

在项目中创建 `ai_service.py`：

```python
import os
from openai import OpenAI

class DeepSeekService:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("DEEPSEEK_API_KEY"),
            base_url="https://api.deepseek.com/v1"
        )

    def analyze_stock(self, stock_data):
        """分析股票"""
        prompt = f"""
        请分析以下股票，给出投资建议：

        股票代码：{stock_data['code']}
        股票名称：{stock_data['name']}
        PE：{stock_data['pe']}
        ROE：{stock_data['roe']}

        近期新闻：
        {stock_data['news']}

        请按照以下格式输出：
        1. 综合评分（0-10分）
        2. 各维度评分
        3. 建议操作
        4. 详细分析
        """

        response = self.client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )

        return response.choices[0].message.content

# 使用
ai_service = DeepSeekService()
result = ai_service.analyze_stock(stock_data)
```

---

### 5.2 与FastAPI集成

```python
from fastapi import FastAPI
from ai_service import DeepSeekService

app = FastAPI()
ai_service = DeepSeekService()

@app.post("/api/analyze")
async def analyze_stock(code: str):
    # 1. 获取数据
    stock_data = get_stock_data(code)

    # 2. 调用AI分析
    analysis = ai_service.analyze_stock(stock_data)

    # 3. 返回结果
    return {
        "code": code,
        "analysis": analysis
    }
```

---

## 六、常见问题

### Q1：Deep Seek和GPT-4相比如何？

**答**：
- **中文理解**：Deep Seek ≈ GPT-4（都很强）
- **代码生成**：GPT-4 > Deep Seek（所以代码生成用GPT-4）
- **价格**：Deep Seek << GPT-4（便宜10倍以上）
- **速度**：Deep Seek更快

**结论**：本项目用Deep Seek完全够用

---

### Q2：如何设置API Key的使用限额？

**答**：
1. 登录 https://platform.deepseek.com/
2. 进入"Settings" → "Billing"
3. 设置每日/每月消费上限
4. 超过限额后自动停止调用

**建议设置**：
- 每日限额：¥10（够分析200只股票）
- 每月限额：¥200

---

### Q3：如果API调用失败怎么办？

**答**：
1. 检查API Key是否正确
2. 检查账户余额（新用户有免费额度）
3. 查看错误信息：
   - `401 Unauthorized`：API Key错误
   - `429 Too Many Requests`：调用频率过高，需要降速
   - `500 Internal Server Error`：服务器错误，稍后重试

**备用方案**：切换到Qwen-Max或GLM-4

---

## 七、总结

✅ **一个API Key搞定所有**
- 购买/申请Deep Seek API Key
- 调用`deepseek-chat`模型
- 完成本项目所有AI推理任务

✅ **开发时用国外模型**
- 代码生成用GPT-4/Claude（质量更好）
- 项目运行时用Deep Seek（成本更低）

✅ **成本可控**
- 月成本约¥2-5
- 设置消费限额防止超支

---

**文档更新日期**：2026-01-27
**下一步**：开始原型设计
