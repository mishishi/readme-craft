# Architecture Decisions

| 决策 | 选择 | 原因 |
|------|------|------|
| 状态管理 | useReducer + Context | 状态结构简单，不需要 Redux/Zustand 的额外抽象 |
| Context 拆分 | 三层（非一层） | 关注点分离，避免不相关状态触发重渲染 |
| 后端框架 | Fastify | 性能优于 Express，原生 TypeScript 支持 |
| 模板预览 | switch-case 静态 HTML | 预览结构固定，比 registry 模式更直观 |
| API 代理 | 后端代理 GitHub API | 避免 CORS 问题 + 保护 token |
| Mock 模式 | 前端 `USE_MOCK` flag | 后端不可用时前端可独立开发 |
| 路由 | react-router-dom v6 | SPA 标准方案，lazy loading 友好 |
| 构建 | Vite | HMR 极快，构建配置简洁 |

## Key Configuration

- **后端端口**: `server/.env` 中的 `PORT`（默认 3001）
- **MiniMax**: `server/.env` 配置 `MINIMAX_API_KEY` 和 `MINIMAX_MODEL`
- **GitHub Token**: `server/.env` 中的 `GITHUB_TOKEN`（避免 API 每小时 60 次限流）
- **Vite 代理**: 开发时 `/api` 自动转发到后端 3001 端口（`frontend/vite.config.ts`）
- **环境变量模板**: `server/.env.example` — 复制为 `.env` 后填写

## 模板系统

5 个模板：

| ID | 名称 | 风格 | 推荐场景 |
|----|------|------|----------|
| minimal | 极简清风 | 干净留白 | 基础项目 / 工具库 |
| badges | Badge 大满贯 | badge 墙 + 功能卡片 | 开源项目 |
| enterprise | 企业蓝图 | 正式、表格化 | 商业 / 团队项目 |
| cards | 卡片视界 | 卡片式布局 | 前端 / 设计项目 |
| showcase | 项目展厅 | Banner + 截图 | 个人作品 / App |

## 开发环境

- **Node.js**: 18+
- **包管理器**: npm
- **样式**: Tailwind CSS v3 + `@tailwindcss/typography`
- **AI**: MiniMax API (glm-4-plus 模型)
