# v8 UI/UX Audit — Bundle Performance, Error Handling Consistency & Security

**Date:** 2026-05-13
**Scope:** Bundle performance, error handling patterns, security vectors, server-side resilience, dependency freshness
**Method:** Cross-reference ui-ux-pro-max skill (react/web domains) against frontend build output, server code, and all component interaction paths

---

## Summary

| Priority | Count |
|----------|-------|
| P0 (Critical) | 1 |
| P1 (High) | 2 |
| P2 (Medium) | 3 |
| P3 (Low) | 2 |

---

## P0 — Critical

### #1. rehype-raw 插件允许原始 HTML 注入 (XSS)

**File:** `PreviewPanel.tsx:4,182`
**Rule:** `react/web` — sanitize user-renderable content; never pass raw HTML through markdown from untrusted sources

```tsx
import rehypeRaw from 'rehype-raw';

// ...
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeRaw]}
>
  {markdown}
</ReactMarkdown>
```

`rehypeRaw` enables raw HTML passthrough in markdown content. The markdown source comes from:

1. **AI generation** (MiniMax API) — AI providers can theoretically generate `<script>`, `<iframe>`, or event-handler attributes in raw HTML blocks
2. **User editing** (EditorPanel) — authenticated users can arbitrarily edit section content and inject `<script onerror=...>` or `<img onerror=...>` payloads

Attack vectors enabled by rehypeRaw:
- `<img src=x onerror="alert(document.cookie)">` — script execution via error handler
- `<a href="javascript:alert(1)">click</a>` — javascript: URI navigation  
- `<div onmouseover="stealCookies()">hover</div>` — event handler injection

**Severity:** Critical (UI renders content from two untrusted-or-trusted-but-unvalidated sources)

**Fix:** `rehype-sanitize` (or `rehype-remove-comments`) to strip all HTML tags except safe ones:

```tsx
import rehypeSanitize from 'rehype-sanitize';
// ...
rehypePlugins={[rehypeRaw, rehypeSanitize]}
```

If raw HTML rendering (e.g., `<details>`, `<kbd>`) is intentionally needed, pass a custom sanitize schema with only those specific tags allowed. Also sanitize on the editor side: strip `javascript:` URLs and event handlers from any rendered content.

---

## P1 — High

### #2. 主 JS 产物过大 (1.6 MB)，无代码分割

**File:** `dist/assets/index-BDec5yFz.js` (1.6 MB unminified, ~535 KB gzipped)
**Rule:** `react/web` — `react` chunk size warning at 500 KB; 1.6 MB causes significant initial load delay

Vite build produces a single JS chunk containing the entire application. Major contributors:

| Dependency | Est. Size | Usage |
|-----------|-----------|-------|
| `react-syntax-highlighter` (Prism) | ~500 KB | `PreviewPanel.tsx` — code block highlighting |
| `recharts` | ~400 KB | `AnalyticsDashboard.tsx` — admin charts |
| `react-router-dom` v7 | ~200 KB | `App.tsx` — routing |
| `react-markdown` + plugins | ~100 KB | `PreviewPanel.tsx` — MD rendering |
| App code (all components + context) | ~400 KB | — |

The 1.6 MB bundle affects:
- **Time-to-Interactive**: Full JS must parse/execute before any page is usable (no lazy routes)
- **Mobile users**: 535 KB gzipped is still heavy on slow 3G connections
- **Cache invalidation**: Single chunk means any code change invalidates the entire cache

**Fix:** Implement code splitting at route level:

```tsx
// App.tsx — lazy load route-level components
const HomePage = React.lazy(() => import('./components/HomePage'));
const EditorPage = React.lazy(() => import('./components/EditorPage'));
const AdminLayout = React.lazy(() => import('./components/AdminLayout'));
```

Also extract heavy deps into separate chunks:

```tsx
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-editor': ['react-syntax-highlighter', 'react-markdown', 'rehype-raw', 'remark-gfm'],
        'vendor-admin': ['recharts'],
      },
    },
  },
},
```

For `react-syntax-highlighter` specifically, use the light build with only required languages:

```tsx
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
```

### #3. GenerateSection 缺少服务端错误码中文翻译

**File:** `GenerateSection.tsx:194-201`
**Rule:** `ux/error-feedback` — Error messages should be localized consistently across all components

Compare error handling between GenerateSection and EditWorkspace:

**GenerateSection.tsx** (缺少翻译):
```tsx
catch (err) {
  if (err instanceof DOMException && err.name === 'AbortError') return;
  const msg = err instanceof Error ? err.message : '生成失败';
  setError(msg);
  dispatch({ type: 'GENERATE_ERROR', payload: msg });
}
```

**EditWorkspace.tsx** (有翻译):
```tsx
const errCode = (err as any).code;
let userMessage = errMessage;
if (errCode === 'RATE_LIMIT') {
  userMessage = '请求太频繁，请稍后再试';
} else if (errCode === 'AUTH_ERROR') {
  userMessage = 'AI 服务配置异常，请联系管理员';
}
```

