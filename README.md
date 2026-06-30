# ReadMe Craft

AI-powered GitHub README generator. Input a repository URL, select a template, and get a polished README in seconds.

[Live Demo](https://openginko.tech) · [GitHub](https://github.com/mishishi/readme-craft)

---

## Features

- **One-click generation** — Paste a GitHub URL, pick a template, get a complete README
- **7 templates** — From minimalist to enterprise-grade, find a style that fits your project
- **Real-time preview** — Edit sections inline and see changes instantly
- **Rich editing** — Add, delete, reorder, and customize sections with full undo/redo
- **Multi-language output** — Generate READMEs in Chinese or English
- **Event analytics** — Built-in dashboard tracks generation usage (admin panel)
- **Session persistence** — State survives page refresh; history lets you restore any previous version

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS v3 · React Router v7 |
| Backend | Fastify ESM · TypeScript · Node.js 18+ |
| AI | MiniMax API (glm-4-plus) |
| Database | sql.js (SQLite in-process) · NDJSON for event log |
| Proxy | Custom GitHub API proxy (avoids CORS + rate limits) |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- MiniMax API key ([apply here](https://platform.minimaxi.com))
- GitHub Personal Access Token (optional, for higher API rate limits)

### Install

```bash
# Clone the repository
git clone https://github.com/mishishi/readme-craft.git
cd readme-craft

# Install all dependencies (root + frontend + server)
npm run install:all
```

### Configure

```bash
# Copy server environment template
cp server/.env.example server/.env

# Edit server/.env and fill in:
#   MINIMAX_API_KEY=your_key_here
#   GITHUB_TOKEN=your_github_token_here   # optional
```

### Run

```bash
# Start both frontend (port 3002) and backend (port 3001) with watch mode
npm run dev

# Or run them separately:
npm run dev:server   # Backend only (port 3001)
npm run dev:frontend # Frontend only (port 3002)
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

### Build for Production

```bash
npm run build        # Builds frontend → frontend/dist/
```

---

## Project Structure

```
readme-craft/
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── components/        # 20+ React components
│   │   ├── context/            # AppContext, RepoContext, EditorContext, UIContext
│   │   ├── pages/             # HomePage, EditorPage, AuthCallback
│   │   ├── services/          # api, github, markdown, tracking
│   │   ├── templates/         # 7 template definitions (frontend preview)
│   │   └── types/             # AppState, AppAction, RepoInfo
│   └── vite.config.ts         # Dev proxy: /api → localhost:3001
├── server/                    # Fastify API server
│   ├── src/
│   │   ├── routes/            # generate, repo, pre-scan, analytics, auth
│   │   └── services/          # MiniMax, GitHub proxy, db, templates
│   └── data/                  # analytics.db, events.ndjson
├── docs/claude/               # Internal architecture docs
│   ├── api-reference.md
│   ├── architecture-decisions.md
│   ├── state-architecture.md
│   └── deployment.md
└── .github/workflows/        # CI/CD (deploy to production on push to main)
```

---

## How It Works

```
GitHub URL → POST /api/fetch-repo-info → GitHub REST API (proxied)
     ↓
Repository metadata extracted (name, description, language, stars, topics, license)
     ↓
User selects a template
     ↓
POST /api/generate-readme → MiniMax API (glm-4-plus) → Markdown
     ↓
Markdown parsed into editable Sections (title, preamble, content blocks)
     ↓
User edits sections in real-time editor
     ↓
Copy to clipboard or download as .md file
```

---

## Templates

| ID | Name | Style | Best For |
|----|------|-------|----------|
| `minimal` | 极简清风 | Clean, whitespace-first | Libraries / tools |
| `neo-minimal` | 新极简 | Modern minimal with accent color | Personal projects |
| `badges` | Badge 大满贯 | Badge wall + feature cards | Open source |
| `enterprise` | 企业蓝图 | Formal, table-heavy | Commercial / team |
| `cards` | 卡片视界 | Card-based layout | Frontend / design |
| `showcase` | 项目展厅 | Banner + screenshots | Apps / portfolios |
| `zh-type` | 中文专版 | Full Chinese layout | Chinese-language projects |

---

## API Reference

### `POST /api/generate-readme`

Generate a README from a GitHub repository.

**Request:**
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "templateId": "minimal",
  "repoInfo": {
    "name": "repo-name",
    "description": "Short description",
    "language": "TypeScript",
    "stars": 1000,
    "topics": ["react", "typescript"],
    "owner": "owner-name",
    "license": "MIT",
    "defaultBranch": "main"
  }
}
```

**Response:**
```json
{
  "markdown": "# Title\n\n## Section\n..."
}
```

### `POST /api/fetch-repo-info`

Proxy to GitHub REST API. Avoids CORS and respects configured rate limits.

**Request:**
```json
{ "url": "https://github.com/owner/repo" }
```

**Response:**
```json
{
  "name": "repo",
  "fullName": "owner/repo",
  "description": "...",
  "language": "TypeScript",
  "stars": 1000,
  "topics": ["react"],
  "owner": "owner",
  "license": "MIT",
  "htmlUrl": "https://github.com/owner/repo",
  "defaultBranch": "main"
}
```

### `GET /api/health`

Health check. Returns whether the GitHub token is configured.

```json
{ "status": "ok", "githubTokenConfigured": true }
```

### Mock Mode

During frontend development, set `USE_MOCK=true` in `frontend/src/services/config.ts` to bypass the backend and use hardcoded responses.

---

## State Management

Three nested Context providers share a single `AppAction` discriminated union:

```
RepoProvider    → repoUrl, repoInfo, loading, error
  EditorProvider → selectedTemplate, sections, undo/redo history
    UIProvider  → toasts, modals
```

- **Session persistence** — Full state saved to `sessionStorage` on every change
- **History** — Up to 50 undo/redo snapshots; `historyIndex` always points to `history.length - 1`
- **LocalStorage** — Saved snapshots persist across browser sessions

---

## Deployment

Production deployment uses GitHub Actions → Tencent Cloud via rsync + PM2.

```bash
# Triggered on push to main branch
# Steps: git pull → npm install → npm run build → pm2 restart
```

See [docs/claude/deployment.md](docs/claude/deployment.md) for full details including nginx configuration and environment variables.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `MINIMAX_API_KEY` | MiniMax API key | (required) |
| `MINIMAX_MODEL` | Model ID | `glm-4-plus` |
| `GITHUB_TOKEN` | GitHub PAT for higher rate limits | (optional) |
| `JWT_SECRET` | Secret for admin auth | `readme-craft-secret` |
| `NODE_ENV` | `development` or `production` | `development` |

---

## Development

### Frontend Tests

```bash
cd frontend
npm test              # Run once
npm run test:watch    # Watch mode
```

### Code Style

- Components: **PascalCase** + named export (e.g., `TemplateSelector.tsx`)
- Utilities: **camelCase** + named export (e.g., `api.ts`, `uuid.ts`)
- Props interfaces: `{ComponentName}Props`
- Async: `try/catch/finally` + `AbortSignal`
- Styling: Tailwind design tokens only — `text-brand-600`, `shadow-card`, `rounded-button`

### Key Rules

- **Never** use `crypto.randomUUID` — use the `uuid()` utility instead
- **Always** use `.js` extension in Fastify ESM relative imports
- **Never** add `z-0` to `<main>` — it creates a stacking context that breaks sticky headers
- **Never** use emoji as UI icons — use SVG icons (Heroicons/Lucide)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (write commit messages in Chinese — describe motivation, not code changes)
4. Push and open a Pull Request

---

## License

MIT
