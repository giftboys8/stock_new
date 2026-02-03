# 中国风设计规范 - React + Tailwind CSS版

**版本**：v1.0
**技术栈**：React 18 + Vite + Tailwind CSS
**更新日期**：2026-01-27

---

## 🎨 设计原则

1. **简洁雅致**：避免过度装饰
2. **水墨金融**：传统美学 + 现代功能
3. **功能优先**：中国风作为点缀，不干扰功能
4. **留白艺术**：适当留白，避免信息过载

---

## 🌈 颜色系统

### Tailwind CSS 配置

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ['class'], // 手动切换暗色模式
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 日间模式颜色
      colors: {
        // 主色调
        'ink-black': '#1a1a1a',      // 浓墨（主文字）
        'ink-gray': '#4a4a4a',       // 淡墨（次文字）
        'ink-light': '#7a7a7a',      // 极淡墨（辅助）

        // 背景色
        'paper': '#f5f2eb',          // 宣纸白（主背景）
        'paper-light': '#faf8f3',    // 淡宣纸（卡片背景）

        // 点缀色
        'bamboo': '#2d5a3d',         // 竹青（主色）
        'bamboo-light': '#4a7c5f',   // 淡竹青（悬停）
        'ochre': '#8b7355',          // 赭石（警告）
        'seal-red': '#8b3a3a',       // 朱砂红（危险）
        'indigo': '#4a6fa5',         // 靛蓝（信息）

        // 边框和分割线
        'border-ink': '#d4d0c8',     // 淡墨边框
      },
      // 夜间模式颜色（通过dark:前缀）
      dark: {
        'ink-black': '#e8dcc4',      // 月光白（主文字）
        'ink-gray': '#b8a88a',       // 淡月光（次文字）
        'ink-light': '#787060',      // 远山灰（辅助）

        'paper': '#1a2329',          // 深黛蓝（主背景）
        'paper-light': '#242d35',    // 墨色（卡片背景）

        'bamboo': '#7fb069',         // 月下青竹（主色）
        'bamboo-light': '#9fc58f',   // 淡青竹（悬停）
        'ochre': '#d4a574',          // 金黄（警告）
        'seal-red': '#c96f6f',       // 暗红（危险）
        'indigo': '#7a9bc0',         // 月蓝（信息）

        'border-ink': '#3a4450',     // 淡墨边框
      },

      // 字体家族
      fontFamily: {
        'title': [''Ma Shan Zheng', 'STKaiti', 'KaiTi', 'cursive'],
        'body': [''Noto Serif SC', 'STSong', 'SimSun', 'serif'],
        'data': [''Noto Sans SC', 'STHeiti', 'SimHei', 'sans-serif'],
      },

      // 间距系统（4px基准）
      spacing: {
        'xs': '0.5rem',   // 8px
        'sm': '0.75rem',  // 12px
        'md': '1rem',     // 16px
        'lg': '1.5rem',   // 24px
        'xl': '2rem',     // 32px
        '2xl': '3rem',    // 48px
      },

      // 圆角
      borderRadius: {
        'sm': '0.125rem',  // 2px
        'md': '0.25rem',   // 4px
        'lg': '0.5rem',    // 8px
      },

      // 阴影
      boxShadow: {
        'ink': '0 2px 8px rgba(45, 90, 61, 0.1)',
        'ink-lg': '0 4px 16px rgba(45, 90, 61, 0.15)',
      },
    },
  },
  plugins: [],
}
```

---

### 颜色使用示例

```jsx
// 日间模式
<div className="bg-paper text-ink-black border border-border-ink">
  宣纸白背景，浓墨文字
</div>

// 夜间模式
<div className="dark:bg-paper dark:text-ink-black dark:border-dark:border-border-ink">
  深黛蓝背景，月光白文字
</div>

// 主色按钮
<button className="bg-bamboo hover:bg-bamboo-light text-white">
  点击
</button>

// 警告/危险
<span className="text-ochre">警告信息</span>
<span className="text-seal-red">危险信息</span>

