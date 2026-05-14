import type { TemplateConfig } from '../shared/types.js';
import { buildSystemPrompt } from './prompt.js';

export const config: TemplateConfig = {
  id: 'neo-minimal',
  skeleton: [
    '# [项目名称]',
    '',
    '> [一句话项目定位，英文或中英双语]',
    '',
    '![banner](https://placehold.co/800x200/1e293b/e2e8f0?text=Banner)',
    '',
    '---',
    '',
    '## Features',
    '',
    '- **Tag 1** — [简短功能描述]',
    '- **Tag 2** — [简短功能描述]',
    '- **Tag 3** — [简短功能描述]',
    '- **Tag 4** — [简短功能描述]',
    '',
    '## Architecture',
    '',
    '```mermaid',
    'flowchart TD',
    '  A[Input] --> B[Module A]',
    '  B --> C[Module B]',
    '  C --> D[Output]',
    '```',
    '',
    '## Quick Start',
    '',
    '### Prerequisites',
    '',
    '- [Requirement 1]',
    '- [Requirement 2]',
    '',
    '### Installation',
    '',
    '```bash',
    '[install command]',
    '```',
    '',
    '### Usage',
    '',
    '```bash',
    '[usage example]',
    '```',
    '',
    '## API Reference',
    '',
    '### `functionName(args)`',
    '',
    '| Param | Type | Default | Description |',
    '|-------|------|---------|-------------|',
    '| `arg1` | `string` | — | [description] |',
    '| `arg2` | `number` | `10` | [description] |',
    '',
    '**Returns:** `Promise<Result>`',
    '',
    '## Project Structure',
    '',
    '```',
    '[directory tree]',
    '```',
    '',
    '## Contributing',
    '',
    'See [CONTRIBUTING.md](./CONTRIBUTING.md).',
    '',
    '## License',
    '',
    '[License] © [Author]',
  ].join('\n'),
  rules: {
    mustContain: ['# ', '## ', '```'],
    forbidden: ['<div', '<p align', 'shields.io', 'via.placeholder.com', '😄', '👍', '🎉', '🚀', '✨', '🔥', '自检清单', '项目类型：', '目标读者', '读者最想获得的内容', 'README 侧重点'],
    maxPlaceholderResidue: 2,
    minLength: 400,
  },
  styleRules: `
## 模板风格约束

模板「极简·Pro」：
- 完全禁止 emoji（包括标题和特性列表）
- 保留 mermaid 图表（仅限 flowchart），禁止其他图表类型
- 必须使用 \`---\` 分隔线分割每个章节
- API 参考使用标准表格格式（参数、类型、默认值、描述）
- 特性使用加粗标签式列表（**Label** — Description）
- 代码块使用正确的语言标签，可以保留 Banner 图片占位结构
- 项目简介使用一段式描述，非列表
- 禁止 Markdown 引用块（> 语法）
- 头部结构固定为三段式：Banner 占位 HTML → \`# 标题\` → 一段式描述 → \`---\`
- 架构部分必须包含 mermaid flowchart 图表，图表下方配 1-2 句文字说明
- API 参考使用标准 Markdown 表格（| 参数 | 类型 | 默认值 | 说明 |），每张表至少 3 行
- 章节顺序固定为：Banner HTML → # 标题 → 一段式描述 → 特性 → 架构（mermaid flowchart） → API 参考（至少 2 张标准表格） → 快速开始 → 项目结构 → 贡献指南 → 许可证
- 架构部分不得使用列表或段落说明，必须使用 mermaid flowchart 图表
- 目录树根节点使用项目名称（如 \`express/\`），不要用 \`.\`
- **项目结构必须从「项目源码分析」中提取真实目录树**，禁止编造或使用通用项目结构
`,
  chapters: `
根据模板「极简·Pro」的要求，使用以下固定章节顺序（不可增删或调序）：

【Features】—— 加粗标签式列表（**Label** — Description），禁止 emoji
【Architecture】—— 必须包含 mermaid flowchart 图表 + 1-2 句文字说明
【Quick Start】—— Prerequisites + Installation + Usage
【API Reference】—— 标准表格（参数 | 类型 | 默认值 | 说明），至少 2 张表
【Project Structure】—— 从「项目源码分析」中提取真实目录树
【Contributing】
【License】

这些章节顺序固定，不能调整。不要添加不在此列表中的章节。`,
};

export { buildSystemPrompt };
