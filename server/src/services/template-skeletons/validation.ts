export interface TemplateValidationRules {
  /** 输出必须包含的关键词/模式 */
  mustContain: string[];
  /** 输出必须不包含的关键词/模式 */
  forbidden: string[];
  /** 允许的占位符残留上限（0 = 不允许任何占位符残留） */
  maxPlaceholderResidue?: number;
  /** 预期的大致最小长度 */
  minLength?: number;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

/** 检查占位符模式（方括号内容）是否已全部替换 */
const PLACEHOLDER_RE = /\[[^\]]+\]/g;

export function validateOutput(
  markdown: string,
  rules: TemplateValidationRules,
  templateId: string
): ValidationResult {
  const issues: string[] = [];

  // 1. 检查 mustContain
  for (const pattern of rules.mustContain) {
    if (!markdown.includes(pattern)) {
      issues.push(`缺少必要内容: "${pattern}"`);
    }
  }

  // 2. 检查 forbidden
  for (const pattern of rules.forbidden) {
    if (markdown.includes(pattern)) {
      issues.push(`包含禁止内容: "${pattern}"`);
    }
  }

  // 3. 检查占位符残留
  const placeholderCount = (markdown.match(PLACEHOLDER_RE) || []).length;
  const maxResidue = rules.maxPlaceholderResidue ?? 0;
  if (placeholderCount > maxResidue) {
    issues.push(`存在 ${placeholderCount} 个未替换占位符（允许 ${maxResidue} 个）`);
  }

  // 4. 最小长度
  if (rules.minLength && markdown.length < rules.minLength) {
    issues.push(`内容过短: ${markdown.length} 字符（最少 ${rules.minLength}）`);
  }

  return { valid: issues.length === 0, issues };
}

/** 构建修正 prompt，传入具体的验证问题 */
export function buildRefinePrompt(templateId: string, issues: string[]): string {
  return `你生成的 README 存在以下问题，请修复并重新生成完整 README：

${issues.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

⚠️ 重要：
- 保留 README 骨架结构不变
- 仅修正以上指出的问题
- 不要改变其他已经正确的内容
- 直接输出修正后的完整 README，不要用 \`\`\`markdown 包裹`;
}
