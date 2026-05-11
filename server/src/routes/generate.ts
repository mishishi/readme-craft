import type { FastifyInstance } from 'fastify';
import { generateReadme } from '../services/minimax.js';
import { buildSystemPrompt, buildUserPrompt } from '../services/prompts.js';
import { scanProject } from '../services/project-scanner.js';

/** 清理 MiniMax 返回：去掉可能包裹的 markdown 代码块标记 */
function cleanMarkdown(raw: string): string {
  return raw.replace(/^```markdown\s*\n?/i, '').replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
}

interface GenerateBody {
  repoUrl: string;
  templateId: string;
  repoInfo: {
    name: string;
    description: string;
    language: string;
    stars: number;
    topics: string[];
    owner: string;
    license: string | null;
    defaultBranch?: string;
  };
}

export async function generateRoutes(app: FastifyInstance) {
  app.post<{ Body: GenerateBody }>('/generate-readme', async (request, reply) => {
    const { repoUrl, templateId, repoInfo } = request.body;

    if (!repoUrl || !templateId || !repoInfo?.name) {
      return reply.status(400).send({ error: '缺少必要参数' });
    }

    const systemPrompt = buildSystemPrompt(templateId);

    try {
      // Scan project files for richer context
      let projectContext: string | undefined;
      if (repoInfo.owner && repoInfo.name && repoInfo.defaultBranch) {
        try {
          projectContext = await scanProject(
            repoInfo.owner,
            repoInfo.name,
            repoInfo.defaultBranch
          );
          console.log(`[scan] Project context generated (${projectContext.length} chars)`);
        } catch (scanErr) {
          console.warn('[scan] Failed to scan project, falling back to basic info:', scanErr);
        }
      }

      const userPrompt = buildUserPrompt(repoInfo, projectContext);
      const markdown = cleanMarkdown(await generateReadme(systemPrompt, userPrompt));
      return { markdown };
    } catch (err) {
      const message = err instanceof Error ? err.message : '生成失败';
      console.error('Generate error:', err);
      return reply.status(500).send({ error: message });
    }
  });
}
