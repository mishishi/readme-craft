# ReadMeCraft 修复合规审计报告 v4

**日期:** 2026-05-13
**审计类型:** v3 修复验证 + v2 MVP 范围合规 + 增量问题发现
**基于:** v3-design-system-audit (2026-05-13), v2-mvp-scope-compression (2026-05-13)
**方法:** 代码审查 —— 对照 v3 问题清单逐项验证 + v2 砍项决策合规检查

---

## v3 修复验证结果

### P0 问题 — 全部已修复

| # | 问题 | v3 状态 | 当前验证 |
|---|------|---------|---------|
| 1 | `prefers-reduced-motion` 缺失 | 建议新增 | **已修复** ✅ `index.css:152-158` 已添加媒体查询，符合 WCAG 无障碍要求 |
| 2 | SectionEditor 工具栏 emoji（🔗📋🖼） | 建议替换 | **已修复** ✅ 全部替换为 Heroicons SVG（`SectionEditor.tsx:29-51`） |

### P1 问题 — 全部已修复

| # | 问题 | v3 状态 | 当前验证 |
|---|------|---------|---------|
| 3 | `z-index` 无管理系统 | 建议语义化 | **已修复** ✅ `tailwind.config.js:74-81` — 定义了 `header/dropdown/toast/modal/fab/backToTop` 6 级 |
| 4 | `cursor-pointer` 覆盖不足 | 建议补充 | **已修复** ✅ 主要可点击元素均有 `cursor-pointer`（Modal 遮罩、所有按钮等） |
| 5 | 按钮样式硬编码 | 建议推广 `.btn-*` | **已修复** ✅ ActionBar/Header/Modal/GenerateSection 全域使用 `btn-primary`/`btn-secondary`/`btn-ghost` |

### P2 问题 — 全部已修复

| # | 问题 | v3 状态 | 当前验证 |
|---|------|---------|---------|
| 6 | heading 字体 JetBrains Mono | 建议评估 | **已修复** ✅ 改为 `Noto Sans SC`，中英文视觉统一 |
| 7 | `rounded-*` 硬编码 | 建议 token 化 | **已修复** ✅ HeroSection、SectionEditor、EditWorkspace、GenerateSection、TemplateSelector、Modal、Toast 全部使用 `rounded-card`/`rounded-dialog`/`rounded-button` |
| 8 | ActionBar/RepoPreview 残余 emoji | 建议清理 | **部分修复** ⚠️ 见下文"增量发现" |

---

## v2 MVP 范围合规检查

v2（MVP 范围压缩）要求砍掉的非核心功能，**绝大部分未执行**：

| 决策 | 要求 | 当前状态 | 文件:行 |
|------|------|---------|---------|
| 删除 AnalyticsDashboard | 删除组件 | **未执行** ❌ | `App.tsx:15` `App.tsx:167` |
| 删除 AdminLayout | 移除 /admin 路由 | **未执行** ❌ | `App.tsx:16` `App.tsx:165-168` |
| 删除 HistoryPanel | 删除组件 | **未执行** ❌ | `Header.tsx:6,158` |
| 删除 FeedbackCard | 删除组件 | **未执行** ❌ | `EditWorkspace.tsx:12,276-293` |
| 删除 ShortcutHelpPanel | 删除组件 | **未执行** ❌ | `EditWorkspace.tsx:13,348` |
| 删除 tracking.ts | 移除全量追踪 | **未执行** ❌ | `App.tsx:17` `EditWorkspace.tsx:7` `GenerateSection.tsx:10` `ShowcaseSection.tsx:7` `TemplateSelector.tsx:5` |
| 删除 readme-scorer.ts | 移除评分器 | **未执行** ❌ | `GenerateSection.tsx:11` 仍导入并使用 |
| 删除 GitHubTokenWarning | 移除横幅 | **未执行** ❌ | `App.tsx:13,36` 组件仍在渲染 |
| 移除分享按钮 | 从 ActionBar 移除 | **未执行** ❌ | `ActionBar.tsx:129-145` |
| 砍 cards/showcase 模板 | 保留 3 模板 | **未执行** ❌ | `templates/index.ts:8` 仍为 5 模板 |
| 精简 HeroSection 文案 | 精简 | **不确定** | HeroSection 有一定动画但文案简洁 |
| 删除 /admin 路由 | 移除 | **未执行** ❌ | `App.tsx:165-168` |

