import {
  minimalSkeleton,
  badgesSkeleton,
  enterpriseSkeleton,
  cardsSkeleton,
  showcaseSkeleton,
} from './template-skeletons/index.js';

interface RepoInfo {
  name: string;
  description: string;
  language: string;
  stars: number;
  topics: string[];
  owner: string;
  license: string | null;
}

// ===== 模板骨架索引 =====
const TEMPLATE_SKELETONS: Record<string, string> = {
  minimal: minimalSkeleton,
  badges: badgesSkeleton,
  enterprise: enterpriseSkeleton,
  cards: cardsSkeleton,
  showcase: showcaseSkeleton,
};

// ===== 精简风格规则（每个模板 3-4 条） =====
const TEMPLATE_STYLE_RULES: Record<string, string> = {
  minimal: `
## 模板风格约束

模板「极简清风」：
- 纯 Markdown，不使用任何 HTML 标签
- 不使用表格、引用块、badges 或 emoji
- 标题 + 列表 + 代码块排版，段落 2-3 句话，空行分隔`,

  badges: `
## 模板风格约束

模板「Badge 大满贯」：
- 保留头部 \`<p align="center">\` HTML 结构和 badge 墙（替换文字和颜色）
- 特性介绍使用表格或 emoji 列表
- 视觉丰富度优先：badge + emoji + 表格`,

  enterprise: `
## 模板风格约束

模板「企业蓝图」：
- 不使用 emoji（包括标题）
- 保留 mermaid 图表（仅限 flowchart / pie / sequenceDiagram），禁止其他类型
- 表格和正式语气，技术架构需区分前端/后端/基础设施
- 代码块使用正确的语言标签`,

  cards: `
## 模板风格约束

模板「卡片视界」：
- 保留引用块结构，用于核心特性展示
- 保留 emoji 章节标题和 \`---\` 分隔线
- 每个引用块内：emoji 标题 + 至少 2 句话描述`,

  showcase: `
## 模板风格约束

模板「项目展厅」：
- 保留 Banner 的 \`<p align="center">\` 和 \`<img>\` 结构
- 项目简介使用叙事性段落（非功能列表）
- 保留 \`>\` 引用块用于引语，保留 checkbox 列表用于路线图`,
};

export function buildSystemPrompt(templateId: string, strictMode?: boolean): string {
  const skeleton = TEMPLATE_SKELETONS[templateId] || TEMPLATE_SKELETONS.minimal;
  const styleRules = TEMPLATE_STYLE_RULES[templateId] || '';

  const strictModeRules = strictMode ? `
## 严谨模式（已开启）

- 禁止任何占位符残留（「待补充」「详见正文」等）
- 所有技术名称、命令、依赖必须从项目信息中提取，不得编造
- 每个章节必须有实质性内容，至少包含一个具体事实` : '';

  return `你是一个专业的 README 文档工程师。${strictModeRules}

## 核心写作原则

1. **具体胜过通用** —— 每个特性、每个步骤必须包含具体技术事实（框架名称、命令、API 端点）。禁止出现「该项目拥有出色的性能」这类无信息量的表述。

2. **理解项目再动笔** —— 先判断项目类型和目标读者，再决定 README 的结构和侧重点。一个 CLI 工具和一个前端组件库的 README 应该不一样。

3. **可验证** —— 所有技术名称、依赖、命令必须从项目信息中提取。不确定的内容用 [需补充] 标记，不要编造。

---

## 第一步：分析项目类型

请先判断：
- 这是什么类型的项目？（库/CLI工具/Web应用/框架）
- 目标读者最想从 README 中获得什么？
- 这个 README 应该侧重什么？

---

## 第二步：生成 README

根据项目类型，从以下章节中选择并组织内容：

【安装】—— 前置条件 + 安装命令 + 验证命令
【快速开始】—— 最常用的 2-3 个操作，每个配代码示例
【特性介绍】—— 4-6 项，每项：功能名 + 一句话 + 适用场景
【API 参考】(库/工具必选) —— 核心函数签名、参数、返回值
【命令参考】(CLI 必选) —— 子命令、常用选项、示例
【技术架构】(Web应用/框架推荐) —— 分层说明，核心模块
【项目结构】(大型项目推荐) —— 目录树 + 说明
【配置说明】(需要配置的项目) —— 配置项、默认值
【贡献指南】(必选) —— 环境搭建、运行测试、提PR流程
【许可证】(必选)

不要逐章照抄这个列表。根据项目类型选择最重要的章节，组织成自然的阅读顺序。

${styleRules}

## 参考骨架

以下是本模板的参考结构。可以在此基础上调整章节顺序或内容深度：

${skeleton}`;
}

export function buildUserPrompt(repo: RepoInfo, projectContext?: string, feedback?: string): string {
  const base = `## 项目信息

请根据以下 GitHub 项目信息来填充 README。

| 项目 | 值 |
|------|------|
| 名称 | ${repo.name} |
| 描述 | ${repo.description || '（暂无描述）'} |
| 主要语言 | ${repo.language || '未指定'} |
| Star 数 | ${repo.stars} |
| 标签 | ${repo.topics?.join(', ') || '无'} |
| 作者 | ${repo.owner} |
| 许可证 | ${repo.license || '未指定'}`;

  let result = base;

  if (projectContext) {
    result += `

## 项目源码分析

${projectContext}

---

**重要**: 使用上述项目信息生成内容。内容要有实际依据（从源码分析的依赖、脚本、目录结构中提取），不要编造。`;
  }

  if (feedback) {
    result += `

## 用户改进要求

用户对上一次生成的内容不满意，提出了以下改进要求。请根据这些要求调整 README 内容：

${feedback}

注意：
- 基于之前的生成结果进行修改，保留符合要求的部分
- 只修改用户提到的部分，不需要重写整个 README
- 保持模板结构和风格不变`;
  }

  return result;
}
