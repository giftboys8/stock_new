# 股票分析系统 - 静态Demo

## 项目说明

这是一个基于HTML/CSS/JavaScript的静态demo页面，用于展示股票分析系统的界面设计和交互效果。

## 项目结构

```
prototypes/
├── css/
│   └── style.css          # 通用样式文件
├── js/
│   └── (未来可添加)
├── images/
│   └── (未来可添加)
├── screening.html         # 漏斗选股配置页（首页）
├── results.html           # 选股结果列表页
├── detail.html            # 个股分析详情页
├── history.html           # 历史记录页
└── README.md              # 本文件
```

## 页面功能说明

### 1. 漏斗选股配置页 (screening.html)

**路由**: `/` 或 `/screening.html`

**功能**:
- 三套预设策略选择（稳健型/平衡型/成长型）
- 高级筛选条件配置（市值、PE、ROE、换手率等）
- 启动筛选功能

**交互**:
- 单选策略卡片
- 展开/收起高级设置
- 滑块调节筛选参数
- 保存配置、恢复默认

---

### 2. 选股结果列表页 (results.html)

**路由**: `/results.html`

**功能**:
- 展示筛选结果概览（时间、策略、数量、平均评分）
- 股票列表表格（股票代码、名称、股价、PE、ROE、评分）
- 排序功能（评分、股价、PE、ROE）
- 分页功能
- 导出Excel功能

**交互**:
- 点击排序按钮切换排序方式
- 点击"详情"按钮跳转到个股详情页
- 点击分页按钮切换页面
- 点击"导出Excel"导出数据

---

### 3. 个股分析详情页 (detail.html)

**路由**: `/detail.html?code=600519`

**功能**:
- 基本信息展示（股价、涨跌幅、PE、PB、ROE、市值等）
- 综合评分与AI建议（评分、建议操作、价格、仓位、止盈止损）
- 六维度分析：
  - **D. 宏观与事件分析**: 评分 9/10
  - **C. 行业数据分析**: 评分 9/10
  - **B. 财务数据分析**: 评分 9/10
  - **A. 技术分析**: 评分 7/10
  - **E. 情绪面分析**: 评分 6/10
  - **F. 资金面分析**: 评分 7/10

**交互**:
- 点击分析标题可展开/折叠对应部分
- 返回列表按钮

---

### 4. 历史记录页 (history.html)

**路由**: `/history.html`

**功能**:
- 日期范围筛选
- 历史筛选记录列表（日期、策略、数量、平均评分）
- 查看详情功能
- 验证功能（查看后续表现）

**交互**:
- 日期筛选
- 点击"查看详情"查看该次筛选的详细信息
- 点击"验证"打开弹窗，查看筛选后的表现报告
- 验证弹窗显示：整体表现、涨跌分布、表现最好前3名、结论

---

## 设计规范

### 色彩方案

```css
/* 主色调 */
--primary-color: #2563eb;    /* 蓝色 - 专业、可信 */
--secondary-color: #64748b;  /* 灰色 - 中性信息 */

/* 状态色 */
--success-color: #22c55e;    /* 绿色 - 建议/优秀 */
--warning-color: #eab308;    /* 黄色 - 谨慎/一般 */
--danger-color: #ef4444;     /* 红色 - 危险/避免 */
--info-color: #3b82f6;       /* 蓝色 - 信息/链接 */

/* 背景色 */
--page-bg: #f8fafc;          /* 浅灰 - 页面背景 */
--card-bg: #ffffff;          /* 白色 - 卡片背景 */
--border-color: #e2e8f0;     /* 边框色 */
```

### 评分颜色

- **9-10分**: 🟢 深绿色 (`score-excellent`)
- **7-8分**: 🟢 浅绿色 (`score-good`)
- **5-6分**: 🟡 黄色 (`score-average`)
- **<5分**: 🔴 红色 (`score-poor`)

### 字体

- 系统默认字体栈：`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- 字号：13px / 14px / 16px / 18px / 20px
- 行高：1.6

### 组件样式

- **卡片**: 白色背景、8px圆角、阴影
- **按钮**: 6px圆角、hover效果
- **表格**: 斑马纹、hover高亮
- **输入框**: 6px圆角、focus高亮

---

## 如何使用

### 方法1：直接在浏览器中打开

1. 找到 `prototypes` 文件夹
2. 双击 `screening.html` 在浏览器中打开
3. 通过导航栏切换不同页面

### 方法2：使用本地服务器（推荐）

如果你想更好地模拟真实环境，可以使用本地服务器：

**使用Python**:
```bash
cd /opt/AI/stock/prototypes
python3 -m http.server 8000
```

然后访问: `http://localhost:8000/screening.html`

**使用Node.js (http-server)**:
```bash
cd /opt/AI/stock/prototypes
npx http-server -p 8000
```

然后访问: `http://localhost:8000/screening.html`

---

## 页面导航

```
screening.html (首页)
    │
    ├─→ [开始筛选] → results.html
    │
    └─→ [选股结果] → results.html
            │
            └─→ [详情] → detail.html
                    │
                    └─→ [返回列表] → results.html

[历史记录] → history.html
    │
    ├─→ [查看详情] → detail.html
    │
    └─→ [验证] → 弹窗
```

---

## 当前功能状态

### ✅ 已实现

- 所有4个页面的静态HTML结构
- 完整的CSS样式（响应式设计）
- 基础JavaScript交互（模拟数据）
- 页面间导航
- 策略选择交互
- 高级设置展开/折叠
- 排序按钮交互
- 分页按钮交互
- 分析部分展开/折叠
- 验证弹窗

### ⏳ 待实现（未来开发）

- 真实数据接口对接
- 后端API集成
- 图表可视化（使用ECharts或Chart.js）
- 用户登录系统
- 数据持久化
- 定时任务
- 市场环境实时监控

---

## 技术栈

- **HTML5**: 页面结构
- **CSS3**: 样式和布局（使用CSS变量）
- **JavaScript (ES6+)**: 交互逻辑
- **无框架**: 纯原生实现，轻量级

---

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 响应式断点

- **桌面端**: > 1024px
- **平板端**: 768px - 1024px
- **移动端**: < 768px

---

## 注意事项

1. **这是一个静态demo**：所有数据都是模拟数据，不是真实股票数据
2. **功能未完全实现**：点击按钮等操作只显示提示信息，不会真正执行
3. **图片资源**：目前使用emoji图标，可替换为真实图标（如Font Awesome）
4. **图表未实现**：需要后续添加图表库（如ECharts）

---

## 后续开发建议

1. **前端框架迁移**：
   - 考虑使用 Vue.js / React 重构
   - 使用 Vue Router 管理路由
   - 使用 Pinia / Redux 管理状态

2. **后端开发**：
   - Python (Flask / FastAPI) 作为后端
   - 使用 akshare 获取股票数据
   - 使用 Deep Seek API 进行AI分析

3. **数据库**：
   - PostgreSQL / MySQL 存储用户数据
   - Redis 缓存实时数据

4. **部署**：
   - 前端：Vercel / Netlify
   - 后端：阿里云 / 腾讯云

---

## 文档参考

- [需求分析文档](../docs/01_需求分析文档.md)
- [界面设计文档](../docs/09_界面设计文档.md)

---

## 更新日志

**2026-01-27**: 初始版本
- 创建4个HTML页面
- 实现CSS样式系统
- 添加基础JavaScript交互

---

## 联系方式

如有问题或建议，请联系项目团队。

---

**祝你使用愉快！** 📈