The server (`server/src/routes/generate.ts:166-174`) returns structured error codes:
```tsx
code: isRateLimit ? 'RATE_LIMIT' : isAuth ? 'AUTH_ERROR' : 'GENERATION_FAILED',
```

When the MiniMax API returns a rate-limit error (English message), generate-readme endpoint wraps it with `RATE_LIMIT` code. EditWorkspace correctly translates this to "请求太频繁，请稍后再试", but GenerateSection shows the raw English message to the user.

**Impact:** Users who trigger rate limits or auth errors via the main generation button see raw English error messages, while EditWorkspace users see localized Chinese messages. This is a consistency and UX quality issue.

**Fix:** Add the same error code translation in GenerateSection.tsx:

```tsx
catch (err) {
  if (err instanceof DOMException && err.name === 'AbortError') return;
  const msg = err instanceof Error ? err.message : '生成失败';
  const errCode = (err as any).code;
  let userMessage = msg;
  if (errCode === 'RATE_LIMIT') {
    userMessage = '请求太频繁，请稍后再试';
  } else if (errCode === 'AUTH_ERROR') {
    userMessage = 'AI 服务配置异常，请联系管理员';
  }
  setError(userMessage);
  dispatch({ type: 'GENERATE_ERROR', payload: userMessage });
}
```

Also consider extracting error code translation into a shared utility (`services/errors.ts`) to prevent future divergence:

```tsx
export function translateError(err: unknown): string {
  const msg = err instanceof Error ? err.message : '操作失败';
  const code = (err as any)?.code;
  if (code === 'RATE_LIMIT') return '请求太频繁，请稍后再试';
  if (code === 'AUTH_ERROR') return 'AI 服务配置异常，请联系管理员';
  return msg;
}
```

---

## P2 — Medium

### #4. 服务端内存缓存无失效机制

**File:** `server/src/routes/generate.ts:26-27,78-85`
**Rule:** `ux` — Cache should have invalidation strategy beyond fixed TTL

```tsx
const generateCache = new Map<string, { markdown: string; expiresAt: number }>();
const GENERATE_CACHE_TTL = 30 * 60 * 1000; // 30 分钟
```

The in-memory Map cache has two issues:

1. **No GitHub webhook invalidation**: If a repo's README content changes on GitHub (new push, updated docs), users still get the 30-minute-old cached response
2. **No LRU eviction**: The Map grows unboundedly. Each cached entry stores the full markdown string (potentially several KB each). Under heavy use, this is a memory leak
3. **No server restart persistence**: Standard for in-memory cache, but worth noting — all caches are lost on restart, causing a stampede of concurrent generations

**Fix:**
- Add `Map.size` guard: cap at 100 entries, evict oldest when exceeded
- Add `/api/admin/cache-clear` endpoint for manual invalidation (e.g. via GitHub webhook)
- For post-MVP: consider Redis or persistent cache for production

### #5. preScanProject 缺少 AbortSignal

**File:** `api.ts:20-26` → `RepoInput.tsx:33-34`
**Rule:** `react/web` — Fetch requests in React components should be abortable on unmount

```tsx
export async function preScanProject(owner: string, repo: string, branch: string): Promise<void> {
  fetch('/api/pre-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner, repo, defaultBranch: branch }),
  }).catch(() => { /* background scan, ignore errors */ });
}
```

The `preScanProject` function fires a fetch without an `AbortSignal`, and is called from `RepoInput.handleFetch` without `await`:

```tsx
preScanProject(parsed[0], parsed[1], info.defaultBranch);
```

Issues:
- If the user navigates away from the page before the pre-scan completes, the request continues in the background
- No way to cancel if the user submits a new repo URL before the previous pre-scan completes
- The `catch()` silently swallows all errors, making pre-scan failures invisible

**Fix:** Accept an optional `AbortSignal`:

```tsx
export async function preScanProject(
  owner: string, repo: string, branch: string, signal?: AbortSignal
): Promise<void> {
  fetch('/api/pre-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner, repo, defaultBranch: branch }),
    signal,
  }).catch(() => {});
}
```

And in RepoInput, tie it to component lifecycle:

```tsx
useEffect(() => {
  const ctrl = new AbortController();
  // store ctrl in ref, abort on cleanup
  return () => ctrl.abort();
}, []);
```

### #6. GenerateSection 取消按钮导航走而非原地停止

**File:** `GenerateSection.tsx:144-150`
**Rule:** `ux/error-feedback` — Cancel should preserve context; only navigate if user explicitly chooses to leave

```tsx
const handleCancel = useCallback(() => {
  if (abortRef.current) {
    abortRef.current.abort();
    abortRef.current = null;
  }
  navigate('/');
}, [navigate]);
```

When the user clicks "取消生成":
1. The AbortController fires (correct)
2. `navigate('/')` immediately sends the user back to the homepage

This is jarring — the user sees the page change instantly, but the AbortError handling in `handleGenerate` continues to execute (`finally` block runs state cleanup). The visual transition is:
1. User clicks "取消" → page navigates to `/`
2. Generation state cleanup fires (race condition — may dispatch after unmount)
3. User is left wondering whether generation was actually cancelled

