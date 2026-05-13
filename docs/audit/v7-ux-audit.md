# v7 UI/UX Audit — Component Architecture, Keyboard Navigation & Edge Cases

**Date:** 2026-05-13
**Scope:** Context architecture, component naming, keyboard accessibility, modal/touch patterns, overflow resilience
**Method:** Cross-reference ui-ux-pro-max skill (react/ux/web domains) against 7 component files + AppContext

---

## Summary

| Priority | Count |
|----------|-------|
| P0 (Critical) | 0 |
| P1 (High) | 2 |
| P2 (Medium) | 5 |
| P3 (Low) | 2 |

---

## P1 — Should Fix

### #1. ShowcaseSection 横向滚动容器缺少键盘导航支持

**File:** `ShowcaseSection.tsx:94-98`
**Rule:** `keyboard-nav` — Tab order matches visual order; arrow key navigation for scrollable containers

The showcase card row uses a horizontal scroll container but has no keyboard arrow-key navigation:

```tsx
<div
  ref={scrollRef}
  className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
  style={{ scrollbarWidth: 'none' }}
>
```

Each card is a `<button>` and reachable via Tab, but once focus lands on the first/last card, users have no way to navigate horizontally to off-screen cards. The `snap-mandatory` exacerbates this — a user who tabs to card #4 (off-screen right) won't see it scroll into view unless the browser handles scroll-into-view, and there's no programmatic scroll control via arrow keys.

**Fix:** Add `role="list"` to the container and `role="listitem"` to each card. Implement arrow key handlers on the container:

```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    const cards = scrollRef.current?.querySelectorAll<HTMLButtonElement>('button');
    if (!cards) return;
    const currentIdx = Array.from(cards).indexOf(document.activeElement as HTMLButtonElement);
    const nextIdx = e.key === 'ArrowRight'
      ? Math.min(currentIdx + 1, cards.length - 1)
      : Math.max(currentIdx - 1, 0);
    cards[nextIdx]?.focus();
    cards[nextIdx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
};
```

Apply `onKeyDown={handleKeyDown}` and `tabIndex={0}` on the container, with `tabIndex={-1}` on individual cards.

### #2. Modal 遮罩层 cursor-pointer 产生误导

**File:** `Modal.tsx:93`
**Rule:** `cursor-pointer` — Only on interactive elements; backdrop is not interactive

```tsx
className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm cursor-pointer"
```

The dimmed overlay (`bg-black/30`) has `cursor-pointer`, which suggests the entire backdrop is clickable. While clicking the backdrop does dismiss the modal (line 97), the cursor change across the entire viewport is misleading — users are led to believe the transparent area is a button rather than a dismiss gesture.

**Fix:** Remove `cursor-pointer` from the overlay. The dismiss-on-backdrop-click behavior is a secondary UX pattern; the primary close action should be the Cancel/Confirm buttons. Using `cursor-default` on the overlay makes the dismiss feel like a convenience gesture, not a primary action.

---

## P2 — Should Fix (Lower Urgency)

### #3. CombinedProvider 的 dispatch 透传所有 action 到三个子 context

**File:** `AppContext.tsx:42-48`
**Rule:** React performance — avoid unnecessary reducer invocations

```tsx
const dispatch = useCallback(
  (action: AppAction) => {
    repo.dispatch(action);
    editor.dispatch(action);
    ui.dispatch(action);
  },
  [repo.dispatch, editor.dispatch, ui.dispatch]
);
```

Every dispatched action is forwarded to all three sub-reducers (repo, editor, ui), even actions that only one of them handles. For example, `FETCH_REPO_START` goes through all three reducers. Each reducer runs its switch logic and returns state unchanged for unhandled actions. While React's bail-out logic prevents re-renders when state is identical, the reducer functions still execute unnecessary branches.

The same concern applies to the `useMemo` spread at line 33-40:

```tsx
const state = useMemo<AppState>(
  () => ({
    ...repo.state,
    ...editor.state,
    ...ui.state,
  }),
  [repo.state, editor.state, ui.state]
);
```

