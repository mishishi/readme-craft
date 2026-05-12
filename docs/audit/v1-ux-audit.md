# UX 审计报告 v1

**日期:** 2026-05-12
**审计范围:** ReadMeCraft 全量 UI 组件（24 组件 / 6 Services / 5 Contexts）
**方法:** 代码审查 + 交互流程走查

---

## 总览

项目核心交互流（填入 → 选模板 → 生成 → 编辑 → 导出）清晰合理，问题集中在微观交互精细度、视觉系统一致性、以及关键反馈信号的时机和呈现方式上。

---

## 发现清单

### 1. 视觉设计系统不一致

**位置：** 全量组件

**描述：** UI 元素存在多套圆角规格（rounded-xl、rounded-lg、rounded-md、rounded），缺乏统一的视觉语言。阴影层级也没有 token 化。

| 位置 | 当前值 |
|------|--------|
| HeroSection 特性卡片 | `rounded-xl` |
| TemplateSelector 卡片 | `rounded-xl` |
| GenerateSection 结果卡片 | `rounded-xl` |
| 确认弹窗内嵌卡片 | `rounded-lg` |
| 章节编辑器 | `rounded-lg` |
| 模板预览微缩卡片 | `rounded-md` |
| ActionBar 按钮 | `rounded-lg` |
| ShowcaseSection 卡片 | `rounded-xl` |

**建议：**
- 建立设计 token（Tailwind 扩展），定义 `card` / `card-hover` / `dialog` / `button` 四个层级的圆角和阴影
- 同步到所有组件

---

### 2. Toast 定位与堆叠问题

**位置：** `Toast.tsx:60`

**描述：** 固定定位在右侧 top 4rem，与 header 重叠；连续多 toast 从上往下堆叠，最新在最上方可能遮挡未读信息；生成引导两条 info toast 信息密度偏高。

**建议：**
- 改为 bottom-right 定位，避免与 header 重叠
- 堆叠策略改为最新 toast 在最下方
- 引导 toast 合并或增加间隔

---

### 3. StepIndicator 突兀出现与无动画过渡

**位置：** `StepIndicator.tsx:19`

**描述：** 步骤 0 时 `return null`，输入 URL 后突然出现；步骤推进无动画；/editor 页面没有展示指示器。

**建议：**
- 始终渲染步骤 0（灰色不可用）
- 步骤推进加 scale + 颜色渐变动画
- /editor 页也展示步骤 4

---

### 4. 模板选择冗余 Toast

**位置：** `TemplateSelector.tsx:213`

**描述：** 选模板时卡片已有强烈视觉反馈（边框变色 + ring + 缩放 + 选中钩），Toast 是冗余信息。

**建议：** 仅在第一次选择（null → 非 null）时显示 toast。

---

### 5. 生成进度条基于时间而非真实进度

**位置：** `GenerateSection.tsx:130-136`

**描述：** 4 个 phase 基于 elapsed 时间线性映射，不是 AI 调用真实进度。长耗时（15s+）卡在 90% 让用户焦虑。

**建议：** 增加后端 SSE 或轮询进度端点。低配方案：15s 后改为动态话术。

> ⚠️ 本轮修复跳过

---

### 6. 编辑器空状态不够友好

**位置：** `EditorPanel.tsx:101-116`

**描述：** 空状态仅展示文档 icon + "暂无章节内容"，没有引导用户下一步要做什么。

**建议：**
- 增加引导文案 "从 AI 生成的内容开始编辑，或手动添加章节"
- title 为空时柔和引导高亮

---

### 7. 质量评分缺少上下文

**位置：** `GenerateSection.tsx:298-322`

**描述：** 评分维度（30+30+25+15）无解释；前端本地算分本质是格式分而非内容分；无对比基准。

**建议：**
- 评分旁加 tooltip 解释各维度含义
- 加子标题标注维度名称
- 加基准提示

---

### 8. 快捷键可发现性差

**位置：** `EditWorkspace.tsx:330-341` / `App.tsx:123-141`

**描述：** 状态栏快捷键提示视觉权重重极低（灰小字 + 灰小标签）；? 按钮仅 h-5 w-5；新手引导仅展示两次 info toast。

**建议：**
- 首次进入编辑器展示快捷键提示卡片（5 秒自动消失）
- ? 按钮增大到 h-7 w-7
- ActionBar undo/redo 增加 tooltip

