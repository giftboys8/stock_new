# 中国风字体研究与推荐

**研究日期**：2026-01-27
**目的**：为股票分析系统中国风设计找到合适的字体方案

---

## 一、字体需求分析

### 1.1 使用场景

| 场景 | 需求 | 权重 |
|------|------|------|
| 正文 | 清晰易读、端庄典雅 | ⭐⭐⭐⭐⭐ |
| 标题 | 有特色、醒目、书法感 | ⭐⭐⭐⭐ |
| 数据数字 | 清晰、等宽对齐 | ⭐⭐⭐⭐⭐ |
| 装饰文字 | 艺术性强、个性鲜明 | ⭐⭐⭐ |

### 1.2 技术约束

- ✅ 支持中文字符（简体）
- ✅ Web字体加载（考虑性能）
- ✅ 跨平台兼容性
- ✅ 免费或开源（避免版权问题）
- ✅ 文件大小控制（中文字体通常5-10MB）

---

## 二、推荐方案

### 🥇 方案一：Google Fonts - Noto Serif SC（推荐）

**优点**：
- ✅ 完全免费、开源
- ✅ Google CDN加速，国内可用
- ✅ 字重齐全（Light/Regular/Medium/Bold）
- ✅ 宋体风格，端庄典雅
- ✅ 支持繁简体
- ✅ 更新频繁，字符集完整

**缺点**：
- ⚠️ 国内访问可能稍慢（但有镜像）
- ⚠️ 需要加载时间（首次200-500KB）

**使用方式**：
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

```css
:root {
    --font-family: 'Noto Serif SC', 'STSong', 'SimSun', serif;
}
```

**文件大小**：
- Regular: ~180KB
- 全部字重: ~8MB

**适用场景**：正文、标题

---

### 🥈 方案二：思源宋体（Source Han Serif）

**优点**：
- ✅ Adobe + Google联合开发
- ✅ 完全免费、开源
- ✅ 7个字重
- ✅ 字符集超全（支持中日韩）
- ✅ 专业设计，印刷级质量

**缺点**：
- ⚠️ 文件较大（完整版40MB+）
- ⚠️ 需要选择子集减小体积

**使用方式**：
```html
<!-- 使用CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/source-han-serif@1.0.0/SourceHanSerifCN.css">
```

**或使用Web Font转换后的子集**（推荐）

**文件大小**：
- 完整版: 40MB+
- 子集化后: ~500KB（仅常用字）

**适用场景**：标题、正文

---

### 🥉 方案三：系统字体（备选）

**优点**：
- ✅ 无需加载，速度快
- ✅ 兼容性好
- ✅ 系统自带，无版权问题

**缺点**：
- ⚠️ 不同系统显示效果不一致
- ⚠️ 字体质量参差不齐

**字体栈**：
```css
font-family: "STSong", "SimSun", "FangSong", "KaiTi", serif;
```

**系统字体对照**：
| 系统 | 字体 |
|------|------|
| macOS | STSong (华文宋体) |
| Windows | SimSun (中易宋体) |
| Linux | WenQuanYi Micro Hei |

**适用场景**：备用字体（fallback）

---

## 三、书法字体（用于标题、装饰）

### 1. 马善政毛笔字体（Ma Shan Zheng）

**特点**：
- ✅ Google Fonts免费提供
- ✅ 毛笔书法风格
- ✅ 适合标题、装饰
- ✅ 字符集较全（~4000字）

**使用方式**：
```html
<link href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap" rel="stylesheet">
```

```css
.title {
    font-family: 'Ma Shan Zheng', cursive;
}
```

**文件大小**：~150KB

**适用场景**：大标题、诗词、印章

---

### 2. 站酷系列

**站酷庆科黄油体**（可爱风格）：
```html
<link href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap" rel="stylesheet">
```

**站酷快乐体**（活泼风格）：
```html
<link href="https://fonts.googleapis.com/css2?family=ZCOOL+QingKe+HuangYou&display=swap" rel="stylesheet">
```

**适用场景**：不太适合金融产品，过于活泼

---

### 3. 阿里巴巴普惠体

**特点**：
- ✅ 阿里巴巴开源
- ✅ 现代设计，但不够传统
- ✅ 字重齐全

**不推荐原因**：过于现代，不够古典

---

## 四、我的推荐方案

### 📋 组合方案（最优）