**Better approach:** Stay on the same page, show a "已取消" state, let the user decide next action:

```tsx
const handleCancel = useCallback(() => {
  if (abortRef.current) {
    abortRef.current.abort();
    abortRef.current = null;
  }
  dispatch({ type: 'GENERATE_CANCELLED' }); // new action type
  dispatch({
    type: 'SHOW_TOAST',
    payload: { message: '已取消生成', type: 'info' },
  });
}, [dispatch]);
```

---

## P3 — Low

### #7. 依赖包版本落后

**Rule:** `react` — Keep dependencies reasonably up-to-date to receive bug fixes and security patches

From `package.json` (known versions):
- `vite` 5.4.x → latest 5.4.14+ (5.4 series still active)
- `typescript` 5.5.x → latest 5.7+ (2 minor versions behind)
- `tailwindcss` 3.4.x → latest 3.4.17+ (3.4 series still active)
- `vitest` 3.2.x → latest 3.x (current)
- `react` 18.3.1 → 18.3.1 is latest (stable)
- `react-router-dom` 7.15 → 7.x is latest

Major packages are on current major versions. The TS minor version gap (5.5 → 5.7) may cause missed diagnostic improvements but no breaking changes. No known CVEs reported for any currently-used dependency versions.

**Recommendation:** Schedule `npm update` quarterly. No urgent action needed for current builds.

### #8. Toast 容器与回到顶部按钮可能重叠

**File:** `Toast.tsx:ToastContainer`, `PreviewPanel.tsx:244-255`
**Rule:** `ux/z-index` — Fixed-positioned elements in the same corner should account for each other

- Toast container: `fixed bottom-4 right-4 z-50`  
- Back-to-top: `fixed bottom-6 right-6 z-30`

Toast stack grows upward from bottom-4 (16px). Back-to-top is at bottom-6 (24px) right-6 (24px). With multiple toasts stacked vertically (each ~44px + 8px gap), at 2+ toasts the stack visually overlaps the back-to-top button.

The back-to-top appears only on the editor preview panel (when header scrolls out of view). The toast container appears on all pages (App.tsx:196). So they can coexist on the editor page.

**Fix:** Offset the toast container on the editor page, or add `mb-14` to the toast container to clear the back-to-top zone:

```tsx
// ToastContainer.tsx
<div className={`fixed bottom-4 right-4 z-50 flex w-72 flex-col gap-2 ${isEditor ? 'mb-14' : ''}`} ...>
```

Alternatively, move back-to-top to `bottom-20` to live below the toast zone.

---

## v7 Regression Check

All 9 findings from v7 audit remain fixed. No regressions detected.

- ✅ #1. ShowcaseSection keyboard navigation (ArrowLeft/ArrowRight)
- ✅ #2. Modal backdrop cursor-pointer removed
- ✅ #3. CombinedProvider dispatch — acceptable at current scale (documented for future)
- ✅ #4. AsyncBoundary → ErrorBoundary rename
- ✅ #5. AbortError `isAbortError()` helper with dual check
- ✅ #6. Toast close button 36x36px minimum touch target
- ✅ #7. Toast message `break-words hyphens-auto`
- ✅ #8. StepIndicator — acceptable heuristic (documented for future)
- ✅ #9. ToastContainer dynamic `aria-live` based on toast urgency

## Already Compliant

- **TypeScript strict mode** — ✅ `npx tsc --noEmit` passes with zero errors
- **Build output** — ✅ No build errors; single warning for chunk size (this audit)
- **Loading states** — ✅ Spinners, skeletons, and disabled states on all async operations
- **Error boundaries** — ✅ ErrorBoundary wraps all content with retry capability (v6 regression fix)
- **Accessibility** — ✅ aria-labels, focus-visible rings, keyboard nav, skip-link all present
- **Server error structure** — ✅ Consistent `{ error, code, retryAfter }` error response format
- **Session persistence** — ✅ SessionStorage auto-save with requestAnimationFrame batching
- **Undo/Redo** — ✅ ActionBar + keyboard shortcuts (⌘Z/⌘⇧Z/⌘Y) with MAX_HISTORY=50
- **Touch targets** — ✅ Min 44px mobile touch targets across all interactive elements

---

## Recommendations Summary

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | Add `rehype-sanitize` to rehype plugins | Low (1 import) | Critical |
| 2 | Code-splitting: lazy routes + manualChunks | Medium (1-2 hours) | High (bundle -60%) |
| 3 | Extract shared error translation utility | Low (15 min) | Medium |
| 4 | Add cache size cap + clear endpoint | Low (30 min) | Medium |
| 5 | Add AbortSignal to preScanProject | Low (15 min) | Low |
| 6 | Change cancel to stay on page | Low (10 min) | Medium |
| 7 | Schedule npm update quarterly | — | Maintenance |
| 8 | Fix toast/back-to-top overlap | Low (5 min) | Low |