---

### 9. 反馈 FAB 的界面层次冲突

**位置：** `EditWorkspace.tsx:264-312`

**描述：** 反馈面板（z-30）和回到顶部按钮（z-40）z-index 冲突；面板 w-80 移动端溢出；右下角两个浮动元素视觉打架。

**建议：**
- 反馈面板打开时隐藏回到顶部按钮
- 面板宽度响应式适配
- 统一右下角浮动元素

---

### 10. 响应式体验瑕疵

**位置：** 全量

**描述：** 手机端编辑/预览 tab 切换无当前指示；模板选择 2 列布局卡片过窄；/editor 页 footer 无意义。

**建议：**
- Mobile tab 加底部指示条
- 手机端模板选择改为水平滑动卡片
- /editor 页隐藏 footer

---

### 11. clearAllData 多余 reload

**位置：** `Header.tsx:41-49`

**描述：** RESET dispatch 后跟 window.location.reload() 导致白屏闪动。重置状态已清空一切，reload 多余。

**建议：** 移除 reload，改用 navigate('/')。

---

### 12. 国际化架构缺失

**位置：** 全局

**描述：** UI 中混入英文无统一管理；组件文本未抽取 i18n key。

**建议：** 至少记录需要本地化的字符串位置。

> ⚠️ 本轮修复跳过

---

## 优先级

| 优先级 | 编号 | 影响 |
|--------|------|------|
| P0 | #5 | 核心流程信任度 |
| P0 | #3 | 新手引导流畅度 |
| P1 | #1 | 品牌感知质量 |
| P1 | #4 | 信息噪音 |
| P1 | #9 | 交互冲突 |
| P2 | #2 | 信息可达性 |
| P2 | #8 | 效率功能使用率 |
| P2 | #7 | 功能价值感知 |
| P2 | #10 | 移动端体验 |
| P3 | #6 | 编辑器首位印象 |
| P3 | #11 | 视觉平滑度 |
| P4 | #12 | 可扩展性 |

---

## 审计方法

- 代码审查（所有 24 个组件、6 个 service、5 个 context）
- 交互流程走查（Landing → Input → Select → Generate → Edit → Export）
- 响应式断点检查
- 无障碍基础检查（focus、aria-label、keyboard nav）

---

## 修复记录（v1.0 — 2026-05-12）

| # | 问题 | 修复内容 | 文件 |
|---|------|----------|------|
| 1 | 视觉设计系统不一致 | 新增 `.card-hover` / `.dialog` 设计 token；SectionEditor `rounded-lg` → `rounded-xl` | `index.css` / `SectionEditor.tsx` |
| 2 | Toast 定位与堆叠 | 改为 bottom-right 定位；生成引导两条 toast 合并为一条 | `Toast.tsx` / `EditWorkspace.tsx` |
| 3 | StepIndicator 无动画 | 移除 `currentStep===0` 提前 return；当前步骤加 `animate-scale-up`；/editor 展示步骤 4 | `StepIndicator.tsx` / `App.tsx` |
| 4 | 模板选择冗余 Toast | 添加 `if (!state.selectedTemplate)` 守卫 | `TemplateSelector.tsx` |
| 6 | 编辑器空状态不友好 | 增加引导文案；title 为空时柔和高亮 | `EditorPanel.tsx` |
| 7 | 质量评分缺上下文 | 各维度加 `title` tooltip 解释含义 | `GenerateSection.tsx` |
| 8 | 快捷键可发现性差 | ? 按钮 `h-5 w-5` → `h-7 w-7`；字体 `text-[10px]` → `text-xs` | `EditWorkspace.tsx` |
| 9 | 反馈 FAB 层次冲突 | FAB `z-30` → `z-50`；面板 `w-80` → `w-[calc(100vw-2rem)]` `sm:w-80`；回顶按钮 `z-40` → `z-[60]` | `EditWorkspace.tsx` / `PreviewPanel.tsx` |
| 10 | 响应式体验瑕疵 | /editor 页隐藏 footer | `App.tsx` |
| 11 | clearAllData 多余 reload | 移除 `window.location.reload()`，改用 `navigate('/')` | `Header.tsx` |

**跳过项：** #5（进度条基于时间）、#12（i18n 架构）

下一步审计将继续在此基础上增量分析，确保方案前后一致。