// 涨跌幅（A股习惯）
<span className="text-seal-red">+2.35%</span>  // 涨（红）
<span className="text-bamboo">-1.20%</span>  // 跌（绿）
```

---

## 🔤 字体系统

### Google Fonts 引入

```html
<!-- index.html -->
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Sans+SC:wght@400;500;600&family=Noto+Serif+SC:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
```

### 字体使用规范

```jsx
// 标题（书法字体）
<h1 className="font-title text-3xl tracking-widest">
  漏斗选股
</h1>

// 正文（宋体）
<p className="font-body text-base leading-relaxed text-ink-gray">
  这是正文内容...
</p>

// 数据数字（无衬线）
<span className="font-data text-xl font-semibold">
  1650.00
</span>
```

---

## 📐 间距与布局

### 间距规范

```jsx
// 组件内边距
<div className="p-4">  // 16px（小）
<div className="p-6">  // 24px（标准）
<div className="p-8">  // 32px（大）

// 组件外边距
<div className="mb-4"> // 下边距 16px
<div className="gap-4"> // Flex/Grid 间距 16px

// 列表间距
<ul className="space-y-2"> // 每项间隔 8px
<ul className="space-y-3"> // 每项间隔 12px
```

### 布局示例

```jsx
// 卡片布局
<div className="bg-paper-light p-6 rounded-md shadow-ink border border-border-ink">
  <h2 className="font-title text-xl mb-4">卡片标题</h2>
  <p className="font-body text-ink-gray">卡片内容</p>
</div>

// 按钮组
<div className="flex gap-3">
  <button className="px-6 py-3 bg-bamboo hover:bg-bamboo-light text-white rounded-sm">
    主按钮
  </button>
  <button className="px-6 py-3 border border-border-ink text-ink-gray rounded-sm hover:bg-paper">
    次按钮
  </button>
</div>
```

---

## 🧩 组件规范

### 按钮

```jsx
// 主按钮
<button className="px-6 py-3 bg-bamboo hover:bg-bamboo-light text-white rounded-sm transition-all">
  确认
</button>

// 次按钮
<button className="px-6 py-3 border border-border-ink text-ink-black rounded-sm hover:bg-paper-light transition-all">
  取消
</button>

// 危险按钮
<button className="px-6 py-3 bg-seal-red hover:opacity-90 text-white rounded-sm transition-all">
  删除
</button>
```

---

### 卡片

```jsx
// 标准卡片
<div className="bg-paper p-6 rounded-md shadow-ink border border-border-ink">
  <div className="font-title text-xl mb-4 pb-3 border-b border-border-ink">
    卡片标题
  </div>
  <div className="font-body text-ink-gray">
    卡片内容
  </div>
</div>

// 带装饰的卡片
<div className="bg-paper p-6 rounded-md shadow-ink border border-border-ink relative overflow-hidden">
  {/* 水墨装饰 */}
  <div className="absolute top-0 right-0 w-24 h-24 opacity-5 bg-bamboo rounded-full blur-3xl"></div>

  <div className="relative z-10">
    <div className="font-title text-xl mb-4">卡片标题</div>
    <div className="font-body text-ink-gray">卡片内容</div>
  </div>
</div>
```

---

### 表单

```jsx
// 输入框
<input
  type="text"
  className="w-full px-4 py-3 bg-paper border border-border-ink rounded-sm focus:outline-none focus:border-bamboo focus:ring-1 focus:ring-bamboo font-body text-ink-black"
  placeholder="请输入..."
/>

// 选择框
<select className="w-full px-4 py-3 bg-paper border border-border-ink rounded-sm focus:outline-none focus:border-bamboo font-body text-ink-black">
  <option>选项1</option>
  <option>选项2</option>
</select>

// 滑块
<input
  type="range"
  className="w-full h-1 bg-border-ink rounded-lg appearance-none cursor-pointer accent-bamboo"
