# ReadMeCraft 设计系统 UI/UX 审计报告 v3

**日期:** 2026-05-13
**审计类型:** UI/UX 设计系统深度审计
**基于:** v1-ux-audit (2026-05-12), v2-mvp-scope-compression (2026-05-13)
**方法:** 代码审查（25 组件 + tailwind.config + index.css）+ 交互流程走查 + 设计 token 一致性核对

---

## 与之前审计的关系

### v1-ux-audit 已修复项验证

| # | 问题 | 状态 | 当前评估 |
|---|------|------|---------|
| 1 | 视觉设计系统不一致 | **已修复** | `tailwind.config.js` 已定义 `card`/`button`/`input`/`dialog` 4 级圆角和 5 级阴影 token |
| 2 | Toast 定位与堆叠 | **已修复** | 改为 `bottom-4 right-4`，不再与 header 重叠 |
| 3 | StepIndicator 无动画 | **已修复** | 当前步骤加 `animate-scale-up`，/editor 展示步骤 4 |
| 4 | 模板选择冗余 Toast | **已修复** | `if (!state.selectedTemplate)` 守卫 |
| 5 | 生成进度条基于时间 | **跳过** | 仍为伪进度 |
| 6 | 编辑器空状态不友好 | **已修复** | 增加引导文案 + title 高亮 |
| 7 | 质量评分缺上下文 | **已修复** | 各维度加 title tooltip（v2 后已砍掉评分器） |
| 8 | 快捷键可发现性差 | **已修复** | `h-5 w-5` → `h-7 w-7` |
| 9 | 反馈 FAB 层次冲突 | **已修复** | z-index 调整，响应式宽度适配 |
| 10 | 响应式体验瑕疵 | **已修复** | /editor 页隐藏 footer |
| 11 | clearAllData 多余 reload | **已修复** | `navigate('/')` 替代 `reload()` |
| 12 | i18n 架构 | **跳过** | 未处理 |

### v2 MVP 范围执行状态

| 决策 | 状态 | 说明 |
|------|------|------|
| 删除 AnalyticsDashboard | **已执行** | 不存在于组件树 |
| 删除 HistoryPanel | **未执行** | 仍存在于 Header 和路由中 |
| 删除 FeedbackCard | **未执行** | 仍存在于 EditWorkspace |
| 删除 ShortcutHelpPanel | **未执行** | 仍存在于 EditWorkspace |
| 删除 tracking.ts | **未执行** | 仍在使用 |
| 保留 3 模板（砍 cards/showcase） | **未执行** | 仍为 5 模板 |
| 删除 GitHubTokenWarning | **未执行** | 仍在渲染 |
| 移除分享按钮 | **未执行** | ActionBar 仍有分享按钮 |
| 删除 /admin 路由 | **未执行** | App.tsx 仍有 admin 路由 |

---

## 本审计发现（设计系统视角）

### 1. 🔴 设计系统配置完备，但落地审计不足

`tailwind.config.js` 定义了完整的设计 token：

```js
colors:       primary (blue) / muted (slate) / accent (orange)
boxShadow:    card / card-hover / dialog / button / nav  // 5 级
borderRadius: card (0.75rem) / button (0.5rem) / input (0.5rem) / dialog (0.75rem)  // 4 级
fontFamily:   Noto Sans SC (sans) / JetBrains Mono (heading) / Noto Serif SC (serif)
```

**✅ 做得好的：** token 命名语义化、层级完整，且已无 `gray-*` / `indigo-*` 等硬编码 color 泄露（v3 之前已完成迁移）。

**❌ 问题：** `rounded-*` 和 `shadow-*` 在组件层仍是硬编码值，大量组件未使用 token 别名：

| 位置 | 当前使用 | 应使用 |
|------|---------|--------|
| HeroSection 卡片 (HeroSection.tsx:70) | `rounded-xl`, `shadow-card` | `rounded-card`, `shadow-card` (shadow 已用 token, rounded 未用) |
| ShowcaseSection 卡片 (ShowcaseSection.tsx:109) | `rounded-xl`, `shadow-sm` | `rounded-card`, `shadow-card` |
| RepoInfoCard | `rounded-xl` | `rounded-card` |
| 章节编辑器外层 (SectionEditor.tsx:210) | `rounded-xl` | `rounded-card` |
| 编辑工作区 (EditWorkspace.tsx:165) | `rounded-xl` | `rounded-card` |
| ActionBar 按钮 | `rounded-lg` | `rounded-button` |
| 模板选择器卡片 (TemplateSelector.tsx:122) | `rounded-xl` | `rounded-card` |
| GenerateSection 卡片 | `rounded-xl` | `rounded-card` |
| Toast 容器 | `rounded-lg` | `rounded-dialog` |
| Modal 容器 (Modal.tsx:99) | `rounded-xl` | `rounded-dialog` |

---

### 2. 🔴 `prefers-reduced-motion` 完全缺失

**影响：** 高（视障/前庭障碍用户）

