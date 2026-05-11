import type { FastifyInstance } from 'fastify';
import { generateReadme } from '../services/minimax.js';
import { buildSystemPrompt, buildUserPrompt } from '../services/prompts.js';
import { scanProject } from '../services/project-scanner.js';
import { trackEvent } from '../services/analytics.js';
import {
  validateOutput,
  buildRefinePrompt,
  minimalRules,
  badgesRules,
  enterpriseRules,
  cardsRules,
  showcaseRules,
} from '../services/template-skeletons/index.js';
import type { TemplateValidationRules } from '../services/template-skeletons/index.js';

/** 清理 MiniMax 返回：去掉可能包裹的 markdown 代码块标记 */
function cleanMarkdown(raw: string): string {
  return raw.replace(/^```markdown\s*\n?/i, '').replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
}

// 生成结果缓存（内存）
const generateCache = new Map<string, { markdown: string; expiresAt: number }>();
const GENERATE_CACHE_TTL = 30 * 60 * 1000; // 30 分钟

function getGenerateCacheKey(owner: string, repo: string, templateId: string): string {
  return `gen:${owner}/${repo}:${templateId}`;
}

// 每个模板的验证规则
const VALIDATION_RULES: Record<string, TemplateValidationRules> = {
  minimal: minimalRules,
  badges: badgesRules,
  enterprise: enterpriseRules,
  cards: cardsRules,
  showcase: showcaseRules,
};

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

    // Check cache
    if (repoInfo.owner && repoInfo.name) {
      const cacheKey = getGenerateCacheKey(repoInfo.owner, repoInfo.name, templateId);
      const cached = generateCache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        console.log(`[cache] HIT ${cacheKey}`);
        return { markdown: cached.markdown };
      }
    }

    const systemPrompt = buildSystemPrompt(templateId);

    try {
      // Scan project files for richer context (may be cached from pre-scan)
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

      // --- 第一次生成 ---
      let markdown = cleanMarkdown(await generateReadme(systemPrompt, userPrompt));
      let refined = false;

      // --- 输出质量验证 + 修正 ---
      const rules = VALIDATION_RULES[templateId];
      if (rules) {
        const validation = validateOutput(markdown, rules, templateId);

        if (!validation.valid) {
          // 区分关键问题 vs 轻微问题：仅关键问题才触发重生成
          const criticalIssues = validation.issues.filter(
            (i) => !i.startsWith('内容过短')
          );
          const skippedIssues = validation.issues.length - criticalIssues.length;

          if (criticalIssues.length === 0) {
            console.log(`[validate] ${templateId} — 仅 ${skippedIssues} 项轻微问题 (minLength)，跳过修正`);
          } else {
            console.log(`[validate] ${templateId} — ${criticalIssues.length} 项关键问题 (+${skippedIssues} 项轻微), 尝试修正...`);

            const refinePrompt = buildRefinePrompt(templateId, criticalIssues);

            try {
              const refinedMarkdown = cleanMarkdown(
                await generateReadme(systemPrompt, userPrompt + '\n\n' + refinePrompt)
              );
              const refinedValidation = validateOutput(refinedMarkdown, rules, templateId);
              refined = true;
              markdown = refinedMarkdown;

              console.log(
                `[validate] ${templateId} — 修正${refinedValidation.valid ? '通过' : '完成但仍有问题'}`
                + ` (${refinedValidation.issues.length} 项残留)`
              );

              // 记录验证结果
              trackEvent({
                name: 'validation_result',
                timestamp: Date.now(),
                data: {
                  templateId,
                  firstTryIssues: validation.issues,
                  retryPassed: refinedValidation.valid,
                  retryRemainingIssues: refinedValidation.issues,
                },
              }).catch(() => {});
            } catch (refineErr) {
              console.warn('[validate] 修正调用失败，使用原始结果:', refineErr);
              trackEvent({
                name: 'validation_refine_failed',
                timestamp: Date.now(),
                data: { templateId, error: String(refineErr) },
              }).catch(() => {});
            }
          }
        }
      }

      // Cache final result
      if (repoInfo.owner && repoInfo.name) {
        const cacheKey = getGenerateCacheKey(repoInfo.owner, repoInfo.name, templateId);
        generateCache.set(cacheKey, { markdown, expiresAt: Date.now() + GENERATE_CACHE_TTL });
      }

      return { markdown, refined };
    } catch (err) {
      const message = err instanceof Error ? err.message : '生成失败';
      console.error('Generate error:', err);
      return reply.status(500).send({ error: message });
    }
  });
}
