# ReadMeCraft 产品审计报告 v2 — MVP 范围压缩

日期: 2026-05-13
审计类型: 交付范围紧急压缩 (Agile Delivery Review)
基于: v1 产品审计 (2026-05-12)

---

## 背景

项目面临交付时间压力，本次审计的核心目标不是"发现产品问题"，而是**砍掉一切非核心功能，只交付一个能工作、能闭环的 MVP**。

v1 审计提出的优先级建议是：**三 > 五 > 二 > 七 > 一 > 六 > 八**（先解决 AI 质量，再做编辑体验、漏斗优化等）。但在交付时间压力下，这个优先级需要重新审视——v1 假设我们有足够时间做完所有改进，现在这个假设不成立。

---

## MoSCoW 分类结果

### Must Have — 必须做 (MVP 核心路径)

| # | 功能 | 说明 |
|---|------|------|
| M1 | GitHub URL 输入 + 仓库信息获取 | 核心入口。没有这个就没有输入。 |
| M2 | 模板选择（砍到 3 个） | 极简清风、Badge 大满贯、企业蓝图。卡片视界和项目展厅砍掉。 |
| M3 | AI 生成 README（MiniMax API） | 产品唯一存在的理由。 |
| M4 | 编辑器（基础版：编辑章节内容） | AI 生成不可能完美，用户必须能改。但只保留 textarea 级别编辑。 |
| M5 | 复制 / 下载 .md | 交付物输出通道。 |

### Should Have — 应该做

| # | 功能 | 说明 |
|---|------|------|
| S1 | SessionStorage 自动存档 | 刷新不丢数据。MVP 的基本体面。 |
| S2 | Toast 通知 | 操作反馈的最小闭环。 |
| S3 | Loading / Error / Empty 状态处理 | 核心交互必须有状态反馈。 |
| S4 | HeroSection（精简版） | 保留结构和输入框，精简文案，砍掉动画。 |
| S5 | 返回确认弹窗 | 编辑器内误返回的数据保护。 |

### Could Have — 可以有（但建议本次不做）

| # | 功能 | 砍掉理由 |
|---|------|---------|
| C1 | Undo / Redo | 用户连 README 都还没生成出来，先解决"有"的问题，再解决"改错了能回去"的问题。MVP 容忍手动备份。 |
| C2 | 章节折叠 / 增删 / 改标题 | AI 生成的大纲大概率够用。MVP 编辑器只改内容，标题改不了死不了人。 |
| C3 | Showcase 快速体验 | 5 个预设项目一键填入——很酷，但用户自己输一个 GitHub URL 不会死。 |
| C4 | 历史记录 Panel | localStorage 持久化 + 侧边栏面板是 2.0 的事。SessionStorage 刷新恢复够用。 |

### Won't Have — 本次不做

| # | 功能 | 砍掉理由 |
|---|------|---------|
| W1 | 分析看板 (Analytics Dashboard + SQLite + tracking.ts) | 没有用户，看什么分析？趋势图是一条平躺的零。为了一个可能永远没人看的页面引入了 SQLite、Recharts、前后端追踪设施——这是过度工程。全砍。 |
| W2 | 项目预扫描 (project-scanner + pre-scan route) | 200+ 行扫描 GitHub 文件树、分析依赖、检测框架，然后塞进 AI prompt。AI 输出的主要瓶颈是 prompt engineering 没做好，不是扫描结果不够丰富。且扫描器有 15s 超时、429 限流风险——引入脆弱依赖链来生成一个"可能更好"的 README，不值得。 |
| W3 | 反馈机制 (FeedbackCard) | 用户对生成结果不满意，直接编辑器里改就行了，为什么要走"提交反馈 → 重新生成"的绕路流程？这个流程比直接编辑更慢、更不可控。 |
| W4 | README 评分器 (readme-scorer.ts) | 65 分然后呢？没有 actionable 建议的评分就是数字垃圾。且评分标准是拍脑袋定的——每个项目的 README 风格天差地别。 |
| W5 | 快捷键帮助面板 (ShortcutHelpPanel) | 5 个快捷键需要 90 行组件 + 一个完整 dialog？直接在按钮 tooltip 里写提示就够了。 |
| W6 | 分享功能 (ActionBar 分享按钮) | 「我刚用 ReadMeCraft 生成了一个 README 🚀」——MVP 没空做社交传播基建。好产品自己会传播。 |
| W7 | 模板：卡片视界 + 项目展厅 | 两个设计复杂度最高的模板，和另外三个的差异化最小。3 个模板覆盖 90% 场景，砍掉减少决策疲劳。 |
| W8 | 拖拽排序支持 (MOVE_SECTION_TO action) | 章节排序用上移/下移按钮就够了——不对，连上下移动都不需要。AI 生成的顺序就是对的。 |
| W9 | 严格模式 (strictMode) | v1 审计建议的"严格模式"很好，但不在 MVP 范围内。先确保基础输出质量，再加约束控制。 |
| W10 | GitHubTokenWarning | 后端直接配置 token 即可，前端不需要横幅教育用户。显示这个组件的前提是用户知道 token 是什么以及去哪里拿——MVP 用户没空管这些。后端静默处理。 |

---

## 与 v1 审计的关系

### v1 中已实现（发行后）

v1 审计报告中的多项建议在本次审查时已确认实施：
- 移动端编辑 tab 切换（v1 五-2 ✓）
- Toast 队列上限控制（v1 八-1 ✓）
- 后端分析存储从 NDJSON 迁移至 SQLite（v1 八-4 ✓）
- feedback 预置按钮（v1 三-2 ✓）