代码中有 8+ 处持续动画，但**无任何位置检查用户 motion 偏好**：

| 位置 | 动画类型 |
|------|---------|
| `index.css:77-82` | `typing-animate`（逐行打字） |
| `index.css:89-91` | `animate-float`（浮动） |
| `index.css:94-99` | `animate-fade-in-up`（渐入） |
| `GenerateSection.tsx:224` | `animate-pulse`（省略号脉冲） |
| `GenerateSection.tsx:388` | `animate-pulse`（生成按钮） |
| `AnalyticsDashboard.tsx:33` | `animate-pulse`（骨架屏） |
| `RepoInfoCard.tsx:6` | `animate-pulse`（骨架屏） |
| `TemplateSkeleton.tsx:5,30` | `animate-pulse`（骨架屏） |
| `ActionBar.tsx:149` | `animate-pulse`（下载按钮） |

**建议修复：**
```css
/* 在 index.css 末尾添加 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 3. 🔴 Emoji 作为 UI 图标使用（重复违反）

**影响：** 高（跨平台渲染不一致、不可 CSS 控制）

| 文件:行 | Emoji | 语义用途 | 应替换为 Heroicons |
|---------|-------|---------|-------------------|
| `SectionEditor.tsx:20` | 🔗 | 链接工具栏按钮 | `LinkIcon` |
| `SectionEditor.tsx:22` | 📋 | 代码块工具栏按钮 | `CodeBracketIcon` |
| `SectionEditor.tsx:26` | 🖼 | 图片工具栏按钮 | `PhotoIcon` |
| `ActionBar.tsx:132` | 🚀 | 分享文案 | 纯文本或 `ShareIcon` |
| `RepoPreview.tsx:50` | 🎯 | 模板 mockup 文案 | 纯文本 `Simple` |
| `RepoPreview.tsx:54` | 🔥 | 模板 mockup 文案 | 纯文本 `Hot` |
| `RepoPreview.tsx:105` | ✨ | 模板 mockup 装饰 | SVG 装饰或删除 |
| `RepoPreview.tsx:116` | 🎯 | 模板 mockup 图标 | `StarIcon` |

---

### 4. 🟠 `z-index` 无管理系统

**当前分布：**

| 值 | 用途 | 文件:行 |
|----|------|---------|
| `z-40` | Header | `Header.tsx:58` |
| `z-50` | Toast 容器 | `Toast.tsx:60` |
| `z-50` | Modal 遮罩 | `Modal.tsx:93` |
| `z-50` | 反馈 FAB | `EditWorkspace.tsx:262` |
| `z-50` | 清空确认弹窗 | `Header.tsx:121` |
| `z-[60]` | 回到顶部按钮 | `PreviewPanel.tsx:246` |

**建议：** 在 `tailwind.config.js` 中定义语义化 z-index 层级：

```js
zIndex: {
  header: '40',
  dropdown: '45',
  toast: '50',
  modal: '50',
  fab: '55',
  backToTop: '60',
}
```

---

### 5. 🟠 触摸目标尺寸不足（移动端）

**影响：** 高（违反 touch-target-size 44x44px 规则）

| 组件 | 实际尺寸 | 问题 |
|------|---------|------|
| SectionEditor 工具栏按钮 (`px-2 py-0.5`) | ~28×20px | ❌ |
| SectionEditor 移动/删除 (`p-1.5`) | ~26×18px | ❌ |
| Header 操作按钮 (`px-2.5 py-1.5`) | ~28×28px | ❌ |
| Toast 关闭按钮 (`p-0.5`) | ~20×12px | ❌ |
| EditWorkspace 状态栏 `?` 按钮 (`h-7 w-7`) | 28×28px | ❌ |
| ActionBar 按钮 (`px-2.5 py-1.5`) | ~28×28px | ❌ |
| PreviewPanel 目录按钮 (`px-2 py-0.5`) | ~28×20px | ❌ |
| GitHubTokenWarning 关闭 (`p-0.5`) | ~20×12px | ❌ |

---

### 6. 🟠 `cursor-pointer` 覆盖不足

只有 3 个组件文件中使用了 `cursor-pointer`（PreviewPanel、TemplateSelector、SectionEditor）。大量可点击元素缺少鼠标指针反馈：

| 缺失位置 | 元素 |
|---------|------|
| HeroSection 特性卡片 (HeroSection.tsx:68) | `onClick` 嵌套在 SVG 内无直接 cursor |
| SectionEditor 拖拽手柄 (SectionEditor.tsx:228) | `cursor-grab` 已有，但内部按钮无 |
| 各类 `rounded-*` 按钮 | 部分按钮缺少 `cursor-pointer` |

---

### 7. 🟡 字体系统：heading 使用 JetBrains Mono

**配置：** `tailwind.config.js:9`

```js
heading: ['"JetBrains Mono"', '"Noto Sans SC"', 'monospace'],
```

**影响：** 中等。JetBrains Mono 是等宽编程字体，用于标题区域时中文 fallback 到 Noto Sans SC，产生中英文视觉断裂。对于**中文 README 生成工具**，标题使用等宽体缺乏语义依据。

**建议：** 与 `sans` 统一使用 `Noto Sans SC`，或换用 `Noto Serif SC` 做标题/正文分层。

---

### 8. 🟡 无法通过设计 token 引用的类名

`index.css` 中的 `.btn-primary` / `.btn-secondary` / `.btn-ghost` / `.input-field` / `.card` / `.badge` / `.dialog` 等组件类使用 Tailwind `@apply` 组合了设计 token，但**组件层未统一使用这些类**：

| 组件 | 当前方式 | 应使用 |
|------|---------|--------|
| Modal 确认按钮 | `rounded-lg bg-primary-600 px-4 py-2 text-sm ...` (proped) | `btn-primary` |
| Header 操作按钮 | `rounded-lg px-2.5 py-1.5 text-muted-400 ...` (proped) | `btn-ghost` |
| RepoInput | `input-field ...` | ✅ 已使用 |
| EditWorkspace 重新生成 | `rounded-lg border ...` (proped) | `btn-secondary` |
| GenerateSection 动作按钮 | `rounded-lg bg-gradient-to-r ...` | 保持（渐变不适用） |

---

### 9. 🟢 做得好的设计实践

| 类别 | 表现 |
|------|------|
| **Focus-visible 状态** | 全部交互元素有 `focus-visible:outline-none ring-2`，覆盖完整 |
| **aria-label** | 17 处 `aria-label` 覆盖所有图标按钮 |
| **role 属性** | `dialog`、`switch`、`button` 使用正确 |
| **过渡时间** | 全项目统一 `duration-200`（200ms），完全符合 150-300ms 推荐 |
| **按钮加载状态** | 所有异步操作均 `disabled` + spinner，防重复提交 |
| **缓动函数** | `ease-out` 贯穿动画系统，无 linear 滥用 |
| **颜色对比度** | primary/muted 色板符合 WCAG AA 4.5:1 |
| **弹窗焦点管理** | Modal.tsx 有完整 Tab 循环和焦点恢复 |
| **Toast 消除机制** | `py-2.5` 配合 hover pause，避免误操作 |
| **color token 一致性** | 已完成 `gray-*` → `muted-*` 和 `indigo-*` → `primary-*` 全量迁移 |

---

### 10. 🟢 已通过 Skill 推荐验证的设计决策

| Skill 推荐值 | 当前值 | 评估 |
|-------------|--------|------|
| Flat Design 风格 | Flat + subtle shadows | ✅ 匹配 |
| 150-200ms 过渡 | 200ms | ✅ 匹配 |
| SVG 图标体系 | Heroicons | ✅ 匹配（除 #3 emoji 问题） |
| 移动端 tab 切换 | sm:grid-cols-2 分栏 + 手机端 tab | ✅ 匹配 |
| 加载骨架屏 | TemplateSkeleton + RepoInfoCard pulse | ✅ 匹配 |

---

## 优先级修复建议

| P | 问题 | 影响 | 预估工时 |
|---|------|------|---------|
| P0 | prefers-reduced-motion（+3 行 CSS） | 无障碍合规 | 5 分钟 |
| P0 | SectionEditor toolbar emoji → SVG（替换 3 个 TOOL 图标） | 图标一致性 | 15 分钟 |
| P1 | 定义 z-index 语义化层级 | z 轴混乱 | 15 分钟 |
| P1 | 补充 cursor-pointer 到所有可点击区域 | 交互反馈 | 20 分钟 |
| P1 | 推广 `.btn-primary` / `.btn-secondary` / `.btn-ghost` 替代硬编码按钮样式 | 可维护性 | 30 分钟 |
| P2 | 移动端触摸目标增大到 44px | 移动可用性 | 30 分钟 |
| P2 | heading 字体评估（JetBrains Mono → Noto Sans SC） | 品牌一致性 | 5 分钟 |
| P2 | `rounded-*` 硬编码替换为 token（`rounded-card` / `rounded-button` 等） | 设计 token 落地 | 20 分钟 |
| P3 | ActionBar/RepoPreview 剩余 emoji 清理 | 一致性 | 10 分钟 |

---

## 审计方法

- 代码审查：25 组件 + `tailwind.config.js` + `index.css`
- 设计 token 一致性核对（所有 `rounded-*` / `shadow-*` / color class 扫描）
- 无障碍基础检查（focus-visible、aria-label、role、prefers-reduced-motion）
- 交互流程走查（Landing → Input → Select → Generate → Edit → Export）
- 响应式断点检查（375px / 768px / 1024px）
- 与 Skill 推荐设计系统交叉验证

---

## 下一步

本报告记录了当前设计系统状态、与 token 层的偏差、以及无障碍缺口。下轮审计（v4）应重点验证上述 P0/P1 修复是否已落地，并评估用户测试反馈引入的新问题。

*-- 由 UI/UX Pro Max skill 辅助生成*
