import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { generateRoutes } from './routes/generate.js';
import { repoRoutes } from './routes/repo.js';
import { preScanRoutes } from './routes/pre-scan.js';

const port = parseInt(process.env.PORT || '3001', 10);

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

await app.register(generateRoutes, { prefix: '/api' });
await app.register(repoRoutes, { prefix: '/api' });
await app.register(preScanRoutes, { prefix: '/api' });

app.get('/api/health', async () => ({ status: 'ok' }));

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
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
