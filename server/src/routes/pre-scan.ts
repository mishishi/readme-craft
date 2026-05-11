import type { FastifyInstance } from 'fastify';
import { scanProject } from '../services/project-scanner.js';

interface PreScanBody {
  owner: string;
  repo: string;
  defaultBranch: string;
}

export async function preScanRoutes(app: FastifyInstance) {
  app.post<{ Body: PreScanBody }>('/pre-scan', async (request, reply) => {
    const { owner, repo, defaultBranch } = request.body;

    if (!owner || !repo || !defaultBranch) {
      return reply.status(400).send({ error: '缺少参数' });
    }

    // Fire and forget — result is cached in scanProject
    scanProject(owner, repo, defaultBranch).catch((err) => {
      console.warn('[pre-scan] Background scan failed:', err.message);
    });

    return { status: 'scanning' };
  });
}
