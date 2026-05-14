import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { generateRoutes } from './routes/generate.js';
import { repoRoutes } from './routes/repo.js';
import { preScanRoutes } from './routes/pre-scan.js';
import { analyticsRoutes } from './routes/analytics.js';
import { authRoutes } from './routes/auth.js';
import { initDb } from './services/db.js';

const port = parseInt(process.env.PORT || '3001', 10);

const app = Fastify({ logger: true });

await app.register(cors, { origin: true, credentials: true });
await app.register(cookie);

// 初始化数据库
await initDb();

await app.register(generateRoutes, { prefix: '/api' });
await app.register(repoRoutes, { prefix: '/api' });
await app.register(preScanRoutes, { prefix: '/api' });
await app.register(analyticsRoutes, { prefix: '/api' });
await app.register(authRoutes, { prefix: '/api' });

app.get('/api/health', async () => ({
  status: 'ok',
  githubTokenConfigured: Boolean(process.env.GITHUB_TOKEN),
}));

// 优雅关闭：让 tsx watch 能快速退出
const shutdown = async (signal: string) => {
  console.log(`\n📦 Received ${signal}, closing server...`);
  await app.close();
  process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

try {
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`🚀 Server running at http://localhost:${port}`);
  if (!process.env.GITHUB_TOKEN) {
    console.warn('\n⚠️  警告: 未配置 GITHUB_TOKEN');
    console.warn('    GitHub API 未认证时限制为 60 次/小时，请在 server/.env 中配置 GITHUB_TOKEN 以提升至 5000 次/小时。');
    console.warn('    创建地址: https://github.com/settings/tokens（无需任何权限）\n');
  }
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
