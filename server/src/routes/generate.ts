import type { FastifyInstance } from 'fastify';
import { generateReadme } from '../services/minimax.js';
import { buildUserPrompt } from '../services/prompts.js';
import { buildSystemPrompt } from '../services/templates/index.js';
import { scanProject } from '../services/project-scanner.js';

// [validate-retry] 暂注释，后续优化重开
// import { trackEvent } from '../services/analytics.js';
// import { validateOutput, buildRefinePrompt, checkCoverage } from '../services/templates/index.js';
// import type { TemplateValidationRules } from '../services/templates/index.js';

/** 清理 MiniMax 返回：去掉可能包裹的 markdown 代码块标记 */
function cleanMarkdown(raw: string): string {
  return raw.replace(/^```markdown\s*\n?/i, '').replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
}

// 生成结果缓存（内存）
const generateCache = new Map<string, { markdown: string; expiresAt: number }>();
const GENERATE_CACHE_TTL = 30 * 60 * 1000; // 30 分钟
const MAX_CACHE_SIZE = 100;

function getGenerateCacheKey(owner: string, repo: string, templateId: string): string {
  return `gen:${owner}/${repo}:${templateId}`;
}

/** 根据 variationSeed 计算差异化 temperature */
function computeTemperature(seed?: number): number {
  if (seed === undefined) return 0.8;
  // 1.0–1.2 范围，种子不同产生不同偏移
  return 1.0 + (seed % 3) * 0.1;
}

// [validate-retry] VALIDATION_RULES — after refactoring, use TEMPLATES[id].rules
// import { TEMPLATES } from '../services/templates/index.js';
// const VALIDATION_RULES: Record<string, TemplateValidationRules> = Object.fromEntries(
//   Object.entries(TEMPLATES).map(([id, cfg]) => [id, cfg.rules])
// );

interface GenerateBody {
  repoUrl: string;
  templateId: string;
  feedback?: string;
  variationSeed?: number;
  strictMode?: boolean;
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
    const { repoUrl, templateId, repoInfo, feedback, variationSeed, strictMode } = request.body;

    if (!repoUrl || !templateId || !repoInfo?.name) {
      return reply.status(400).send({ error: '缺少必要参数' });
    }

    const skipCache = Boolean(variationSeed);

    // Check cache (skip when user provides feedback or variationSeed — must generate fresh)
    if (!skipCache && !feedback && repoInfo.owner && repoInfo.name) {
      const cacheKey = getGenerateCacheKey(repoInfo.owner, repoInfo.name, templateId);
      const cached = generateCache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        console.log(`[cache] HIT ${cacheKey}`);
        return { markdown: cached.markdown };
      }
    }

    const systemPrompt = buildSystemPrompt(templateId, strictMode);

    try {
      // 并发启动：scan 后台跑，AI 生成直接开始（五部分 prompt 不依赖 scan）
      const scanPromise = repoInfo.owner && repoInfo.name && repoInfo.defaultBranch
        ? scanProject(repoInfo.owner, repoInfo.name, repoInfo.defaultBranch)
            .catch((scanErr) => {
              console.warn('[scan] Background scan failed:', scanErr);
              return undefined;
            })
        : Promise.resolve(undefined);

      const userPrompt = buildUserPrompt(repoInfo, undefined, feedback);

      // --- 第一次生成（与 scan 并发） ---
      let markdown = cleanMarkdown(await generateReadme(systemPrompt, userPrompt, computeTemperature(variationSeed)));
      // 等 scan 完成（此时大概率已经跑完，不增加等待）
      const projectContext = await scanPromise;
      if (projectContext) {
        console.log(`[scan] Project context available (${projectContext.length} chars)`);
      }

      // [validate-retry] 以下验证-修正逻辑暂注释，后续优化重开
      // const rules = VALIDATION_RULES[templateId];
      // if (rules) {
      //   const structuralValidation = validateOutput(markdown, rules, templateId);
      //   const structuralIssues = structuralValidation.issues;
      //   if (projectContext) {
      //     const coverageIssues = checkCoverage(markdown, projectContext);
      //     if (coverageIssues.length > 0) {
      //       console.log(`[validate] ${templateId} — 覆盖度建议:\n  ${coverageIssues.map((i) => `[内容覆盖] ${i}`).join('\n  ')}`);
      //     }
      //   }
      //   const criticalIssues = structuralIssues.filter((i) => !i.startsWith('内容过短'));
      //   const skippedIssues = structuralIssues.length - criticalIssues.length;
      //   const totalIssues = structuralIssues.length;
      //   if (criticalIssues.length > 0) {
      //     console.log(`[validate] ${templateId} — ${criticalIssues.length} 项关键结构问题 (+${skippedIssues} 项轻微), 尝试修正...`);
      //     const refinePrompt = buildRefinePrompt(templateId, criticalIssues);
      //     try {
      //       const refinedMarkdown = cleanMarkdown(
      //         await generateReadme(systemPrompt, userPrompt + '\n\n' + refinePrompt, computeTemperature(variationSeed))
      //       );
      //       const refinedValidation = validateOutput(refinedMarkdown, rules, templateId);
      //       markdown = refinedMarkdown;
      //       console.log(
      //         `[validate] ${templateId} — 修正${refinedValidation.valid ? '通过' : '完成但仍有问题'}`
      //         + ` (${refinedValidation.issues.length} 项残留)`
      //       );
      //       trackEvent({
      //         name: 'validation_result', timestamp: Date.now(),
      //         data: { templateId, firstTryIssues: criticalIssues, retryPassed: refinedValidation.valid, retryRemainingIssues: refinedValidation.issues },
      //       }).catch(() => {});
      //     } catch (refineErr) {
      //       console.warn('[validate] 修正调用失败，使用原始结果:', refineErr);
      //       trackEvent({ name: 'validation_refine_failed', timestamp: Date.now(), data: { templateId, error: String(refineErr) } }).catch(() => {});
      //     }
      //   } else if (totalIssues > 0) {
      //     console.log(`[validate] ${templateId} — 仅 ${skippedIssues} 项轻微问题，跳过修正`);
      //   } else {
      //     console.log(`[validate] ${templateId} — 通过`);
      //   }
      // }

      // 附加来源标识
      markdown = markdown.trim() + '\n\n<!-- Generated by ReadMeCraft (https://readme-craft.com) -->\n';

      // Cache final result
      if (repoInfo.owner && repoInfo.name) {
        // Evict oldest entries when cache exceeds limit
        if (generateCache.size >= MAX_CACHE_SIZE) {
          const entriesToDelete = generateCache.size - MAX_CACHE_SIZE + 1;
          const iterator = generateCache.keys();
          for (let i = 0; i < entriesToDelete; i++) {
            const key = iterator.next().value;
            if (key !== undefined) generateCache.delete(key);
          }
        }
        const cacheKey = getGenerateCacheKey(repoInfo.owner, repoInfo.name, templateId);
        generateCache.set(cacheKey, { markdown, expiresAt: Date.now() + GENERATE_CACHE_TTL });
      }

      return { markdown };
    } catch (err) {
      const message = err instanceof Error ? err.message : '生成失败';
      console.error('Generate error:', err);

      // 结构化错误响应
      const isRateLimit = message.includes('429') || message.includes('rate limit');
      const isTimeout = message.includes('timeout') || message.includes('timed out');
      const isAuth = message.includes('401') || message.includes('API key') || message.includes('未配置');

      return reply.status(500).send({
        error: message,
        code: isRateLimit ? 'RATE_LIMIT' : isAuth ? 'AUTH_ERROR' : 'GENERATION_FAILED',
        retryAfter: isRateLimit ? 30 : isTimeout ? 10 : undefined,
      });
    }
  });

  // Admin: clear generate cache
  app.post('/admin/cache-clear', async (_request, reply) => {
    const size = generateCache.size;
    generateCache.clear();
    console.log(`[cache] Cleared ${size} entries`);
    return { cleared: true, size };
  });
}
