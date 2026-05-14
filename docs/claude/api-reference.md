# API Reference

## Routes

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/generate-readme` | AI 生成 README |
| POST | `/api/fetch-repo-info` | 代理 GitHub API 获取仓库信息 |
| POST | `/api/pre-scan-project` | 后台预扫描（fire-and-forget，不阻塞） |
| GET | `/api/analytics/events` | 事件统计 |
| GET | `/api/health` | 健康检查 |

## generate-readme

**Request:**
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "templateId": "minimal|badges|enterprise|cards|showcase",
  "repoInfo": {
    "name": "repo-name",
    "description": "A short description",
    "language": "TypeScript",
    "stars": 100,
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

## fetch-repo-info

后端代理 GitHub API，避免 CORS 问题 + 保护 token。

**Request:**
```json
{
  "url": "https://github.com/owner/repo"
}
```

**Response:**
```json
{
  "name": "repo",
  "fullName": "owner/repo",
  "description": "...",
  "language": "TypeScript",
  "stars": 100,
  "topics": ["react"],
  "owner": "owner",
  "license": "MIT",
  "htmlUrl": "https://github.com/owner/repo",
  "defaultBranch": "main"
}
```

## pre-scan-project

Fire-and-forget 后台扫描，不阻塞前端。无响应体。

## analytics/events

返回事件统计聚合数据。

## health

```json
{
  "status": "ok",
  "githubTokenConfigured": true
}
```

## Mock Mode

前端 `USE_MOCK` flag 控制：`true` 时跳过后端 API，使用硬编码的 MOCK_README 响应。用于后端不可用时前端独立开发。
