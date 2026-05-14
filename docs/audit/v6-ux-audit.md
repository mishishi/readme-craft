# v6 UI/UX Audit — Performance, Semantics & Consistency

**Date:** 2026-05-13
**Scope:** React performance patterns, z-index management, button interactions, semantic HTML, dead code
**Method:** Cross-reference ui-ux-pro-max skill (react/ux/web domains) against 12 component files

---

## Summary

| Priority | Count |
|----------|-------|
| P0 (Critical) | 1 |
| P1 (High) | 2 |
| P2 (Medium) | 3 |
| P3 (Low) | 2 |

---

## P0 — Must Fix

### #1. AnalyticsDashboard 标题使用 emoji 图标

**File:** `AnalyticsDashboard.tsx:144`
**Rule:** ui-ux-pro-max "No emoji as icons" — Use SVG icons (Heroicons/Lucide)

The v4 emoji sweep missed `AnalyticsDashboard.tsx:144`:

```tsx
<h1 className="text-xl font-bold text-muted-900">📊 分析看板</h1>
```

**Fix:** Replace 📊 with a Heroicons ChartBarSquareIcon SVG, same as other heading icons in the app.

---

## P1 — Should Fix

### #2. Z-index 冲突：回到顶部按钮穿透模态框

**File:** `PreviewPanel.tsx:247`, `Modal.tsx:93`, `Toast.tsx:60`
**Rule:** `z-index-management` — Define z-index scale system, don't use arbitrary values

The PreviewPanel back-to-top button uses `z-[60]` which is higher than all modal/dialog z-index values (`z-50`):

| Element | z-index | File |
|---------|---------|------|
| Header | `z-40` | Header.tsx |
| History backdrop | `z-40` | HistoryPanel.tsx |
| History drawer | `z-50` | HistoryPanel.tsx |
| Modal | `z-50` | Modal.tsx |
| Toast | `z-50` | Toast.tsx |
| ShortcutHelp | `z-50` | ShortcutHelpPanel.tsx |
| Feedback FAB | `z-50` | EditWorkspace.tsx |
| Clear confirm | `z-50` | Header.tsx |
| **Back-to-top** | **`z-[60]`** | **PreviewPanel.tsx** |
| SkipLink | `z-[100]` | SkipLink.tsx |

The back-to-top button can visually overlap modal overlays when both are visible.

**Fix:** Lower back-to-top to `z-30` (below header and modals). It's a minor scroll helper, not critical UI. Or define a proper z-index scale like:
- `z-10` — decorative
- `z-20` — sticky headers
- `z-30` — floating helpers (back-to-top)
- `z-40` — panels/drawers
- `z-50` — modals/toasts
- `z-[100]` — skip link (must be highest)

### #3. RepoInput 缺少 autocomplete 属性

**File:** `RepoInput.tsx:53`
**Rule:** `Semantic Input Types` / `Autocomplete Attribute` — Inputs need autocomplete for autofill

```tsx
<input
  type="text"
  ...
  aria-label="GitHub 仓库地址"
/>
```

The input collects a GitHub URL but uses `type="text"` with no `autocomplete`. Users lose browser autofill capability.

**Fix:** Add `type="url"` and `autoComplete="url"`:

```tsx
<input
  type="url"
  autoComplete="url"
  ...
/>
```

---

## P2 — Should Fix (Lower Urgency)

### #4. 全局按钮缺少按下状态反馈

**Files:** `btn-primary` / `btn-secondary` base classes in `index.css:16-26`, all button components
**Rule:** `Active States` — Add pressed/active state visual change

Only 2 buttons in the entire app have `active:scale-95`:
- `EditWorkspace.tsx:301` — Feedback FAB
- `FeedbackCard.tsx:111` — Feedback submit button

All other buttons (primary, secondary, ghost) lack any `active:` press feedback. On touch devices this makes taps feel unresponsive.

**Fix:** Add `active:scale-[0.97]` to `btn-primary` and `btn-secondary` base classes. This will cascade to all buttons using these classes.