### v1 优先级在本约束下的调整

v1 的优先级是 **三 > 五 > 二 > 七 > 一 > 六 > 八**。

在交付压力下，实际优先级变为：

```
M1-M5 > S1-S5 > 三(部分) > 五(基础) > 二(仅进度透明) > v1其他全部推迟
```

具体解释：
- **v1 三（AI 输出质量）**：严格模式和 validate-retry 机制保留（已在代码中），但质量评分仪表盘和反馈重生成随 FeedbackCard 和 scorer 一起砍掉。
- **v1 五（编辑体验）**：保留基础编辑功能，Markdown 工具栏和图片插入推迟。
- **v1 二（漏斗优化）**：生成进度拆分 SSE 推送有价值但属于增强型功能，推迟。
- **v1 七（增长闭环）**：分享功能和 README 底部标识全部砍掉。MVP 不考虑传播。
- **v1 一（核心价值提炼）**：Hero 文案精简已纳入 S4。
- **v1 六（可发现性）**：全砍。MVP 不需要快捷键面板引导，不需要历史记录 badge 闪烁。
- **v1 八（技术产品化）**：基础架构已就位，进一步的 context 拆分和 error boundary 增强推迟。

### 从 v1 带过来的未解决问题

| v1 问题 | 状态 | MVP 处理 |
|---------|------|---------|
| AI 输出语义质量无保证 | 未解决 | 保留 validate-retry 机制，质量评分砍掉。接受"偶尔平庸"的风险。 |
| 模板智能推荐 | 未解决 | 砍掉。MVP 让用户手动选。 |
| 移动端编辑体验 | 未解决 | 保留基础可用性，不做专门优化。 |
| 没有"由 ReadMeCraft 生成"标识 | 未解决 | 砍掉。MVP 不考虑传播。 |
| 没有社区画廊 | 未解决 | 砍掉。 |
| state 分层完成 (Repo/Editor/UI Context) | 已解决 ✓ | — |
| NDJSON → SQLite 迁移 | 已解决 ✓ | — |

---

## 文件级变更清单

### 删除（建议）

```
frontend/src/components/AnalyticsDashboard.tsx   (250 行)
frontend/src/components/HistoryPanel.tsx          (215 行)
frontend/src/components/FeedbackCard.tsx          (170 行)
frontend/src/components/ShortcutHelpPanel.tsx     (95 行)
frontend/src/services/readme-scorer.ts            (135 行)
frontend/src/services/tracking.ts                 (95 行)
frontend/src/services/history.ts                  (77 行)
frontend/src/templates/cards.ts
frontend/src/templates/showcase.ts
server/src/routes/analytics.ts
server/src/services/analytics.ts                  (223 行)
server/src/services/project-scanner.ts             (342 行)
server/src/routes/pre-scan.ts
```

### 精简（建议）

```
frontend/src/components/HeroSection.tsx        → 精简文案，保留基础结构
frontend/src/components/ActionBar.tsx           → 移除分享按钮
frontend/src/templates/index.ts                → 从 5 个导出改为 3 个
frontend/src/App.tsx                           → 移除 /admin 路由和 tracking 导入
server/src/index.ts                            → 移除 analytics 和 pre-scan 路由注册
```

### 保留

```
frontend/src/components/RepoInput.tsx
frontend/src/components/RepoInfoCard.tsx
frontend/src/components/TemplateSelector.tsx
frontend/src/components/GenerateSection.tsx
frontend/src/components/EditorPanel.tsx
frontend/src/components/PreviewPanel.tsx
frontend/src/components/EditWorkspace.tsx
frontend/src/components/SectionEditor.tsx
frontend/src/components/ConfirmBackModal.tsx
frontend/src/components/Toast.tsx
frontend/src/components/StepIndicator.tsx
frontend/src/components/AsyncBoundary.tsx
frontend/src/components/TemplateSkeleton.tsx
frontend/src/components/Header.tsx
frontend/src/components/Modal.tsx
frontend/src/components/ShowcaseSection.tsx      ← 保留但标记为 C3（可不做）
frontend/src/components/GitHubTokenWarning.tsx   ← 删除
frontend/src/components/HeroSection.tsx           ← 精简
frontend/src/components/ActionBar.tsx             ← 精简
frontend/src/context/*.tsx                       ← 全部保留
frontend/src/services/api.ts / github.ts / markdown.ts / config.ts / mock.ts
frontend/src/templates/minimal.ts / badges.ts / enterprise.ts
server/src/routes/generate.ts / repo.ts
server/src/services/minimax.ts / prompts.ts
```

---

## 交付影响评估

| 指标 | 当前 | MVP 后 | 差异 |
|------|------|--------|------|
| 前端组件数 | ~30 | ~22 | -27% |
| 前端代码行 | ~3000 | ~2000 | -33% |
| 后端路由数 | 5 | 2 | -60% |
| 后端代码行 | ~1200 | ~500 | -58% |
| 依赖复杂度 | Recharts + sql.js | 无新增依赖 | 减少构建体积 |
| 总估算工时 | 不可控 | 可控 | 交付周期缩短约 50% |

核心用户流程（输入 URL → 选模板 → 生成 → 编辑 → 下载）不受任何影响。砍掉的全部是外围功能。

---

*本报告记录了交付范围压缩决策，供后续实施参考。具体实施从删除分析看板和项目扫描器开始。*