/>
```

---

### 表格

```jsx
<table className="w-full border-collapse">
  <thead>
    <tr className="bg-paper-light border-b border-border-ink">
      <th className="px-4 py-3 text-left font-body font-semibold text-ink-black">
        列名
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border-ink hover:bg-paper-light transition-colors">
      <td className="px-4 py-3 font-body text-ink-gray">
        数据
      </td>
    </tr>
  </tbody>
</table>
```

---

## 🎭 装饰元素

### 山水背景

```jsx
// 页面底部山水背景
<div className="fixed bottom-0 left-0 w-full h-64 pointer-events-none opacity-8">
  {/* 远山 */}
  <div className="absolute bottom-0 left-0 w-full h-48 opacity-8">
    <svg viewBox="0 0 1440 200" className="w-full h-full">
      <path d="M0 200 L0 120 Q180 80 360 100 T720 80 T1080 110 T1440 90 L1440 200 Z" fill="#2d5a3d"/>
    </svg>
  </div>
</div>
```

### 印章

```jsx
// 右下角印章
<div className="fixed bottom-6 right-6 w-20 h-20 border-2 border-bamboo rounded flex items-center justify-center font-title text-bamboo opacity-60 pointer-events-none">
  股票分析
</div>
```

---

## 🌓 主题切换

### 实现方式

```jsx
// App.jsx
import { useState, useEffect } from 'react';

function App() {
  const [theme, setTheme] = useState('light');

  // 切换主题
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 应用主题到document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-paper text-ink-black dark:bg-paper dark:text-ink-black">
      {/* 你的内容 */}
    </div>
  );
}
```

---

## 📱 响应式设计

### 断点

```jsx
// Tailwind默认断点
sm: 640px   // 平板竖屏
md: 768px   // 平板
lg: 1024px  // 桌面
xl: 1280px  // 大屏幕
```

### 响应式示例

```jsx
// 导航栏
<nav className="flex justify-between items-center px-4 py-3 md:px-8 lg:px-12">
  <h1 className="text-xl md:text-2xl">标题</h1>
</nav>

// 卡片网格
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// 移动端隐藏/显示
<div className="hidden md:block">桌面端显示</div>
<div className="md:hidden">移动端显示</div>
```

---

## 🎨 中国风特色样式

### 诗词装饰

```jsx
<div className="text-center py-10">
  <h1 className="font-title text-4xl tracking-widest mb-4">漏斗选股</h1>
  <p className="font-title text-lg text-bamboo tracking-wider">
    抽丝剥茧寻良骥，沙里淘金得如意
  </p>
</div>
```

### 序号使用中文数字

```jsx
<div>
  <h2 className="font-title text-xl mb-4">壹 · 选择筛选策略</h2>
  {/* 内容 */}
</div>
```

---

## 📊 数据展示

### 评分徽章

```jsx
// 优秀评分（9-10分）
<span className="inline-block px-3 py-1 bg-seal-red bg-opacity-10 text-seal-red border border-seal-red rounded-sm text-sm font-semibold">
  9.5
</span>

// 良好评分（7-8分）
<span className="inline-block px-3 py-1 bg-bamboo bg-opacity-10 text-bamboo border border-bamboo rounded-sm text-sm font-semibold">
  8.2
</span>

// 一般评分（5-6分）
<span className="inline-block px-3 py-1 bg-ochre bg-opacity-10 text-ochre border border-ochre rounded-sm text-sm font-semibold">
  6.5
</span>
```

---

## 🚀 快速开始

### 项目初始化

```bash
# 1. 创建项目
npm create vite@latest stock-analysis -- --template react
cd stock-analysis

# 2. 安装依赖
npm install

# 3. 安装Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. 复制上面的tailwind.config.js
# 5. 在index.css添加Tailwind指令
```

### index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 自定义全局样式 */
body {
  @apply bg-paper text-ink-black transition-colors duration-300;
}

/* 暗色模式 */
.dark body {
  @apply bg-paper text-ink-black;
}
```

---

**文档结束**

**下一步**：开始初始化React项目
