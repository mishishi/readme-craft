# readme-craft

中文 GitHub README 生成器。输入仓库地址，选模板，AI 一键生成 README。

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v3 (前端) · Fastify ESM (后端) · MiniMax API (AI)

Status: 5 模板功能完整，生产部署中。支付未集成。

## Quick Start

```bash
npm run dev              # 同时启动前端 (3002) + 后端 (3001)
npm run dev:server       # 仅后端 (watch)
npm run dev:frontend     # 仅前端 (Vite HMR)
npm run build            # 构建前端 → frontend/dist/
npm run install:all      # 安装根目录 + 前后端所有依赖
```

## Architecture

```
readme-craft/
├── frontend/src/
│   ├── components/   # 每文件一组件，default export
│   ├── context/      # 三层 Context (Repo + Editor + UI)
│   ├── services/     # API / GitHub / Markdown / 事件追踪
│   ├── templates/    # 5 个模板定义
│   └── types/        # AppState, AppAction (26 种), RepoInfo
├── server/src/
│   ├── routes/       # generate / repo / pre-scan / analytics
│   └── services/     # MiniMax 集成 / Prompt 构建
└── docs/
    ├── audit/        # v1-v9 审计报告
    └── claude/       # 参考文档 (@imports)
```

### 数据流

```
GitHub URL → fetchRepoInfo() → POST /api/fetch-repo-info → GitHub API → 展示仓库信息
用户选模板 → POST /api/generate-readme → MiniMax API → Markdown → 解析为 Sections
表单编辑 (useReducer) ↔ 实时预览 → 一键复制 / 下载 .md
```

### 状态管理

三层 Context 嵌套，共享同一个 `AppAction` discriminated union：
```
RepoContext (repo URL / repoInfo / loading)
  → EditorContext (模板 / sections / undo/redo)
    → UIContext (toasts)
      → CombinedProvider (合并 state，透传 dispatch)
```

## Conventions

### Naming
| 类别 | 规则 |
|------|------|
| 组件文件 | PascalCase: `TemplateSelector.tsx` |
| 非组件文件 | camelCase: `api.ts`, `editorReducer.ts` |
| 类型/接口 | PascalCase: `RepoInfo`, `AppAction` |
| 变量/函数 | camelCase: `handleSelect`, `loadingRepo` |
| 常量 | UPPER_SNAKE: `MAX_HISTORY` |

### Components
- 每文件一组件，**default export**
- Props 用 `interface {ComponentName}Props`
- 事件处理用 `useCallback` 包裹
- 异步操作用 `try/catch/finally` + AbortSignal 取消

### Styling
- **ALWAYS** use Tailwind design tokens: `text-brand-600`, `shadow-card`, `rounded-button`
- **NEVER** use inline styles, hardcoded colors (`text-blue-600`), or emoji as icons
- **NEVER** add `z-0` to `<main>` — creates stacking context that breaks sticky header

### Template System
⚠️ **YOU MUST** sync all 4 files when modifying a template:
1. `frontend/src/templates/index.ts` — 模板定义
2. `frontend/src/components/TemplatePreview.tsx` — 静态 HTML 预览
3. `frontend/src/components/RepoPreview.tsx` — 动态仓库信息预览
4. `server/src/services/prompts.ts` — AI prompt

### Commit Messages
- 用**中文**写，描述动机而非代码变更
- 前缀: `feat:` / `fix:` / `ci:` / `docs:` / `debug:` / `test:`

## Gotchas

### CSS / Rendering
- `backdrop-blur-xl` + `position: sticky` 在 Chrome 中会导致 z-index stacking context 异常。如果 header 被内容覆盖，**NEVER** 在 `<main>` 上加 `z-0`，尝试调高 `z-header` 值。目前该问题已缓解但未彻底修复。
- z-index 层级: header(50) / dropdown(55) / toast(60) / modal(60) / fab(65) / backToTop(70)

### Server (Fastify ESM)
- **ALWAYS** use `.js` extension in relative imports: `import from './foo.js'` — 否则运行时报错
- **NEVER** rsync with `--delete` unless `.env` is confirmed excluded (`.gitignore` rules)
- MiniMax API 可能超时或返回空内容，前端有中文错误提示

### Frontend
- **NEVER** use `crypto.randomUUID` — HTTP 环境不支持，用 `uuid()` 工具函数
- `historyIndex` **MUST** point to `history.length - 1` after latest state — UNDO/REDO 前调用 `pushHistory()`

## Reference

- @docs/claude/api-reference.md — API 路由详情、请求/响应格式
- @docs/claude/architecture-decisions.md — 技术选型决策表
- @docs/claude/state-architecture.md — 三层 Context 详解 + 持久化策略
- @docs/claude/deployment.md — CI/CD / PM2 / rsync 部署