Any change in any sub-context creates a new object reference, meaning all `useApp()` consumers re-evaluate. The spread is a flat merge — if two sub-contexts ever have overlapping keys, silent overwriting occurs.

**Fix:** Currently acceptable for this app's scale (small number of consumers). For growth, consider:
- Type-safe action routing: wrap each sub-dispatch to only forward relevant action types
- Or use `useSyncExternalStore` / Zustand for selective subscription to avoid full-state-spread re-renders

### #4. AsyncBoundary 命名不当（非异步边界）

**File:** `AsyncBoundary.tsx:1`
**Rule:** Naming conventions — component name must reflect its actual behavior

```tsx
export default class AsyncBoundary extends Component<Props, State> {
```

`AsyncBoundary` is a **class-component error boundary** (using `getDerivedStateFromError` / `componentDidCatch`). The name suggests it handles React Suspense / async rendering boundaries (e.g., `Suspense` with `fallback`), but it has nothing to do with async operations — it catches render-phase JavaScript errors.

This creates confusion:
- A developer looking for Suspense-style loading boundaries will waste time examining this component
- The `fallback` prop name further mimics Suspense, reinforcing the misdirection
- It doesn't handle loading states, error recovery beyond "重试" (state reset), or async rendering

**Fix:** Rename to `ErrorBoundary` (or `ErrorFallbackBoundary`). The component is correctly implemented as an error boundary — only the name is wrong.

### #5. ShowcaseSection 中 AbortError 判断在 catch 后仍触发 toast

**File:** `ShowcaseSection.tsx:49-56`
**Rule:** Error handling — abort errors should not surface to users

```tsx
catch (err) {
  if (err instanceof DOMException && err.name === 'AbortError') return;
  const msg = err instanceof Error ? err.message : '获取仓库信息失败';
  dispatch({ type: 'FETCH_REPO_ERROR', payload: msg });
  dispatch({
    type: 'SHOW_TOAST',
    payload: { message: msg, type: 'error' },
  });
  trackEvent('showcase_failed', { error: msg });
}
```

The early return `return` correctly exits for `AbortError`, but the `finally` block at line 59 runs `setLoadingRepo(null)` — which is correct. However, the `FETCH_REPO_ERROR` dispatch before `return` sets `repoError` in state, potentially showing an inline error message that disappears on the next successful fetch.

More importantly, the `AbortError` check relies on `DOMException` which isn't guaranteed across all environments (Node.js, test runners).

**Fix:** Also dispatch `FETCH_REPO_ERROR` only after the `AbortError` check passes (already the case). For robustness, check `err instanceof Error && err.name === 'AbortError'` as a fallback.

### #6. Toast 关闭按钮触摸区域过小

**File:** `Toast.tsx:40-48`
**Rule:** `touch-target-size` — Minimum 44x44px touch targets

```tsx
<button
  onClick={() => onClose(id)}
  className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
  aria-label="关闭提示"
>
  <svg className="h-3.5 w-3.5" ... />
</button>
```

This button has:
- Mobile: 44x44px minimum ✅ (via `min-h-[44px] min-w-[44px]`)
- Desktop: `sm:min-h-0 sm:min-w-0` removes the minimum, leaving only `p-0.5` (~2px padding) → the hit target shrinks to the SVG itself (~14px)

The desktop touch target (~14px) is smaller than the recommended 44x44px and even the minimum 24x24px for pointer devices. A user with a mouse has to aim precisely at the small X icon.

**Fix:** Keep the min dimensions at all breakpoints. Remove `sm:min-h-0 sm:min-w-0` and instead pad the SVG:

```tsx
className="shrink-0 rounded p-1.5 opacity-70 transition-colors hover:opacity-100 hover:bg-black/10 min-h-[36px] min-w-[36px] flex items-center justify-center"
```

36px is a reasonable compromise — not as generous as mobile 44px but well above the unusably-small 14px.

### #7. Toast 消息文本可能溢出容器

**File:** `Toast.tsx:38-39`, `ToastContainer.tsx:60`
**Rule:** Content overflow — handle long text gracefully

```tsx
// Toast.tsx
<span>{message}</span>

// ToastContainer.tsx
<div className="fixed bottom-4 right-4 z-50 flex w-72 flex-col gap-2" ...>
```