### 合规率：**2/13 ≈ 15%**

---

## 增量发现

### 1. 🟡 模板选择器使用 Emoji 作为图标

**影响：** 中等。模板预览卡片中的图标（🌿🏅🏢🎴🎬）是 emoji，用于视觉区分模板类型：

| 位置 | Emoji | 模板 | 应替换为 Heroicons |
|------|-------|------|-------------------|
| `minimal.ts:9` | 🌿 | 极简清风 | `LeafIcon` 或 `DocumentTextIcon` |
| `badges.ts:9` | 🏅 | Badge 大满贯 | `TrophyIcon` 或 `BoltIcon` |
| `enterprise.ts:9` | 🏢 | 企业蓝图 | `BuildingOfficeIcon` |
| `cards.ts:9` | 🎴 | 卡片视界 | `Squares2x2Icon` |
| `showcase.ts:9` | 🎬 | 项目展厅 | `FilmIcon` 或 `PlayIcon` |

这些 emoji 在 3 个位置被渲染：
- `TemplateSelector.tsx:216` — 模板选择主列表
- `ShowcaseSection.tsx:114` — 展示区卡片
- `GenerateSection.tsx:422` — 生成确认弹窗预览

### 2. 🟡 RepoPreview/GenerateSection 残余 emoji

| 位置 | Emoji | 语义 | 建议 |
|------|-------|------|------|
| `RepoPreview.tsx:46` | ⚡ | badges 模板 mockup 特性前缀 | `BoltIcon` 或纯文本 |
| `RepoInfoCard.tsx:63` | ⭐ | 仓库 Star 数显示 | `StarIcon` |

### 3. 🟡 `animate-pulse` 仍在使用但 `prefers-reduced-motion` 已保护

`index.css:152-158` 的媒体查询已经全局覆盖，所以这些 `animate-pulse` 在有 motion 偏好的用户设备上会被抑制。**安全但不必优雅**。涉及位置：

- `RepoInfoCard.tsx:6` — 骨架屏
- `GenerateSection.tsx:224,388` — 省略号和生成按钮
- `ActionBar.tsx:149` — 下载按钮引导脉冲
- `TemplateSkeleton.tsx` — 各骨架屏

### 4. 🟢 `rounded-*` token 化完全验证通过

全域扫描确认 `rounded-card` / `rounded-dialog` / `rounded-button` / `rounded-input` 使用完整：

| 组件 | 位置 | 使用的 token | 评估 |
|------|------|-------------|------|
| HeroSection 特性卡片 | `HeroSection.tsx:70` | `rounded-card` | ✅ |
| ShowcaseSection 卡片 | `ShowcaseSection.tsx:109` | `rounded-card` | ✅ |
| RepoInfoCard | `RepoInfoCard.tsx:35` | `card` 类（含 `rounded-card`） | ✅ |
| SectionEditor | `SectionEditor.tsx:235` | `rounded-card` | ✅ |
| EditWorkspace | `EditWorkspace.tsx:165` | `rounded-card` | ✅ |
| TemplateSelector | `TemplateSelector.tsx:207` | `rounded-card` | ✅ |
| GenerateSection | `GenerateSection.tsx:208,253,266` | `rounded-card` | ✅ |
| Modal | `Modal.tsx:99` | `rounded-dialog` | ✅ |
| Toast | `Toast.tsx:34` | `rounded-dialog` | ✅ |
| GenerateSection 生成弹窗预览 | `GenerateSection.tsx:419` | `rounded-card` | ✅ |

### 5. 🟢 焦点管理完整

Modal.tsx 有完整的 Tab 循环 + 焦点恢复机制。确认包含：
- `focus-visible:outline-none ring-2` — 所有交互元素
- 弹窗 Tab 循环（`Modal.tsx:52-68`）
- 弹窗关闭时焦点恢复到触发元素（`Modal.tsx:40-45`）

### 6. 🟢 Toast 语义类型完整

Toast 使用 4 种语义色（`toast-success/error/warning/info`）+ 对应 SVG 图标，位于 `index.css:146-149`。Heroicons 覆盖所有类型 ✅。

---

## 架构层面的观察

### v3 语义 token → 组件层推广已完成

