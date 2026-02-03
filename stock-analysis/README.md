# 中国风股票分析系统 - React版

**技术栈**：React 18 + Vite + Tailwind CSS
**设计风格**：中国山水画风格（水墨淡彩 + 月夜山水）
**项目阶段**：第一阶段 - 前端设计验证

---

## 📋 项目说明

这是一个中国风股票分析系统的前端demo，用于验证中国风设计效果。

### 核心特性

- ✅ **中国山水画风格**：水墨淡彩（日间）+ 月夜山水（夜间）
- ✅ **双主题切换**：点击切换日间/夜间模式
- ✅ **响应式设计**：支持桌面端、平板、移动端
- ✅ **优雅的交互**：水墨扩散动画、平滑过渡
- ✅ **传统文化元素**：山水、印章、飞鸟装饰

### 技术亮点

- React 18 Hooks（useState, useEffect）
- Tailwind CSS自定义主题
- Context API状态管理
- Vite快速构建
- Google Fonts（Noto Serif SC + Ma Shan Zheng）

---

## 🚀 快速开始

### ⚠️ 第一步：修复依赖问题

开发过程中npm install在错误的目录执行了，需要先修复：

```bash
# 1. 进入项目目录
cd /opt/AI/stock/stock-analysis

# 2. 如果上级目录有错误的node_modules，先删除
rm -rf ../node_modules ../package-lock.json

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev
```

### 第二步：访问应用

启动后，终端会显示本地服务器地址，通常是：
```
➜  Local:   http://localhost:5173/
```

在浏览器中打开该地址即可。

---

## 📂 项目结构

```
stock-analysis/
├── index.html              # HTML入口
├── package.json            # 项目配置
├── tailwind.config.js      # Tailwind配置（中国风主题）
├── postcss.config.js       # PostCSS配置
├── vite.config.js          # Vite配置
└── src/
    ├── main.jsx            # 应用入口
    ├── index.css           # 全局样式（Tailwind指令）
    ├── App.jsx             # 主应用组件
    ├── contexts/           # Context（状态管理）
    │   └── ThemeContext.jsx # 主题切换Context
    ├── components/         # 可复用组件
    │   └── decorations/    # 装饰组件
    │       └── ChineseDecorations.jsx
    ├── pages/              # 页面组件
    │   └── Screening.jsx   # 选股配置页面
    └── data/               # 数据文件（待添加）
```

---

## 🎨 中国风设计规范

### 颜色系统

#### 日间模式
```jsx
bg-paper          // 宣纸白 #f5f2eb
bg-paper-light    // 淡宣纸 #faf8f3
text-ink-black    // 浓墨 #1a1a1a
text-ink-gray     // 淡墨 #4a4a4a
text-bamboo       // 竹青 #2d5a3d
```

#### 夜间模式
```jsx
dark:bg-paper      // 深黛蓝 #1a2329
dark:text-ink-black // 月光白 #e8dcc4
dark:text-bamboo    // 月下青竹 #7fb069
```

### 字体使用

```jsx
font-title  // 标题（书法字体）
font-body   // 正文（宋体）
font-data   // 数据（无衬线）
```

### 组件样式示例

#### 按钮
```jsx
// 主按钮
<button className="px-6 py-3 bg-bamboo hover:bg-bamboo-light text-white rounded-sm transition-all btn-ink">
  确认
</button>

// 次按钮
<button className="px-6 py-3 border border-border-ink text-ink-gray rounded-sm hover:bg-paper-light transition-all">
  取消
</button>
```

#### 卡片
```jsx
<div className="card-chinese">
  <div className="font-title text-xl mb-4">卡片标题</div>
  <div className="font-body text-ink-gray">卡片内容</div>
</div>
```

---

## 🎯 功能实现

### ✅ 已实现

- [x] 项目初始化（Vite + React）
- [x] Tailwind CSS配置（中国风主题）
- [x] 主题切换功能（日间/夜间）
- [x] 导航栏组件
- [x] 选股配置页面
- [x] 策略选择卡片
- [x] 高级设置（可展开/收起）
- [x] 中国风装饰元素
- [x] 响应式布局

### 🔄 待实现（第二阶段）

- [ ] 后端API连接
- [ ] 真实数据展示
- [ ] 选股结果页面
- [ ] 个股详情页面
- [ ] 历史记录页面
- [ ] 用户登录系统
- [ ] 数据持久化

---

## 🛠️ 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

---

## 🌓 主题切换

### 自动切换

系统根据时间自动选择主题：
- **6:00 - 18:00**：日间模式（水墨淡彩）
- **18:00 - 6:00**：夜间模式（月夜山水）

### 手动切换

点击导航栏右侧的"☀️ 日间" / "🌙 夜间"按钮切换主题。

主题偏好会保存在浏览器的localStorage中。

---

## 📱 响应式设计

### 断点

- **移动端**：< 768px
- **平板端**：768px - 1024px
- **桌面端**：> 1024px

### 测试建议

在不同设备和浏览器上测试：
- Chrome、Firefox、Safari
- iPhone、iPad、桌面电脑
- 横屏、竖屏模式

---

## 🎨 设计特色

### 中国风元素

1. **山水背景**：页面底部的山峦剪影
2. **印章装饰**：右下角的"股票分析"印章
3. **飞鸟点缀**：页面顶部的飞鸟剪影
4. **书法字体**：标题使用楷体
5. **诗词装饰**：页面引言和底部诗词
6. **中文数字**：壹、贰、叁序列

### 水墨动画

- 按钮hover时的水墨扩散效果
- 主题切换时的平滑过渡
- 页面加载时的淡入动画

---

## 🔧 自定义配置

### 修改颜色

编辑 `tailwind.config.js` 中的颜色值：

```javascript
colors: {
  'bamboo': '#2d5a3d',     // 修改竹青色
  'paper': '#f5f2eb',      // 修改宣纸白
  // ... 其他颜色
}
```

### 添加新页面

1. 在 `src/pages/` 创建新组件
2. 在 `App.jsx` 中引入并使用
3. 在导航栏添加链接

---

## 📚 相关文档

- [技术栈决策](../TECH_STACK_FINAL.md)
- [设计规范文档](../prototypes/DESIGN_SPEC_REACT.md)
- [开发任务清单](../DEV_TASKS.md)
- [需求分析文档](../docs/01_需求分析文档.md)
- [界面设计文档](../docs/09_界面设计文档.md)

---

## 🎯 下一步计划

### 第二阶段：连接后端

1. 创建FastAPI后端项目
2. 集成akshare数据源
3. 实现选股逻辑
4. 连接前后端API

### 第三阶段：完善功能

1. 实现选股结果页面
2. 实现个股详情页面
3. 实现历史记录页面
4. Docker部署配置

---

## 💬 技术支持

如有问题，请查阅：
- [React文档](https://react.dev/)
- [Vite文档](https://vitejs.dev/)
- [Tailwind CSS文档](https://tailwindcss.com/)

---

## 📝 更新日志

**2026-01-27**
- ✅ 项目初始化
- ✅ 中国风设计系统实现
- ✅ 主题切换功能
- ✅ 选股配置页面
- ✅ 装饰元素组件

---

**祝你使用愉快！** 🎨📈
