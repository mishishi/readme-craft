# ReadMeCraft 无障碍审计报告 v5

**日期:** 2026-05-13
**审计类型:** WCAG 无障碍合规审查 —— ui-ux-pro-max 技能交叉验证
**方法:** 逐一对照 skill 的 `ux` / `web` / `react` 域推荐规则，审读全部 17 个组件
**基于:** v4-fix-compliance.md、WCAG 2.1 AA 标准

---

## 总览

| 严重度 | 已发现 | 已修复 | 未修复 |
|--------|--------|--------|--------|
| P0（违规） | 4 | 0 | 4 |
| P1（高） | 6 | 0 | 6 |
| P2（中） | 4 | 0 | 4 |

---

## v4 修复验证

v4 报告中的 emoji 修复（模板图标、RepoInfoCard ⭐、RepoPreview ⚡）已在本次会话中完成：

| # | 问题 | v4 状态 | 当前验证 |
|---|------|---------|---------|
| 1 | 模板选择器 emoji（🌿🏅🏢🎴🎬） | 待修复 P1 | **已修复** ✅ 5 个 `.ts` → `.tsx`，icon 类型 `string` → `ReactNode`，全部替换为 Heroicons |
| 2 | RepoInfoCard ⭐ 显示 Star 数 | 待修复 P2 | **已修复** ✅ 替换为 Heroicons StarIcon (amber-400) |
| 3 | RepoPreview badges mockup ⚡ | 待修复 P3 | **已修复** ✅ 替换为 Heroicons BoltIcon (h-2.5 w-2.5 inline) |
| 4 | Toast `aria-live="polite"` 缺失 | v4 未发现 | **待修复** — 见下文 P0#3 |

---

## P0 — WCAG 违规

### 1. 🛑 RepoInput 输入框缺少 label

**文件:** `RepoInput.tsx:53-61`
**违反:** WCAG 1.3.1 (Info and Relationships) + 4.1.2 (Name, Role, Value)

```tsx
<input
  type="text"
  value={localUrl}
  onChange={(e) => setLocalUrl(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="输入 GitHub 仓库地址，如 https://github.com/owner/repo"
  disabled={disabled}
  className={`input-field pr-10 ...`}
/>
```

- 仅有 `placeholder` 作为视觉提示，无 `<label>`、`aria-label` 或 `aria-labelledby`
- 辅助技术用户无法得知输入框用途
- 尾部的验证状态图标（✓/!）也无 `aria-hidden` 或 `role="status"`

**修复方案:** 添加 `<label>` 或 `aria-label="GitHub 仓库地址"`，验证图标加 `aria-hidden="true"`

**预估工时:** 5 分钟

---

### 2. 🛑 EditorPanel label 缺少 htmlFor

**文件:** `EditorPanel.tsx:78-79, 93-94`
**违反:** WCAG 1.3.1 — label 未与 input 关联

```tsx
<label className="mb-1.5 block text-xs font-medium text-muted-500 uppercase tracking-wider">
  项目标题
</label>
<input
  type="text"
  value={state.title}
  ...
/>
```

```tsx
<label className="block text-xs font-medium text-muted-500 uppercase tracking-wider">
  章节内容
</label>
```

- 两个 `<label>` 均缺少 `htmlFor` 属性
- 关联的 `<input>`/容器缺少 `id` 属性
- 屏幕阅读器无法关联 label 到输入控件

**修复方案:** `label` 加 `htmlFor="project-title"`，`input` 加 `id="project-title"`；章节 label 同理

**预估工时:** 5 分钟

---

### 3. 🛑 ToastContainer 缺少 aria-live

**文件:** `Toast.tsx:60-66`
**违反:** WCAG 4.1.3 (Status Messages)

```tsx
<div className="fixed bottom-4 right-4 z-50 flex w-72 flex-col gap-2">
```

- 无 `aria-live="polite"` 或 `role="status"`
- 动态出现的 toast 消息不会被屏幕阅读器朗读
- v3/v4 报告中遗漏此问题

**修复方案:** 添加 `aria-live="polite"` 到容器 div

**预估工时:** 1 分钟

---

### 4. 🛑 应用缺少 Skip Link

**文件:** `App.tsx`
**违反:** WCAG 2.4.1 (Bypass Blocks)

- 页面顶部无"跳转到主内容"链接
- 键盘用户每次页面加载需 Tab 遍历导航/hero/模板选择区才能到达编辑区
- 影响编辑器页面的使用效率