```css
/* 标题：书法字体 */
:root {
    --font-title: 'Ma Shan Zheng', 'STKaiti', 'KaiTi', cursive;
}

/* 正文：宋体 */
:root {
    --font-body: 'Noto Serif SC', 'STSong', 'SimSun', serif;
}

/* 数据数字：等宽字体 */
:root {
    --font-mono: 'Noto Sans SC', 'STHeiti', 'SimHei', sans-serif;
}
```

**使用示例**：
```css
.page-title {
    font-family: var(--font-title);
    font-size: 36px;
    font-weight: 400;
}

.body-text {
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.8;
}

.data-number {
    font-family: var(--font-mono);
    font-size: 24px;
    font-weight: 600;
}
```

---

## 五、性能优化建议

### 5.1 字体子集化

**问题**：中文字体文件太大

**解决方案**：
1. **使用font-spider**（推荐）
   ```bash
   npm install -g font-spider
   font-spider index.html
   ```

2. **在线工具**：Font Squirrel
   - 上传完整字体
   - 选择需要的字符
   - 下载子集化字体

3. **仅加载常用字**
   - 3500常用字
   - 文件大小可减至~300KB

### 5.2 预加载

```html
<link rel="preload" href="fonts/noto-serif-sc.woff2" as="font" type="font/woff2" crossorigin>
```

### 5.3 字体显示策略

```css
font-display: swap; /* 立即使用备用字体，加载后切换 */
font-display: optional; /* 短时间内未加载则放弃 */
```

**推荐**：`font-display: swap`

---

## 六、具体实施步骤

### 步骤1：使用Google Fonts（最快）

```html
<head>
    <!-- 预连接 -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <!-- Noto Serif SC（正文） -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;600&display=swap" rel="stylesheet">

    <!-- Ma Shan Zheng（标题） -->
    <link href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap" rel="stylesheet">
</head>
```

```css
:root {
    --font-title: 'Ma Shan Zheng', 'STKaiti', 'KaiTi', cursive;
    --font-body: 'Noto Serif SC', 'STSong', 'SimSun', serif;
}
```

### 步骤2：本地化（性能优化）

1. 下载字体文件
2. 子集化（font-spider）
3. 上传到项目
4. 修改CSS引用

---

## 七、备选方案：国内CDN

如果Google Fonts访问慢，可使用：

### 1. cdnjs

```html
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
```

### 2. BootCDN

```html
<link href="https://cdn.bootcdn.net/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
```

### 3. 七牛云、阿里云CDN

可自行托管字体文件

---

## 八、我的最终建议

### ✅ 推荐方案：Google Fonts + 本地备选

**第一阶段（demo期）**：
```html
<!-- 直接使用Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;600&family=Ma+Shan+Zheng&display=swap" rel="stylesheet">
```

**第二阶段（优化期）**：
```html
<!-- 下载并本地托管 -->
<link href="/fonts/noto-serif-sc-subset.woff2" rel="stylesheet">
<link href="/fonts/ma-shan-zheng-subset.woff2" rel="stylesheet">
```

### 📊 性能对比

| 方案 | 首次加载 | 后续访问 | 国内速度 | 推荐度 |
|------|---------|---------|---------|-------|
| Google Fonts | 500KB | 缓存 | 中等 | ⭐⭐⭐⭐⭐ |
| 本地托管 | 300KB | 缓存 | 快 | ⭐⭐⭐⭐ |
| 系统字体 | 0KB | 0KB | 最快 | ⭐⭐⭐ |

**综合建议**：先Google Fonts验证效果，满意后再本地化

---

## 九、实际应用示例

### 标题样式

```css
/* 大标题 */
h1 {
    font-family: var(--font-title);
    font-size: 36px;
    font-weight: 400;
    letter-spacing: 8px;
    color: var(--text-primary);
}

/* 小标题 */
h2 {
    font-family: var(--font-body);
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 2px;
}

/* 装饰诗词 */
.verse {
    font-family: var(--font-title);
    font-size: 18px;
    letter-spacing: 4px;
}
```

### 正文样式

```css
/* 正文 */
p {
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.8;
    color: var(--text-secondary);
}

/* 列表 */
li {
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.9;
}
```

---

## 十、其他注意事项

### 1. 版权问题
- ✅ Google Fonts：开源免费
- ✅ 马善政：开源免费
- ⚠️ 商用付费字体：谨慎使用

### 2. 跨平台测试
在不同操作系统和浏览器上测试字体渲染效果

### 3. 加载降级
```css
/* 优雅降级 */
body {
    font-family: var(--font-body); /* 如果加载失败，使用系统字体 */
}
```

---

**文档结束**

**下一步**：创建CSS山水元素
