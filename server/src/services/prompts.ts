import {
  minimalSkeleton,
  badgesSkeleton,
  enterpriseSkeleton,
  cardsSkeleton,
  showcaseSkeleton,
} from './template-skeletons';

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

// ===== 每个模板专属的视觉风格规则 =====
const TEMPLATE_STYLE_RULES: Record<string, string> = {
  badges: `
## 专属风格规则（Badge 大满贯）

1. **必须保留全部 HTML 标签**：<p align="center">、<img>、<h1>、<details>、<summary> 等全部保留
2. **Badge 墙要丰富**：保留全部 13 个 badge，替换其中的文字和颜色
3. **表格必须保留**：特性矩阵表（5 行）、详细功能表（3 行）、技术栈表（4 行）的行数必须匹配骨架
4. **优先级的写法**：详细功能表中的优先级使用 High / Medium / Low
5. **视觉冲击力优先**：使用 emoji + 表格 + HTML 布局营造丰富感`,

  minimal: `
## 专属风格规则（极简清风）

1. **禁止任何 HTML 标签**：不要使用 <div>、<p align>、<img> 等任何 HTML 标签，完全纯 Markdown
2. **禁止 badges/shields.io 图标**：不要生成任何图片链接
3. **禁止表格**：不要使用 Markdown 表格
4. **禁止引用块**：不要使用 > 引用块
5. **纯文本排版**：使用纯文本 + 标题 + 列表 + 代码块，追求干净留白
6. **段落极短**：每个段落不超过 2 句话，简介章节不超过 3 句话
7. **空行分隔**：所有段落之间用空行隔开，营造呼吸感
8. **不要使用 emoji**：保持文字本身的简洁
9. **特性描述格式**：列表形式，每项为 "**特性名**：一句话说明"，每项不超过 25 字
10. **禁止空洞填充**：不要在标题下方写无实质内容的段落，每个段落必须有具体信息`,

  enterprise: `
## 专属风格规则（企业蓝图）

1. **正式专业语气**：使用正式语言，避免口语化表达和 emoji 装饰（标题和正文均不使用 emoji）
2. **表格完整保留**：核心功能表（5 行 3 列）、API 参考表（至少 3 行）、环境变量表（至少 3 行）必须保留骨架中的行数
3. **表格内容具体**：功能表中的「说明」和「适用场景」列必须填写实际内容，不要留空或写"见正文"
4. **Mermaid 图表规则**：
   a. **必须保留骨架中的 mermaid 流程图和饼图**
   b. **只能使用以下三种类型**：\`flowchart\`（流程图）、\`pie\`（饼图）、\`sequenceDiagram\`（时序图）
   c. **禁止使用**：\`gantt\`、\`stateDiagram\`、\`classDiagram\`、\`gitGraph\` — 这些类型渲染不稳定
   d. mermaid 流程图节点文本必须替换为项目实际内容（替换方括号内文字，保留节点形状符号 \`[]\` \`[()]\` \`[[]]\`）
   e. 饼图百分比数值保持骨架中的结构，调整具体数字
5. **前后端分明**：技术架构部分必须明确区分前端/后端/基础设施
6. **代码块标签**：代码块必须使用正确的语言标签（如 \`\`\`bash、\`\`\`typescript、\`\`\`json），不要用 \`\`\`text`,

  cards: `
## 专属风格规则（卡片视界）

1. **引用块（>）必须保留**：项目简介的 3 个引用块（🌟背景 / 🎯目标 / 👥适用人群）、核心特性的 5 个引用块全部保留
2. **引用块内容饱满**：每个引用块内必须包含 1 个 emoji 标题 + 至少 2 句话的描述；不要写"待补充"或"详见正文"
3. **分隔线保留**：--- 分隔线必须保留，用于区分各卡片区域
4. **标题 emoji 保留**：每个章节标题前的 emoji（✨ 🔥 🎨 ⚡ 🏗️ 📄 🤝）必须保留
5. **emoji 丰富**：核心特性的引用块标题中使用 💡 🚀 🛡️ ⚙️ 🔌 📦 等 emoji 增加视觉层次
6. **引言区 badge**：保留顶部 4 个 shields.io badge 并替换其中的文字和颜色`,

  showcase: `
## 专属风格规则（项目展厅）

1. **Banner 保留**：开头的 <p align="center"> 和 <img> Banner 标签必须保留，替换其中的文字内容
2. **叙事风格**：「项目简介」必须使用叙事性段落书写项目的缘起、发展和愿景，而非枯燥的功能列表；每个段落控制在 3-5 句话；段落之间用 '---' 分隔
3. **核心特性**：使用 ### 三级标题 + 描述段落，每个特性独立成节；每个特性描述至少 2 句话
4. **路线图**：必须保留 checkbox 列表格式，至少包含 3 个规划中和 2 个已完成的功能
5. **引语**：开头引语和结尾结束语必须用 > 引用块包裹，保留感染力
6. **技术栈格式**：使用列表形式，每项为 "**[技术名]** — [选择该技术的原因]"，解释动机而非罗列功能`,

};