**修复方案:** 添加 `<a href="#main-content" className="skip-link">`，在目标元素加 `id="main-content"`

**预估工时:** 10 分钟

---

## P1 — 高优先级

### 5. 🟠 SectionEditor 工具栏按钮缺少 aria-label

**文件:** `SectionEditor.tsx:367-386`

```tsx
{TOOLS.map((tool, ti) => (
  <button
    onClick={() => { ... }}
    title={tool.title}
    className="min-h-[44px] sm:min-h-0 rounded px-2 py-0.5 ..."
  >
    {tool.label ? tool.label : <ToolIcon action={tool.action} />}
  </button>
))}
```

- 文字按钮（B/I/H/`/-/—/>）有 `title` 但无 `aria-label`
- `ToolIcon` 按钮（链接/代码块/图片）也是 icon-only + `title` 无 `aria-label`
- `title` 属性辅助技术支持不一（JAWS/NVDA 默认不朗读）

**修复方案:** 对每个 tool 添加 `aria-label={tool.title}`

**涉及按钮:** B, I, H, link, `, codeblock, -, —, >, image — 共 10 个

**预估工时:** 10 分钟

---

### 6. 🟠 SectionEditor 拖拽手柄不可键盘访问

**文件:** `SectionEditor.tsx:252-260`

```tsx
<div className="flex cursor-grab items-center gap-1 px-2 text-muted-400 active:cursor-grabbing" title="拖拽排序">
```

- 使用 `<div>` 而非 `<button>`，无 `role`、`tabIndex`、键盘事件
- `title="拖拽排序"` 但不被屏幕阅读器识别
- 拖拽排序对键盘/屏幕阅读器用户完全不可用

**修复方案:** 添加 `role="button" tabIndex={0}` 和键盘事件处理，或提供备选的上下移动排序方案（已有 Move Up/Down 按钮，可降级）

**预估工时:** 15 分钟

---

### 7. 🟠 ActionBar 图标按钮缺少 aria-label

**文件:** `ActionBar.tsx:76-145`

4 个 icon-only 按钮缺少 `aria-label`：

| 行 | 按钮 | title | aria-label |
|----|------|-------|-----------|
| 76 | 新建 README | `title="新建 README"` | ❌ 缺失 |
| 90 | 撤销 | `title="撤销（⌘Z）"` | ❌ 缺失 |
| 100 | 重做 | `title="重做（⌘⇧Z / ⌘Y）"` | ❌ 缺失 |
| 129 | 分享 | `title="分享 README"` | ❌ 缺失 |

下载按钮（含文字"下载 .md"）和复制按钮（含文字"复制"）不受影响 ✅

**修复方案:** 每个按钮添加 `aria-label` 与 `title` 内容一致

**预估工时:** 5 分钟

---

### 8. 🟠 HeroSection 装饰 SVG 缺少 aria-hidden

**文件:** `HeroSection.tsx:32-62`

4 个特性卡片中的 SVG 图标是纯装饰（与文字配对），但未标记 `aria-hidden="true"`：

```tsx
<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
  ...
</svg>
```

屏幕阅读器会尝试朗读 SVG 中的路径数据，造成噪音。

**修复方案:** 4 个 SVG 均添加 `aria-hidden="true"`

**预估工时:** 5 分钟

---

### 9. 🟠 AsyncBoundary 错误图标使用 emoji

**文件:** `AsyncBoundary.tsx:36`

```tsx
<div className="mb-3 text-3xl">⚠️</div>
```

- 违反 ui-ux-pro-max "No emoji icons" 规则
- emoji 在不同操作系统上渲染不一致
- 屏幕阅读器会朗读"警告符号"

**修复方案:** 替换为 Heroicons `ExclamationTriangleIcon`（`fill="none" viewBox="0 0 24 24"`）

**预估工时:** 5 分钟

---

## P2 — 中等优先级

### 10. 🟡 PreviewPanel TOC 按钮缺少 aria-expanded

**文件:** `PreviewPanel.tsx:139-149`

```tsx
<button
  onClick={() => setShowToc((v) => !v)}
  className="..."
  title="目录"
>
```

- `showToc` 是受控状态，但按钮未反映到 `aria-expanded`
- 辅助技术无法感知目录面板的展开/折叠状态

**修复方案:** 添加 `aria-expanded={showToc}`