```css
.btn-primary {
  @apply ... active:scale-[0.97];
}
.btn-secondary {
  @apply ... active:scale-[0.97];
}
```

### #5. GenerateSection 结果卡片的复制按钮缺少 disabled 样式

**File:** `GenerateSection.tsx:340-356`
**Rule:** `Disabled States` — Clearly indicate non-interactive elements

The "复制" button in the result card uses inline classes (not `btn-primary`/`btn-secondary`) and lacks `disabled:cursor-not-allowed disabled:opacity-50`:

```tsx
<button
  onClick={handleCopyFromResult}
  disabled={copying}
  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-button border border-muted-200 bg-white px-3 py-2 text-xs font-medium text-muted-600 transition-colors hover:border-muted-300 hover:bg-muted-50"
>
```

When `disabled={copying}` is true, the button still looks identical to its enabled state (only inline `cursor-pointer` from the utility class is missing). A real click doesn't fire, but there's no visual indication of the disabled state.

**Fix:** Add `disabled:cursor-not-allowed disabled:opacity-50` to the className.

### #6. GenerateSection 的 IIFE 内联条件渲染

**File:** `GenerateSection.tsx:402-438`
**Rule:** React best practices — avoid IIFEs inside JSX

The Modal is rendered inside an IIFE:

```tsx
{showConfirm && state.selectedTemplate && (() => {
  const template = templates.find((t) => t.id === state.selectedTemplate);
  return (
    <Modal ...>
      ...
    </Modal>
  );
})()}
```

This is a React anti-pattern — creates a new function closure every render, prevents dead code elimination, and is harder to maintain.

**Fix:** Extract to a separate inner component or use an early-return pattern.

---

## P3 — Nice to Have

### #7. CSS 死代码

**File:** `index.css:77-91`
**Rule:** Maintain clean CSS — remove unused animation classes

Two CSS classes are defined but never referenced in any component:

- `.typing-animate` (line 77-82) — Typing cursor animation
- `.animate-float` (line 89-91) — Floating animation

These were likely intended for future use or leftover from prototyping.

**Fix:** Remove unused CSS classes.

### #8. Mock 数据中的 emoji 残留

**File:** `mock.ts` (multiple lines)
**Rule:** No emoji as UI icons

The mock test data contains emojis like 📦, 🚀, 📄, etc. in markdown content. These are test fixtures, not UI components, so the priority is low. However, they could mislead future developers about what's acceptable.

**Fix:** Replace emojis in mock data with text equivalents (e.g., "📦 安装" → "安装").

---

## v5 Regression Check

All 13 issues from v5 a11y audit remain fixed. No regressions detected.

- ✅ P0: RepoInput aria-label, EditorPanel htmlFor, Toast aria-live, SkipLink
- ✅ P1: SectionEditor aria-labels, ActionBar aria-labels, HeroSection aria-hidden, AsyncBoundary SVG
- ✅ P2: PreviewPanel aria-expanded, EditWorkspace aria-label, ErrorBoundary

## Already Compliant

- **`prefers-reduced-motion`** — ✅ Implemented in `index.css:152-158` (reduces all animation/transition to 0.01ms)
- **Google Fonts `display=swap`** — ✅ Configured in `index.html:10` URL parameter
- **Loading states** — ✅ Spinners/skeletons used for async operations (GenerateSection, AnalyticsDashboard, RepoInfoCard)
- **Empty states** — ✅ AnalyticsDashboard has `<EmptyState />` component
- **Error feedback** — ✅ Toast notifications + inline error messages with retry buttons
- **Focus states** — ✅ All interactive elements have `focus-visible:ring-2`
- **Touch targets** — ✅ `min-h-[44px] sm:min-h-0` pattern on mobile buttons
- **Semantic buttons** — ✅ Using `<button>` elements consistently (no `<div role="button">`)
- **cursor-pointer** — ✅ On all clickable elements via base classes