const SHARED_CONTENT_REQUIREMENTS = `
## 内容覆盖要求（所有模板通用）

你的 README 必须覆盖以下内容领域。根据项目实际情况填充，**不要遗漏重要信息**：

1. **项目简介** — 一句话定位 + 背景说明，让读者立刻了解项目做什么
2. **核心特性** — 至少 4-5 项，每项包含名称和简要描述
3. **技术栈** — 主要编程语言、框架、工具及其用途（必须具体到名称，如"Express"而非"后端框架"）
4. **安装指南** — 前置条件 + 安装命令（从源码分析中提取，不要编造不存在的前置条件）
5. **使用示例** — 至少 2 个实际可运行的代码/命令示例
6. **配置说明**（如有） — 环境变量、配置文件、参数等
7. **API 参考**（如有） — 端点、方法、参数说明
8. **项目结构** — 主要目录和文件说明
9. **贡献指南** — 如何参与贡献
10. **许可证** — 许可证类型和版权信息

注意：6-7 项根据项目类型决定是否包含（如类库需要 API 参考，CLI 工具需要配置说明）。1-5、9-10 项必须包含。`;

const SKELETON_RULES = `
## 必须遵守的规则

1. **一级标题 (# )**：必须使用项目名称，严禁自行编造
2. **保留骨架结构**：HTML 标签、表格行列数、引用块、分隔线、代码块标记等全部保留
3. **替换 [内容]**：骨架中的 [方括号] 标记替换为实际项目内容；去掉方括号，直接写内容
4. **不要添加额外章节**：不要添加骨架中没有的章节，不要添加"Made with"/"Powered by"等话术
5. **内容有实际依据**：基于项目信息生成，不要编造
6. **不要使用 <sub>、<sup>、<small> 等修饰标签**
7. **不要将整个 README 包裹在代码块内**：直接输出 Markdown 内容，不要用 \`\`\`markdown 包裹

## 内容质量约束

1. **禁止空洞描述**：❌"该项目使用了优秀的技术" ✅"使用 React + TypeScript 构建前端，Express 提供 REST API"
2. **禁止虚假链接**：❌"更多信息请查看文档" — 除非项目信息提供了具体链接，否则不提
3. **内容溯源**：所有技术栈、依赖、脚本名称必须从提供的项目信息中提取。不确定的用 [需补充] 标记
4. **特性描述格式**：每条特性用 "**[功能名]**：一句话说明" 格式，每项不超过 25 字
5. **代码示例可用**：安装命令、使用示例等代码块必须基于项目信息中的实际内容，不要编造不存在的命令

## 常见反例（切勿模仿）

以下为常见错误输出，你的输出应避免：
- ❌ "该项目拥有出色的性能和良好的可扩展性" → 没有具体数据支撑
- ❌ "前端采用了现代化的技术栈" → 必须指名具体技术
- ❌ "更多信息请参考官方文档" → 没有链接就是无效信息
- ❌ "该项目正在快速迭代中" → ×除非能从源码分析中体现（如频繁提交），否则不写`;

export function buildSystemPrompt(templateId: string): string {
  const skeleton = TEMPLATE_SKELETONS[templateId] || TEMPLATE_SKELETONS.minimal;
  const styleRules = TEMPLATE_STYLE_RULES[templateId] || '';

  return `你是一个专业的 README 生成器。请根据用户的 GitHub 项目信息，参照下方「README 骨架」的结构生成完整 README。

## 你的任务

严格遵循下方骨架的结构，将骨架中 [方括号] 标记的内容替换为项目实际信息。
- 保留骨架中的全部 Markdown 和 HTML 结构不变
- 把 [方括号内容] 替换为贴合项目的具体文字，去掉方括号
- 每个 [内容] 替换为 1-3 句话

${SHARED_CONTENT_REQUIREMENTS}
${SKELETON_RULES}
${styleRules}
## README 骨架（保留此结构，替换 [内容]）

${skeleton}`;
}

export function buildUserPrompt(repo: RepoInfo, projectContext?: string): string {
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

  if (projectContext) {
    return `${base}

## 项目源码分析

${projectContext}

---

**重要**: 使用上述项目信息生成内容。内容要有实际依据（从源码分析的依赖、脚本、目录结构中提取），不要编造。保留骨架结构不变。`;
  }

  return base;
}
