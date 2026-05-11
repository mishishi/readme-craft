# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**readme-craft** — 中文 GitHub README 生成器。输入仓库地址，选模板，AI 一键生成 README。

## Architecture

```
readme-craft/
├── frontend/          # Vite + React + Tailwind SPA
│   └── src/
│       ├── components/    # UI 组件
│       ├── context/       # 全局状态 (useReducer)
│       ├── services/      # API 调用、Markdown 解析、GitHub 接口
│       └── templates/     # 5 个模板定义
├── server/            # Fastify 后端
│   └── src/
│       ├── routes/        # API 路由
│       └── services/      # MiniMax API 集成、Prompt 构建
```

### 数据流

```
GitHub URL → 前端调 GitHub API → 展示仓库信息
用户选模板 → 前端调 POST /api/generate-readme
后端调 MiniMax API → 返回 Markdown → 前端解析为可编辑章节
表单编辑 ↔ 实时预览 → 一键复制 / 下载 .md
```

## Commands

```bash
npm run dev              # 同时启动前端 (5173) + 后端 (3001)
npm run dev:server       # 仅启动后端 (watch 模式)
npm run dev:frontend     # 仅启动前端 (Vite HMR)
npm run build            # 构建前端 → frontend/dist/
npm run install:all      # 安装根目录 + 前后端所有依赖
```

## Key Configuration

- **后端端口**: `server/.env` 中的 `PORT`（默认 3001）
- **MiniMax**: `server/.env` 配置 `MINIMAX_API_KEY` 和 `MINIMAX_MODEL`
- **Vite 代理**: 开发时 `/api` 自动转发到后端 3001 端口（`frontend/vite.config.ts`）
- **环境变量模板**: `server/.env.example` — 复制为 `.env` 后填写

## VCS (`.gitignore`)

根目录 `.gitignore` 统一管理整个仓库的忽略规则：
- `node_modules/` — 根目录 + 所有子包依赖
- `dist/` / `*.tsbuildinfo` — 前端和后端构建产物
- `.env`, `.env.*local` — 敏感环境变量
- IDE (`/.idea/`, `.vscode/`)、OS (`.DS_Store`)、日志 (`*.log`) 等

## API

`POST /api/generate-readme`

```json
{
  "repoUrl": "https://github.com/owner/repo",
  "templateId": "minimal|badges|enterprise|cards|showcase",
  "repoInfo": { "name": "...", "description": "...", ... }
}
// → { "markdown": "# Title\n\n## Section\n..." }
```

## 模板系统

5 个模板定义在 `frontend/src/templates/index.ts`：
- **极简清风** — 干净留白
- **Badge 大满贯** — badge 墙 + 功能卡片
- **企业蓝图** — 正式专业，表格化
- **卡片视界** — 卡片式布局
- **项目展厅** — Banner + 截图展示

每个模板的 AI prompt 在 `server/src/services/prompts.ts` 中定义。

## Available Skills

- **ui-ux-pro-max** — UI/UX 设计系统工具（Python 脚本）

  ```bash
  python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "Name"
  ```
