# Deployment

**CI:** GitHub Actions → Tencent Cloud 轻量服务器
**方式:** rsync + PM2 进程管理
**构建产物:** `frontend/dist/` + `server/`（含 node_modules）

## 部署流程

1. 推送到 main 分支触发 GitHub Actions
2. Actions 在服务器执行 `git pull`
3. `npm run install:all`
4. `npm run build`
5. PM2 重启进程

## 注意事项

- rsync 使用 `--delete` 前必须确认 `.env` 已排除（`.gitignore` 规则）
- 服务器需要 Node.js 18+
- PM2 通过 `ecosystem.config.js` 配置
- 服务器不保留 `.env` 文件在 git 中，通过手动上传或 CI secret 注入

## Server Files

```
server/
├── ecosystem.config.js   # PM2 配置
├── .env                  # 服务器环境变量（手动上传，不在 git 中）
├── .env.example          # 环境变量模板
└── node_modules/         # 部署时安装
```