**预估工时:** 1 分钟

---

### 11. 🟡 EditWorkspace 重新生成按钮缺少 aria-label

**文件:** `EditWorkspace.tsx:207-224`

```tsx
<button
  onClick={() => handleRegenerate()}
  disabled={regenerating}
  title="重新生成 README 内容"
>
  {regenerating ? (
    <svg className="..." />
  ) : (
    <svg className="..." />
  )}
  {regenerating ? '生成中...' : '重新生成'}
</button>
```

- 虽有文字和 `title`，但文字在 loading 状态时变化
- 缺少 `aria-label` 也可能让某些屏幕阅读器不一致处理

**修复方案:** 添加 `aria-label="重新生成 README"`

**预估工时:** 1 分钟

---

### 12. 🟡 缺少全局 ErrorBoundary

**文件:** `App.tsx`

- `AsyncBoundary` 只处理异步渲染错误，不是真正的 ErrorBoundary
- 无全局 `ErrorBoundary` 包裹应用根节点
- React 18 推荐每个应用至少有一个 ErrorBoundary，防止白屏

**修复方案:** 创建 `ErrorBoundary.tsx` 组件，在 `App.tsx` 根层包裹 `BrowserRouter`

**预估工时:** 15 分钟

---

### 13. 🟡 RepoInput 验证图标缺少 aria-hidden

**文件:** `RepoInput.tsx:67-76`

```tsx
<div className="absolute right-3 top-1/2 -translate-y-1/2" title="URL 格式不正确">
  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-500">!</span>
</div>
```

- `!` 和 `✓` 图标是纯视觉装饰
- 无 `aria-hidden="true"`，屏幕阅读器会朗读"!"和"✓"

**修复方案:** 添加 `aria-hidden="true"` + 用 `role="status"` 或 `aria-live` 通知状态变化

**预估工时:** 5 分钟

---

## 合规总结

### WCAG 2.1 AA 覆盖情况

| 准则 | 状态 | 关联问题 |
|------|------|---------|
| 1.1.1 非文本内容 | ❌ 未达标 | P1#8 — 装饰 SVG 未标记 aria-hidden |
| 1.3.1 信息和关系 | ❌ 未达标 | P0#1 — 输入框无 label；P0#2 — label 无 htmlFor |
| 2.1.1 键盘 | ⚠️ 部分 | P1#6 — 拖拽不可键盘操作 |
| 2.4.1 跳过块 | ❌ 未达标 | P0#4 — 无 skip-link |
| 4.1.2 名称、角色、值 | ❌ 未达标 | P1#5 — 工具栏按钮无 aria-label；P1#7 — 图标按钮无 aria-label |
| 4.1.3 状态消息 | ❌ 未达标 | P0#3 — Toast 无 aria-live |

### 与 v4/v3 的关系

- **v3 token 体系:** 完全落地 ✅
- **v4 emoji 清理:** 已全部完成 ✅
- **无障碍:** v5 首次系统审计，是当前最大的改进空间

### 修复建议优先级

| P | 问题 | 文件 | 预估 |
|---|------|------|------|
| P0 | RepoInput 添加 aria-label | `RepoInput.tsx` | 5m |
| P0 | EditorPanel label + htmlFor | `EditorPanel.tsx` | 5m |
| P0 | ToastContainer aria-live | `Toast.tsx` | 1m |
| P0 | 添加 SkipLink | `App.tsx` + 组件 | 10m |
| P1 | SectionEditor 工具栏 aria-label | `SectionEditor.tsx` | 10m |
| P1 | 拖拽手柄键盘支持 | `SectionEditor.tsx` | 15m |
| P1 | ActionBar 图标按钮 aria-label | `ActionBar.tsx` | 5m |
| P1 | HeroSection SVG aria-hidden | `HeroSection.tsx` | 5m |
| P1 | AsyncBoundary emoji → SVG | `AsyncBoundary.tsx` | 5m |
| P2 | PreviewPanel aria-expanded | `PreviewPanel.tsx` | 1m |
| P2 | EditWorkspace aria-label | `EditWorkspace.tsx` | 1m |
| P2 | ErrorBoundary | 新建 + `App.tsx` | 15m |
| P2 | RepoInput 验证图标 aria-hidden | `RepoInput.tsx` | 5m |

**合计预估工时: 83 分钟（约 1.5 小时）**

---

*—— 由 UI/UX Pro Max skill 辅助生成*