The toast message `<span>` has no text-overflow handling. A long error message (e.g., an API response throwing a verbose error string) could overflow the `w-72` (288px) container, breaking the toast layout.

Also, the toast container at `bottom-4 right-4` could overlap with the back-to-top button (PreviewPanel.tsx:246, `bottom-6 right-6`). Both use `fixed` positioning in the same corner.

**Fix:** Add overflow handling to the message span:

```tsx
<span className="break-words hyphens-auto">{message}</span>
```

For the back-to-top overlap, consider offsetting the toast container above the back-to-top button zone, or add `mb-14` to the toast container.

---

## P3 — Nice to Have

### #8. StepIndicator 步骤判定依赖隐式状态而非显式状态机

**File:** `StepIndicator.tsx:14-17`
**Rule:** UX semantics — step indicators should map to explicit state machine, not derived heuristics

```tsx
let currentStep = 0;
if (state.repoInfo) currentStep = 1;
if (state.repoInfo && state.selectedTemplate) currentStep = 2;
if (state.sections.length > 0 || state.title) currentStep = 3;
```

The current step is derived from the *presence* of data rather than an explicit step state. This works currently but is fragile:
- If `state.sections.length > 0` is true but the user hasn't actually completed generation (e.g., restored from sessionStorage mid-edit), step 4 is shown as current
- If a user clears all sections, they "fall back" to step 2 even though they selected a template
- There's no way to represent a "generating" sub-step between steps 2 and 3

**Fix:** Add an explicit `step` field to `EditorState` that tracks the current workflow phase. Derive the initial value from existing state on session restore, but step transitions should be explicit dispatch actions.

### #9. Toast 的 aria-live 使用 `polite` 而非 `assertive`

**File:** `ToastContainer.tsx:60`
**Rule:** Accessibility — error/warning toasts should use `assertive` for priority

```tsx
<div className="fixed bottom-4 right-4 z-50 flex w-72 flex-col gap-2" aria-live="polite" role="status">
```

All toasts share `aria-live="polite"` regardless of type. Error and warning toasts (which represent user-facing problems) should use `aria-live="assertive"` to interrupt screen reader announcements. Success and info toasts can remain `polite`.

**Fix:** Set `aria-live` dynamically based on toast type:

```tsx
const isUrgent = state.toasts.some(t => t.type === 'error' || t.type === 'warning');
<div
  className="..."
  aria-live={isUrgent ? 'assertive' : 'polite'}
  role="status"
>
```

---

## v6 Regression Check

All 8 issues from v6 audit remain fixed. No regressions detected.

- ✅ P0: AnalyticsDashboard emoji → SVG (or removed)
- ✅ P1: Z-index conflict — back-to-top at `z-30`, modals at `z-50`
- ✅ P1: RepoInput `type="url"` + `autoComplete="url"`
- ✅ P2: Button active states (`active:scale-[0.97]` on btn-primary/secondary)
- ✅ P2: GenerateSection copy button `disabled:opacity-50`
- ✅ P2: GenerateSection IIFE removed
- ✅ P3: Dead CSS (`.typing-animate`, `.animate-float`) removed
- ✅ P3: Mock data emojis replaced

## Already Compliant

- **focus-visible rings** — ✅ Present on all interactive elements across components
- **aria-labels** — ✅ Icon-only buttons have `aria-label` (PreviewPanel copy, Toast close, Modal close via Escape)
- **Keyboard Escape** — ✅ Modal handles Escape key, Toast dismisses on timeout
- **Reduced motion** — ✅ `prefers-reduced-motion` respected globally (index.css)
- **Touch targets (mobile)** — ✅ `min-h-[44px]` pattern on mobile across components
- **Loading states** — ✅ ShowcaseSection has spinner + skeleton during fetch; GenerateSection has CompactSkeleton
- **Error boundaries** — ✅ AsyncBoundary (despite naming issue) wraps content with retry
- **Focus trapping** — ✅ Modal implements focus trapping with tab cycling
- **Form labels** — ✅ RepoInput has `aria-label`, Modal has `aria-label={title}`
