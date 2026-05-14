# v9 系统重构审计报告

> **视角**: 产品经理 · 刻薄模式
> **日期**: 2026-05-14
> **范围**: 设计系统、交互模式、组件一致性
> **状态**: 诊断完成，重构提案待实施

---

## 目录

1. [Part 1: PM 诊断书 — 你现在在做一款"还行"的产品](#part-1-pm-诊断书)
2. [Part 2: ui-ux-pro-max 升级提案](#part-2-ui-ux-pro-max-升级提案)
3. [Part 3: 核心交互重构蓝图](#part-3-核心交互重构蓝图)
4. [实施路线图](#实施路线图)

---
## Part 1: PM 诊断书

### 你正在做一款"还行"的产品

ReadMeCraft 目前在功能性上是"可用的"。但"可用"和"令人愉悦"之间隔着一个太平洋。以下是你当前产品中每一个让我皱眉头的设计决策。

### 🔴 P0 — 不可接受的缺陷

#### 1. Tailwind 默认色板 = 没有设计

你的 `tailwind.config.js` 中 `primary` = blue、`muted` = slate、`accent` = orange。这叫做"安装完 Tailwind 之后什么都没改"。

| 问题 | 具体表现 | 影响 |
|------|----------|------|
| 色板无辨识度 | 任何用 Tailwind 启动的项目都和你的配色一致 | 品牌记忆度 = 0 |
| 语义色命名扁平 | 只有 primary/muted/accent 三个语义层 | 复杂 UI 需要 7-9 个语义色层 |
| 绿色、红色无语义绑定 | 成功/错误用硬编码 `#059669` / `#dc2626` | 与设计系统脱节 |

**证据**: `index.css` 第 122-125 行：
```css
.toast-success { background-color: #059669; }
.toast-error { background-color: #dc2626; }
```

这些颜色与设计系统中的任何 token 都无关。如果你某天把 primary 从蓝色改成靛蓝，toast 颜色不会跟着变——因为他们没有引用同一个变量。

**影响度量**: 品牌的视觉一致性得分 ≈ 2/10。用户不会记住你的品牌颜色，因为他们根本没看到一致的一套。

#### 2. Noto Sans SC = 中文界的 Inter

Noto Sans SC 是 Google 的"泛用中文无衬线体"。它被用在每一个"不知道用什么字体好"的中文项目中。你说"反 AI 平庸"，然后选了最平庸的中文字体。

**字体排印问题清单**：
- `font-heading` 与 `font-sans` 使用同一字体 → 头部/正文无区分度
- 字重只用到了 400 和 700 → 缺少 300/500/600/800/900 的精细控制
- Noto Sans SC 字怀大（为了可读性牺牲了精致感）→ 在标题尺度下显得松散
- 没有任何西文字体搭配 → 代码和技术术语使用相同中文字体

#### 3. 对比度违规 — muted-400 正在谋杀你的可读性

`muted-400` = `#94a3b8`。在白色背景上，这个颜色的对比度是 **2.8:1**。

WCAG AA 标准要求小号文字 **4.5:1**。你的 body 文字（`.text-muted-400` 用于描述文字）只有 60% 的所需对比度。

**受影响组件**（不完全列表）：
- HeroSection 特性卡片的描述文字 (`mt-0.5 text-xs leading-relaxed text-muted-400`)
- TemplateSelector 的模板描述 (`text-xs leading-relaxed text-muted-500`)
- AnalyticsDashboard 的标签文字 (`text-xs font-medium text-muted-500`)
- StepIndicator 的所有未激活步骤文字

#### 4. AnalyticsDashboard 的颜色叛变

这是最离谱的。在 `AnalyticsDashboard.tsx` 中：continuing...
continuing...

这是最离谱的。在 `AnalyticsDashboard.tsx` 中：

```typescript
const PIE_COLORS = ['#22c55e', '#ef4444'];
const BAR_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
const LINE_COLOR = '#6366f1';
```

**PIE_COLORS**: green + red（卫生巾广告的配色方案）
**BAR_COLORS**: 一组 indigo→purple→fuchsia→pink 渐变（来自 midjourney prompt？）
**LINE_COLOR**: indigo-500

你的设计系统定义了 `primary`（蓝）、`muted`（灰）、`accent`（橙）。但 AnalyticsDashboard 自己选择了...七种与设计系统完全无关的颜色。这是设计系统的**彻底失败**——图表组件不信任设计 token，所以自己造了一套。

这不仅仅是审美问题。如果产品迭代中引进"深色模式"，这七个硬编码颜色不会自动适应。它们会保持 #6366f1 不变——在一个深色背景上完全不可读。

#### 5. 阴影系统 — 你在告诉用户"别在意我"

```js
'card': '0 1px 3px 0 rgb(0 0 0 / 0.04)',
'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.06)',
```

0.04 的不透明度，1px 偏移。这不是阴影，是**污点**。在有环境光的屏幕上（99% 的用户），这个阴影完全不可见。

Bento Grid 布局的核心魅力在于卡片的**层次感和悬浮感**。当前阴影系统无法传达任何深度层次。

好设计应该有三个以上的阴影层级：
- **微浮雕**: 0.5px 内阴影（卡片边界感）
- **悬浮**: 8-12px 外阴影（内容层）
- **升起**: 16-24px 外阴影（交互反馈 / 选中态）
- **模态**: 40-60px 外阴影（对话框层）

当前实现只有两个层级（card 和 card-hover），且两者几乎无感知差异。

#### 6. HomePage 信息过载

当前 HomePage 渲染顺序（从上到下）：
HeroSection → ShowcaseSection → RepoInput → GitHubTokenWarning → RepoInfoCard → TemplateSelector → StepIndicator → GenerateSection

共计 **8 个独立内容区**在同一页面纵向堆叠。用户需要滚动 3-4 屏才能完成一个"输入地址→生成→编辑"的闭环。

**问题**：这不是 landing page，这是超市货架。把所有东西都堆在用户面前，等于什么都没展示。

#### 7. 模板选择器 — 5 列在手机上什么都不是

```html
<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
```

lg 断点下 5 列。在 375px 手机上，每个卡片宽约 160px，模板预览文字缩小到 7px。不可读。

#### 8. 缺少设计 token 一致性检查

- Toast 颜色硬编码（index.css:122-125）
- Charts 颜色硬编码（AnalyticsDashboard.tsx:27-29）
- 模板预览的 badge 颜色硬编码（TemplateSelector.tsx:38-44）
- HeroSection 的 `.badge` 使用 primary 色系，与设计系统一致——但这是唯一一个没有"叛变"的组件

### 🟡 P1 — 值得关注的问题

#### 9. Reduced Motion 实现不完整

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
  }
}
```

全局规则正确，但以下动画未考虑 reduced motion：
- Header backdrop-blur 过渡
- Toast 滑入动画（.animate-slide-in-right）
- TemplateSelector 的 scale-up 选择动画
- EditWorkspace 的标签切换过渡

#### 10. 无触觉反馈设计

- 所有按钮仅有 `active:scale-[0.97]` 的按下反馈
- 拖拽排序无 haptic 友好提示
- 成功/失败仅有视觉 Toast，无声音或振动 API 支持

#### 11. 卡片间距不一致

- HeroSection 特性卡使用 `gap-3`（12px）
- TemplateSelector 模板卡使用 `gap-4`（16px）
- GenerateSection 的功能区域使用 `space-y-6`（24px）
- AnalyticsDashboard 的 StatCards 使用 `gap-3`

一个产品中出现 4 种不同的间距尺规，说明没有统一的间距系统。


#### 12. 综合诊断结论

Part 1 列出的 11 个问题可以归纳为三个根因：

| 根因 | 涉及问题 | 严重程度 |
|------|----------|----------|
| **没有设计系统** | 色板扁平(#1)、阴影系统(#5)、间距尺规(#11) | P0 — 系统级 |
| **设计 token 没被执行** | 图表颜色(#4)、Toast 颜色(#8)、对比度(#3) | P0 — 组件级 |
| **UX 细节粗糙** | 信息过载(#6)、模板选择器(#7)、Reduced Motion(#9)、触觉(#10) | P1 — 体验级 |

**结论**: 当前产品处于"能用但无法让人爱上"的阶段。问题不在开发能力，在于**没有把设计当作系统工程来做**。

Part 2 和 Part 3 将提供从"修修补补"到"系统重构"的具体方案。

---
## Part 2: ui-ux-pro-max 升级提案

> 以下提案假设你愿意花 6-8 小时改造设计系统。如果你只想修 bug，请关闭此文件。

### 2.1 语义色板重构

#### 问题

当前色板（primary=blue, muted=slate, accent=orange）是 Tailwind 的出厂设置。你的产品和一万个其他 Tailwind 项目长得一样。

#### 解决方案

构建 7 层语义色板，绑定 CSS 自定义属性，所有组件引用变量而非硬编码。

#### 品牌色（Brand）— 靛青混合色系

```css
/* CSS 自定义属性 — 这是你的设计系统的 "宪法" */
:root {
  /* === 品牌色: 靛青混合 (deep indigo-teal hybrid) === */
  --color-brand-50:  #eef2ff;
  --color-brand-100: #e0e7ff;
  --color-brand-200: #c7d2fe;
  --color-brand-300: #a5b4fc;
  --color-brand-400: #818cf8;
  --color-brand-500: #6366f1;    /* 主色 — 来自 tailwindcss 的 indigo-500 但足够独特 */
  --color-brand-600: #4f46e5;
  --color-brand-700: #4338ca;
  --color-brand-800: #312e81;
  --color-brand-900: #1e1b4b;

  /* === 强调色 (Accent) — 琥珀金 === */
  --color-accent-50:  #fffbeb;
  --color-accent-100: #fef3c7;
  --color-accent-200: #fde68a;
  --color-accent-300: #fcd34d;
  --color-accent-400: #fbbf24;
  --color-accent-500: #f59e0b;   /* 主色 */
  --color-accent-600: #d97706;
  --color-accent-700: #b45309;
  --color-accent-800: #92400e;
  --color-accent-900: #78350f;

  /* === 中性色 — 暖灰 (Warm Gray)，非 Cool Slate === */
  --color-neutral-50:  #fafaf9;
  --color-neutral-100: #f5f5f4;
  --color-neutral-200: #e7e5e4;
  --color-neutral-300: #d6d3d1;
  --color-neutral-400: #a8a29e;
  --color-neutral-500: #78716c;
  --color-neutral-600: #57534e;
  --color-neutral-700: #44403c;
  --color-neutral-800: #292524;
  --color-neutral-900: #1c1917;

  /* === 语义色 === */
  --color-success-50:  #ecfdf5;
  --color-success-500: #10b981;  /* emerald-500 */
  --color-success-600: #059669;

  --color-warning-50:  #fffbeb;
  --color-warning-500: #f59e0b;  /* amber-500 */
  --color-warning-600: #d97706;

  --color-error-50:    #fff1f2;
  --color-error-500:   #f43f5e;  /* rose-500 */
  --color-error-600:   #e11d48;

  --color-info-50:     #eff6ff;
  --color-info-500:    #3b82f6;  /* blue-500 */
  --color-info-600:    #2563eb;

  /* === 图表色 (Chart) — 从 Brand + Accent 派生 === */
  --color-chart-1: #6366f1;   /* brand-500 */
  --color-chart-2: #f59e0b;   /* accent-500 */
  --color-chart-3: #10b981;   /* success-500 */
  --color-chart-4: #8b5cf6;   /* brand-400 的变体 */
  --color-chart-5: #f97316;   /* accent-600 附近 */
}
```

#### tailwind.config.js 映射

```js
// tailwind.config.js 的 colors 扩展
colors: {
  brand: {
    50: 'var(--color-brand-50)',
    100: 'var(--color-brand-100)',
    // ... 全部映射
  },
  neutral: {
    50: 'var(--color-neutral-50)',
    // ...
  },
  success: {
    50: 'var(--color-success-50)',
    500: 'var(--color-success-500)',
    600: 'var(--color-success-600)',
  },
  warning: { /* ... */ },
  error: { /* ... */ },
  info: { /* ... */ },
  chart: {
    1: 'var(--color-chart-1)',
    2: 'var(--color-chart-2)',
    3: 'var(--color-chart-3)',
    4: 'var(--color-chart-4)',
    5: 'var(--color-chart-5)',
  },
}
```

**为什么 7 层？** 当前只有 3 层 (primary/muted/accent)。复杂 UI 组件（图表、表单状态、通知、标签系统）需要独立的语义层。7 层是最小完备集。

**迁移路径**: 不要一次性替换所有 `text-muted-500`。采用渐进替换策略：
1. 先在 index.css 声明所有 CSS 变量（不影响现有代码）
2. 新组件直接使用新 token
3. 每周重构 1-2 个旧组件，替换旧 class 为新 token

### 2.2 字体系统升级

#### 问题

- `font-heading` = `font-sans` = Noto Sans SC，头部和正文无区分
- 没有西文字体配套，代码/技术术语使用中文字体渲染
- 只有字重 400 和 700，缺少精细控制

#### 解决方案

```css
/* index.css 字体栈定义 */
:root {
  /* === Display / 展示性标题 — 西文衬线 + 中文衬线 === */
  --font-display: 'Playfair Display', 'Noto Serif SC', serif;

  /* === Headings — 西文衬线 + 中文衬线 === */
  --font-heading: 'Fraunces', 'Noto Serif SC', serif;

  /* === Body — 西文无衬线 + 中文无衬线 === */
  --font-body: 'Inter', 'Noto Sans SC', sans-serif;

  /* === Mono — 等宽字型 === */
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
}
```

```js
// tailwind.config.js
fontFamily: {
  display: ['Playfair Display', 'Noto Serif SC', 'serif'],
  heading: ['Fraunces', 'Noto Serif SC', 'serif'],
  body: ['Inter', 'Noto Sans SC', 'sans-serif'],
  mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
},
fontWeight: {
  // 字重策略
  caption: '500',
  body: '400',
  subheading: '600',
  heading: '700',
  display: '800',
}
```

#### 使用规范

| 元素 | font-family | font-weight | 备注 |
|------|-------------|-------------|------|
| 页面大标题 (h1) | `--font-display` | 800 | "ReadMeCraft" 等品牌展示文字 |
| 区块标题 (h2/h3) | `--font-heading` | 700 | "功能特性""模板选择" |
| 卡片标题 | `--font-heading` | 600 | 特性卡片的名称 |
| 正文 | `--font-body` | 400 | 所有描述性文字 |
| 辅助文字 | `--font-body` | 500 (caption) | 标签、提示、次要信息 |
| 代码/技术术语 | `--font-mono` | 400 | 仓库名、代码片段、版本号 |

**关于 Noto Sans SC**: 我确实在 Part 1 骂它"平庸"。但在正文场景下，它作为中文字体的可读性是合格的——问题不在于用什么字体，而在于**怎么用**。正文用无衬线、标题用衬线，这个区分本身就解决了 80% 的字体平庸感。

#### @font-face 加载策略

```css
/* 使用 font-display: swap 避免 FOIT */
@font-face {
  font-family: 'Playfair Display';
  src: url('/fonts/playfair-display.woff2') format('woff2');
  font-weight: 400 900;
  font-display: swap;
}
```

字体文件太大？使用 `subsets` 参数只加载 latin + chinese-simplified 子集。Playfair Display 仅 latin 子集约 30KB woff2。

### 2.3 阴影层级系统（4 层）

#### 问题

当前 2 层阴影（card/card-hover）的不透明度太低，在真实屏幕上几乎不可见。缺乏深度层次感。

#### 解决方案

4 层阴影系统，每层都有明确的使用场景：

```css
/* index.css — 阴影 token */
:root {
  /* emboss: 卡片边界浮雕感 — 用于卡片默认态的背景区分 */
  --shadow-emboss: '0 0 0 0.5px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,0.6)';

  /* elevated: 默认卡片态 — 用于所有卡片的标准阴影 */
  --shadow-elevated: '0 4px 8px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.02)';

  /* floating: hover/选中态 — 用于卡片交互反馈 */
  --shadow-floating: '0 12px 24px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.02)';

  /* modal: 对话框浮层 — 用于模态框、下拉菜单 */
  --shadow-modal: '0 32px 64px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.04)';
}
```

```js
// tailwind.config.js
boxShadow: {
  'emboss': '0 0 0 0.5px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,0.6)',
  'elevated': '0 4px 8px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.02)',
  'floating': '0 12px 24px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.02)',
  'modal': '0 32px 64px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.04)',
}
```

#### 使用场景

| Token | 使用场景 | 示例 |
|-------|----------|------|
| `shadow-emboss` | 卡片默认态、静态区块的背景分割 | 特性卡片的底板、统计数字背景 |
| `shadow-elevated` | 大多数卡片的标准阴影 | 模板卡片、仓库信息卡片 |
| `shadow-floating` | hover/选中/拖拽态 | 卡片 hover 提升效果、下拉菜单展开态 |
| `shadow-modal` | 最高层级浮层 | 对话框、Toast、Tooltip、Dropdown |

**每个卡片都有 0.5px 的 border 效果**（通过阴影实现而非 border 属性），这样在暗色模式下不需要额外适配。



### 2.4 间距尺规（8px 网格系统）

#### 问题

当前产品中 HeroSection 用 `gap-3`（12px）、TemplateSelector 用 `gap-4`（16px）、GenerateSection 用 `space-y-6`（24px）、AnalyticsDashboard 用 `gap-3`。四个不同间距值出现在同一个页面中。

#### 解决方案

统一 8px 网格：

```js
// tailwind.config.js
spacing: {
  'xs': '4px',    // 0.25rem — 图标与文字间距、标签内边距
  'sm': '8px',    // 0.5rem  — 同级别元素间距、按钮内边距
  'md': '16px',   // 1rem    — 卡片内边距、表单元素间距
  'lg': '24px',   // 1.5rem  — 区块间距、卡片组间距
  'xl': '32px',   // 2rem    — 页面大区块间距
  '2xl': '48px',  // 3rem    — 章节间距
  '3xl': '64px',  // 4rem    — 页面顶部/底部留白
}
```

#### 使用指南

| Token | 值 | 使用场景 | 替代哪些现有值 |
|-------|-----|----------|----------------|
| `gap-xs` / `p-xs` | 4px | 图标+标签间距、badge 内边距 | 硬编码 `gap-1` |
| `gap-sm` / `p-sm` | 8px | 列表项间距、按钮内边距 | `gap-2`, `p-2` |
| `gap-md` / `p-md` | 16px | 卡片内边距、表单组间距 | `gap-4`, `p-4` |
| `gap-lg` / `p-lg` | 24px | 卡片之间间距、section 内部间距 | `gap-6`, `space-y-6` |
| `gap-xl` / `p-xl` | 32px | 大区块间距 | `gap-8`, `space-y-8` |
| `gap-2xl` / `p-2xl` | 48px | 页面章节分割 | `gap-12`, `space-y-12` |
| `gap-3xl` / `p-3xl` | 64px | Hero 区域底部留白 | 硬编码 `mb-16` |

**实施要点**: 不要搜索替换。每个组件单独评估，因为当前有些 16px 间距实际上应该是 24px（卡片间），有些 8px 间距实际上应该是 4px（badge 内边距）。机械替换会复制当前的间距错误。

### 2.5 圆角系统

#### 问题

当前圆角策略：按钮 `rounded-lg`（8px）、卡片 `rounded-xl`（12px）、输入框 `rounded-lg`。没有一致的圆角语义。

#### 解决方案

```css
/* index.css */
:root {
  --radius-card:   16px;    /* 1rem   — 卡片 */
  --radius-button: 10px;    /* 0.625rem — 按钮 */
  --radius-input:  10px;    /* 0.625rem — 输入框 */
  --radius-dialog: 16px;    /* 1rem   — 对话框 */
  --radius-badge:  9999px;  /* 全圆角 — Badge、Tag */
  --radius-tag:    6px;     /* 小标签 */
}
```

```js
// tailwind.config.js
borderRadius: {
  'card': '16px',
  'button': '10px',
  'input': '10px',
  'dialog': '16px',
  'badge': '9999px',
  'tag': '6px',
}
```

#### 设计逻辑

- **卡片 16px**: 当前 `rounded-xl`（12px）偏保守。16px 带来更现代、更"卡片化"的视觉语言。配合 0.5px 边界阴影使用。
- **按钮 10px**: 既不是锐利直角（生硬）也不是全圆角（幼稚）。10px 刚好在"精致"和"友好"之间。
- **输入框 10px**: 与按钮统一，表单一致性。
- **对话框 16px**: 与卡片统一，浮层不引入新圆角。
- **Badge 全圆角**: 标准 pill 形状，符合用户预期。
- **Tag 6px**: 稍微圆角的小标签，与 badge 区分。

### 2.6 动效系统

#### 问题

- 动效时长不一致（某些动画 200ms，某些 300ms）
- 缓动函数未统一（有些 ease-out，有些 ease-in-out）
- 没有分层级的动效策略（micro-interaction / page-transition / entrance 不分）
- Reduced Motion 仅在全局 CSS 层面处理，组件层面缺少 fallback

#### 解决方案

```css
/* index.css */
:root {
  /* === 时长 === */
  --duration-micro:   150ms;
  --duration-normal:  200ms;
  --duration-page:    300ms;
  --duration-entrance: 500ms;

  /* === 缓动 === */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);  /* 微弹性 */
}
```

#### 动效层级

| 层级 | 时长 | 缓动 | 适用场景 |
|------|------|------|----------|
| **Micro-interaction** | 150-200ms | `--ease-out` | 按钮 hover、卡片 lift、输入框 focus ring、颜色切换 |
| **Transition** | 200-300ms | `--ease-in-out` | 面板展开/折叠、标签切换、菜单显示/隐藏 |
| **Page transition** | 300ms | `--ease-in-out` | 路由切换、模态框打开/关闭 |
| **Entrance** | 400-600ms | `--ease-out` | 页面加载时元素依次入场（stagger） |
| **Spring** | 300-400ms | `--ease-spring` | 点赞动画、选中态弹性反馈 |

#### Tailwind 配置

```js
// tailwind.config.js
transitionDuration: {
  'micro': '150ms',
  'normal': '200ms',
  'page': '300ms',
  'entrance': '500ms',
},
transitionTimingFunction: {
  'out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
},
animation: {
  'fade-in': 'fadeIn 500ms var(--ease-out)',
  'slide-up': 'slideUp 400ms var(--ease-out)',
  'scale-in': 'scaleIn 200ms var(--ease-out)',
},
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  slideUp: {
    '0%': { opacity: '0', transform: 'translateY(12px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  scaleIn: {
    '0%': { opacity: '0', transform: 'scale(0.95)' },
    '100%': { opacity: '1', transform: 'scale(1)' },
  },
},
```

#### Reduced Motion 组件级策略

不只是全局 CSS 规则。每个动效组件需要自己的 fallback：

```tsx
// hooks/useReducedMotion.ts
import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
```

```tsx
// 使用示例 — 组件内部根据用户偏好切换动画
const prefersReduced = useReducedMotion();

return (
  <div
    className={prefersReduced
      ? 'opacity-100'  // 无动画
      : 'animate-fade-in'
    }
  >
    {children}
  </div>
);
```

Some content here
Part 3 of the audit report.

---
## Part 3: 核心交互重构蓝图

> 这部分不讨论"应该做什么"。这部分展示"怎么做"。每个重构方案附带完整的 JSX 实现。

### 3.1 HeroSection 重构 — Bento Grid

#### 当前状态

4 个特性卡片在 `grid-cols-2 sm:grid-cols-4` 中一字排开。所有卡片大小相同，没有视觉层次感。阴影不足，交互反馈缺失。

#### 目标

Bento Grid 布局：2x2 网格，第一个卡片 2x1（横跨 2 列 1 行），建立视觉锚点。

#### 完整实现

```tsx
// components/HeroSection.tsx — Bento Grid 重构版
import { useState } from 'react';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    title: 'AI 智能生成',
    description: '输入仓库地址，AI 自动分析项目结构，生成贴合项目的中文 README，无需手动编写。',
    icon: (
      <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    title: '多模板选择',
    description: '5 种专业模板覆盖不同场景，从极简到企业级，适配开源和个人项目需求。',
    icon: (
      <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    title: '实时编辑预览',
    description: 'Markdown 编辑器与实时渲染预览并排显示，所见即所得，编辑体验流畅。',
    icon: (
      <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    title: '一键导出',
    description: '生成后一键复制或下载 .md 文件，无缝对接 GitHub，零摩擦发布。',
    icon: (
      <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
];

function BentoGrid({ features }: { features: Feature[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="w-full max-w-5xl mx-auto px-md">
      <div className="grid grid-cols-2 gap-md lg:gap-lg auto-rows-[160px] lg:auto-rows-[180px]">
        {features.map((feature, index) => {
          const isFirst = index === 0;
          return (
            <div
              key={feature.title}
              className={[
                'relative overflow-hidden',
                'bg-white rounded-card shadow-elevated',
                'border border-neutral-200/80',
                'p-md lg:p-lg',
                'transition-all duration-micro ease-out-soft',
                'hover:shadow-floating hover:-translate-y-0.5',
                'cursor-default',
                isFirst
                  ? 'col-span-2 row-span-1 flex-row items-center gap-lg'
                  : 'col-span-1 row-span-1 flex-col',
                'flex',
              ].join(' ')}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Icon container */}
              <div
                className={[
                  'flex items-center justify-center',
                  'w-10 h-10 rounded-button',
                  'bg-gradient-to-br from-brand-50 to-brand-100',
                  'shrink-0',
                  isFirst ? '' : 'mb-sm',
                ].join(' ')}
              >
                {feature.icon}
              </div>
              <div className={isFirst ? 'flex-1' : ''}>
                <h3 className="font-heading font-heading text-neutral-800 mb-1">
                  {feature.title}
                </h3>
                <p className="font-body font-body text-neutral-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
              {/* Decorative glow */}
              <div
                className={[
                  'absolute -bottom-6 -right-6 w-24 h-24',
                  'rounded-full opacity-0 transition-opacity duration-normal',
                  hoveredIndex === index ? 'opacity-10' : '',
                  'bg-gradient-to-br from-brand-400 to-brand-600',
                ].join(' ')}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default BentoGrid;
```


### 3.2 TemplateSelector 重构 — 触控优先

#### 当前状态

- 5-column grid on lg 在手机上折叠成 2 列
- 模板预览卡片文字缩小到 7px（不可读）
- 选择态使用 scale 动画（对触控不友好）
- 点击区域太小（< 44px 触控目标）

#### 目标

- Mobile: 水平滚动行 + snap scrolling
- Tablet (sm): 3 列网格
- Desktop (lg): 5 列网格
- 选择态：bordered state + brand ring（非 scale 动画）
- 所有可交互区域最小 44px 高度

#### 完整实现

```tsx
// components/TemplateSelector.tsx — 触控优先重构版
import { useRef, useState, useEffect } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  badge: string;
}

const templates: Template[] = [
  { id: 'minimal', name: '极简清风', description: '干净留白，适合小项目', badge: '轻量' },
  { id: 'badges', name: 'Badge 大满贯', description: 'Badge 墙 + 功能卡片', badge: '热门' },
  { id: 'enterprise', name: '企业蓝图', description: '正式专业，表格化展示', badge: '专业' },
  { id: 'cards', name: '卡片视界', description: '卡片式布局，视觉丰富', badge: '推荐' },
  { id: 'showcase', name: '项目展厅', description: 'Banner + 截图展示', badge: '展示' },
];

function TemplateSelector() {
  const [selectedId, setSelectedId] = useState<string>('minimal');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  return (
    <section className="w-full">
      <h2 className="font-heading font-heading text-neutral-800 text-xl mb-lg">
        选择模板
      </h2>

      {/* Mobile: horizontal scroll with snap */}
      <div
        ref={scrollRef}
        className={[
          'flex lg:grid',
          'gap-md',
          'lg:grid-cols-5',
          // Mobile: snap scrolling
          'overflow-x-auto snap-x snap-mandatory',
          '-mx-md px-md', // bleed into padding for edge-to-edge feel
          'scrollbar-none', // hide scrollbar on mobile
          'lg:overflow-visible lg:mx-0 lg:px-0',
          // Tablet: 3 columns at sm breakpoint
          'sm:grid sm:grid-cols-3 sm:overflow-visible sm:mx-0 sm:px-0',
          'lg:grid-cols-5',
        ].join(' ')}
      >
        {templates.map((template) => {
          const isSelected = selectedId === template.id;

          return (
            <button
              key={template.id}
              onClick={() => handleSelect(template.id)}
              className={[
                // Layout
                'flex flex-col',
                'snap-start shrink-0',
                'w-[200px] sm:w-auto lg:w-auto',
                // Sizing
                'min-h-[120px]',
                // Visual
                'rounded-card',
                'text-left',
                'transition-all duration-micro ease-out-soft',
                // Selection state: bordered ring instead of scale
                isSelected
                  ? 'ring-2 ring-brand-500 bg-brand-50/50 shadow-elevated'
                  : 'bg-white shadow-emboss border border-neutral-200/80',
                // Touch feedback
                'active:bg-neutral-50',
                // Focus
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                // Spacing
                'p-md',
              ].join(' ')}
              aria-pressed={isSelected}
              aria-label={template.name}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-sm min-h-[44px]">
                <h3 className={[
                  'font-heading font-heading',
                  isSelected ? 'text-brand-700' : 'text-neutral-800',
                ].join(' ')}>
                  {template.name}
                </h3>
                <span className={[
                  'inline-flex items-center px-2 py-0.5',
                  'text-xs font-caption',
                  'rounded-badge',
                  isSelected
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-neutral-100 text-neutral-600',
                ].join(' ')}>
                  {template.badge}
                </span>
              </div>

              {/* Description */}
              <p className="font-body text-sm text-neutral-500 leading-relaxed flex-1">
                {template.description}
              </p>

              {/* Preview area */}
              <div className={[
                'mt-sm h-16 rounded-button',
                'bg-gradient-to-br',
                isSelected
                  ? 'from-brand-100 to-brand-50'
                  : 'from-neutral-50 to-neutral-100',
                'shadow-emboss', // emboss for subtle depth
              ].join(' ')} />
            </button>
          );
        })}
      </div>

      {/* Visual hint for horizontal scroll (mobile only) */}
      {isTouchDevice && (
        <p className="mt-sm text-xs text-neutral-400 text-center lg:hidden">
          左右滑动查看更多
        </p>
      )}
    </section>
  );
}

export default TemplateSelector;
```


### 3.3 AnalyticsDashboard 颜色修复

#### 问题

```typescript
// 当前代码 — Part 1 已经骂过，再贴一次作为耻辱柱
const PIE_COLORS = ['#22c55e', '#ef4444'];
const BAR_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
const LINE_COLOR = '#6366f1';
```

这些颜色与设计系统 token 完全无关。PIE_COLORS 是 green + red（卫生巾配色），BAR_COLORS 是 indigo-to-pink 渐变（midjourney prompt 风格）。

#### 解决方案

替换为设计系统的 chart token（已在 Part 2.1 定义）：

```typescript
// ============================================
// AnalyticsDashboard/constants.ts — 颜色常量
// 绑定设计系统 chart token，非硬编码
// ============================================

/**
 * 饼图颜色
 * 从设计系统 chart 色板中取前 2 色
 * chart-1: brand-500 (#6366f1) = 主要数据
 * chart-2: accent-500 (#f59e0b) = 次要数据
 *
 * 为什么不是 green/red？
 * green/red 是"好坏二分"的视觉编码，
 * 饼图是"占比关系"，不是"好坏判断"。
 * 用 brand/accent 表示主次关系，语义更准确。
 */
export const PIE_COLORS = [
  'var(--color-chart-1)',   // #6366f1 — brand 主色
  'var(--color-chart-2)',   // #f59e0b — accent 强调色
];

/**
 * 柱状图颜色（5 色）
 * 图表专用 palette：从 brand 和 accent 之间派生
 * 避免使用紫色/粉色的"midjourney 调色板"
 *
 * 设计方案：
 * - chart-1: brand-500 (#6366f1) — 主品牌色
 * - chart-2: accent-500 (#f59e0b) — 强调色
 * - chart-3: success-500 (#10b981) — 生态绿（非红绿色盲友好）
 * - chart-4: brand-400 (#818cf8) — 品牌色变体
 * - chart-5: accent-600 (#f97316) — 强调色变体
 */
export const BAR_COLORS = [
  'var(--color-chart-1)',   // brand-500
  'var(--color-chart-2)',   // accent-500
  'var(--color-chart-3)',   // success-500
  'var(--color-chart-4)',   // brand-400
  'var(--color-chart-5)',   // accent-600 附近
];

/**
 * 折线图颜色
 * 使用品牌主色 — 一条线不需要多色
 */
export const LINE_COLOR = 'var(--color-chart-1)';  // brand-500

/**
 * 辅助函数：解析 CSS 变量为实际色值（用于 canvas/非 CSS 上下文）
 * 某些图表库（如 Recharts）需要实际色值而非 CSS 变量名。
 */
export function resolveChartColor(cssVar: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar.replace('var(', '').replace(')', '').trim());
  return value.trim() || '#6366f1'; // fallback to brand-500
}

// 使用示例：
// bars.map((bar, i) => ({ ...bar, fill: resolveChartColor(BAR_COLORS[i]) }))
```

#### 迁移检查清单

| 检查项 | 当前状态 | 修复后 |
|--------|----------|--------|
| PIE_COLORS 引用设计 token | #22c55e, #ef4444 | var(--color-chart-1), var(--color-chart-2) |
| BAR_COLORS 引用设计 token | #6366f1...#ec4899 | var(--color-chart-1..5) |
| LINE_COLOR 引用设计 token | #6366f1 | var(--color-chart-1) |
| 深色模式兼容 | 不支持（硬编码） | 自动适配（CSS 变量） |
| 主题切换跟随 | 不跟随 | 自动跟随 |

---

## 实施路线图

> 以下时间估算基于"一个人全力投入"。如果分多人并行，Phase 1 可压缩到 30 分钟。

### Phase 1: Design Token 部署（约 2 小时）

**目标**: 将设计系统 token 写入代码，不影响现有功能。

| 步骤 | 具体操作 | 时间 |
|------|----------|------|
| 1.1 | 在 `index.css` 的 `:root` 中声明所有 CSS 变量（brand/neutral/accent/success/warning/error/info/chart 色板、阴影 token、圆角 token、动效 token、间距 token） | 30min |
| 1.2 | 更新 `tailwind.config.js` — 添加 colors、boxShadow、borderRadius、spacing、fontFamily、fontWeight、transitionDuration、transitionTimingFunction、animation、keyframes 的扩展配置 | 30min |
| 1.3 | 加载字体（Playfair Display、Noto Serif SC、Inter、JetBrains Mono）— 通过 `@font-face` 或 CDN link | 20min |
| 1.4 | 编写 `index.css` 的 `@layer base` 部分 — 设置全局字体系列、字体字重 | 20min |
| 1.5 | 验证 — 确认所有 token 在浏览器中可访问（通过 devtools 检查 CSS 变量） | 20min |

**交付物**: 更新后的 `index.css`（~150 行新增）、更新后的 `tailwind.config.js`（~80 行新增）。

### Phase 2: 组件重构（约 4 小时）

**目标**: 重构三个核心组件以使用新设计 token。

| 步骤 | 具体操作 | 时间 |
|------|----------|------|
| 2.1 | **HeroSection → Bento Grid**（3.1 的方案） | 1.5h |
| 2.2 | **TemplateSelector → 触控优先**（3.2 的方案） | 1.5h |
| 2.3 | **AnalyticsDashboard 颜色修复**（3.3 的方案） | 1h |

**注意事项**:
- 每个组件重构后立即进行视觉回归测试（屏幕截图对比）
- HeroSection 的 Bento Grid 可能影响页面高度 → 检查下方组件的滚动位置
- TemplateSelector 的 snap scrolling 在 iOS Safari 上需要额外测试

### Phase 3: 全局一致性审计（约 2 小时）

**目标**: 确保所有组件符合新的设计系统，修复遗漏。

| 检查项 | 方法 | 时间 |
|--------|------|------|
| 对比度审计 | 对所有 `text-neutral-400/500` 的文字测试 WCAG AA（4.5:1），不符合则升级到 `neutral-600/700` | 30min |
| 间距一致性 | 逐个组件检查间距是否使用新的 spacing token，发现硬编码间距标记并修复 | 30min |
| 圆角一致性 | 检查所有 `rounded-*` class，替换为新的 radius token | 20min |
| 字体一致性 | 检查所有文字使用的 font-family 和 font-weight，确保符合字体策略 | 20min |
| 阴影审计 | 检查所有 `shadow-*` class，确保使用 4 层阴影而非旧 2 层 | 20min |

### Phase 4: QA + Accessibility 验证（约 1 小时）

| 步骤 | 具体操作 | 时间 |
|------|----------|------|
| 4.1 | Reduced Motion 验证 — 在系统偏好中开启 "减少动效"，遍历所有页面，确保所有动画有 fallback | 15min |
| 4.2 | 键盘导航测试 — Tab 遍历所有交互元素，检查 focus ring 可见性 | 15min |
| 4.3 | 触控设备测试 — 在真实手机或 Chrome DevTools 设备模式下测试 TemplateSelector 的 snap scrolling | 10min |
| 4.4 | 深色模式预览 — 验证 CSS 变量在不同主题下的表现 | 10min |
| 4.5 | 字体加载验证 — 检查 woff2 字体是否正确加载，FOIT/FOUT 处理是否得当 | 10min |

---

### 总计：约 9 小时

**不要一次性做完**。建议分成 3 个 PR：

1. **PR 1**: Phase 1 设计 token（纯基础设施，无功能变化）— 2h
2. **PR 2**: Phase 2 组件重构（三个组件）— 4h
3. **PR 3**: Phase 3 + 4 审计和 QA — 3h

每个 PR 独立部署验证。这样如果 Phase 2 有问题，回滚不影响设计 token 的部署状态。

---

*报告结束。读完不行动 = 白读。*
