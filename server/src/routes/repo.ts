import type { FastifyInstance } from 'fastify';
import { fetchRepoInfo } from '../services/github.js';

interface FetchRepoBody {
  owner: string;
  repo: string;
}

export async function repoRoutes(app: FastifyInstance) {
  app.post<{ Body: FetchRepoBody }>('/fetch-repo-info', async (request, reply) => {
    const { owner, repo } = request.body;

    if (!owner || !repo) {
      return reply.status(400).send({ error: '缺少参数 owner 或 repo' });
    }

    try {
      const info = await fetchRepoInfo(owner, repo);
      return info;
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取仓库信息失败';
      return reply.status(500).send({ error: message });
    }
  });
}