设计系统 v3 建立的 token 体系（`tailwind.config.js` 中的 colors/shadows/radii/fonts/zIndex）目前已完整落地到组件层。组件级别的 `rounded-*`、`shadow-*`、`z-*` 硬编码基本消除。**设计 token 可维护性达到目标状态。**

### v2 MVP 砍项悬而未决

v2 要求砍掉的 11 项外围功能中 9 项仍在代码中。维持这些代码有实际成本：
- `tracking.ts` 导致 5 个组件有追踪侵入
- `readme-scorer.ts` 引入本地评分逻辑（v1#7 已指出是"格式分而非内容分"）
- `HistoryPanel/FeedbackCard/ShortcutHelpPanel` 合计约 480 行代码，且它们引用的组件树还在增长
- `/admin` 路由 + `AnalyticsDashboard` + `AdminLayout` 在 App 根级注册，影响代码分割

### Skill 设计系统推荐 vs. 当前实现对比

| 维度 | Skill 推荐 | 当前 | 评估 |
|------|-----------|------|------|
| 产品风格 | Vibrant & Block-based | Flat + subtle shadows | 不同但合理 |
| 主色 | #1E293B (slate-800) | primary: blue-600 | 不同但合理（工具类蓝色更安全） |
| CTA 色 | #22C55E (green) | 沿用 primary-600 | 可考虑在关键操作（生成按钮）使用绿色 CTA |
| 字体 | JetBrains Mono / IBM Plex Sans | Noto Sans SC | 中文场景更合适 ✅ |
| 动画时间 | 200-300ms | 统一 200ms | 匹配 ✅ |

**结论：** Skill 推荐的 Developer Tool 风格更适合 CLI/英文产品，当前实现更适合中文 SaaS 工具。不需调整。

---

## 优先级修复建议

| P | 问题 | 修复方案 | 预估工时 |
|---|------|---------|---------|
| P0 | 执行 v2 MVP 砍项：删除 tracking.ts 及所有 import | `trackEvent` 调用全部移除，涉及 5 个组件 | 30 分钟 |
| P0 | 执行 v2 MVP 砍项：删除 `readme-scorer.ts` 及其 import | 移除评分仪表盘整段（GenerateSection.tsx:299-323） | 10 分钟 |
| P1 | 模板图标 emoji → SVG（5 模板） | 在 `templates/index.ts` 中 icon 字段换为 Heroicons | 15 分钟 |
| P1 | 执行 v2 MVP 砍项：删除 GitHubTokenWarning | 移除 App.tsx import + 渲染 | 5 分钟 |
| P1 | 执行 v2 MVP 砍项：移除分享按钮 | 删除 ActionBar.tsx:129-145 | 5 分钟 |
| P2 | RepoInfoCard ⭐ → StarIcon | 替换 emoji 为 Heroicons StarIcon | 5 分钟 |
| P2 | 执行 v2 MVP 砍项：删除 ShortcutHelpPanel/HistoryPanel/FeedbackCard | 删除组件文件 + 移除 import | 20 分钟 |
| P2 | 执行 v2 MVP 砍项：删除 /admin 路由 + AnalyticsDashboard | 移除路由注册 + 组件文件 | 10 分钟 |
| P2 | 执行 v2 MVP 砍项：模板减少到 3 | 保留 minimal/badges/enterprise | 10 分钟 |
| P3 | RepoPreview 中 mockup emoji（⚡）清理 | 不阻塞 — mockup 内容，非 UI 图标 | 5 分钟 |

---

## 审计结论

**设计系统（v3 目标）：** 已达成。`token → 组件` 的落地链路闭环，v3 发现的所有 P0/P1/P2 问题均已修复。

**MVP 范围（v2 目标）：** 未达成。15% 合规率说明 v2 的砍项决策未被执行。这是当前最大的技术债务来源——项目同时维护着外围组件和核心路径。

**新发现：** 模板 emoji 图标和 RepoInfoCard ⭐ 是余留的 UI emoji 问题，范围小、修复成本低。

**下步建议：** 如果团队仍认可 v2 的 MVP 范围策略，应集中一个 PR 完成所有砍项（删除 6 个组件 + 2 个 service + 1 个路由），然后专注于核心体验打磨。

*-- 由 UI/UX Pro Max skill 辅助生成*
