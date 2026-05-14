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

/**
 * 内容覆盖度检查：扫描结果 vs README 内容，检查项目重要信息是否被 README 覆盖。
 */
export function checkCoverage(readme: string, scanResult: string): string[] {
  const readmeLower = readme.toLowerCase();
  const scanLower = scanResult.toLowerCase();
  const issues: string[] = [];

  // 1. 测试框架检测
  const testFrameworks = scanResult.match(/\b(jest|vitest|mocha|tape|playwright|cypress)\b/i);
  if (testFrameworks && !/\b(test|testing|ci|contribute|contributing|测试|贡献)\b/i.test(readmeLower)) {
    issues.push('项目使用了测试框架 ' + testFrameworks[0] + '，但 README 未提及测试或贡献指南');
  }

  // 2. Dockerfile 检测
  if (/\bdockerfile\b/i.test(scanLower) && !/\b(docker|部署|deploy|container)\b/i.test(readmeLower)) {
    issues.push('项目包含 Dockerfile，但 README 缺少部署或容器化相关说明');
  }

  // 3. 框架检测 — 技术栈是否覆盖
  const frameworkMatch = scanResult.match(/框架\/工具: (.+)/);
  if (frameworkMatch) {
    const frameworks = frameworkMatch[1].split(', ').filter((f) => f.trim().length > 2);
    const uncovered = frameworks.filter((fw) => !readmeLower.includes(fw.toLowerCase()));
    if (uncovered.length > 0 && uncovered.length === frameworks.length) {
      issues.push('README 技术栈部分未覆盖检测到的主要框架：' + uncovered.join('、'));
    }
  }

  // 4. 构建脚本检测
  if (scanResult.includes('可用脚本') && /\bbuild\b/.test(scanLower) &&
      !/\b(build|构建|install|安装)\b/i.test(readmeLower)) {
    issues.push('项目定义了构建脚本（build），但 README 未提及安装或构建步骤');
  }

  // 5. LICENSE 文件检测
  if (/\b## 许可证\b/.test(scanResult) || /\blicense\b/i.test(scanLower)) {
    const licenseMatch = scanResult.match(/## 许可证\n(.+)/);
    const licenseName = licenseMatch ? licenseMatch[1].trim() : '';
    if (licenseName && !readmeLower.includes(licenseName.toLowerCase()) &&
        !/\b(mit|apache|gpl|bsd|许可证|license)\b/i.test(readmeLower)) {
      issues.push('项目有许可证 ' + licenseName + '，但 README 未提及许可证信息');
    }
  }

  // 6. CLI 工具检测
  if (/\bcli\b/i.test(scanLower) && !/\b(cli|command|usage|命令行|选项|option)\b/i.test(readmeLower)) {
    issues.push('项目为 CLI 工具，但 README 缺少命令行使用说明');
  }

  // 7. API 层检测
  if (/\bsrc\/api\b/.test(scanLower) && !/\b(api|endpoint|接口)\b/i.test(readmeLower)) {
    issues.push('项目包含 API 层（src/api/），但 README 未提及 API 接口');
  }

  return issues;
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
