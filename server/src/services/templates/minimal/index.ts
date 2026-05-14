import type { TemplateConfig } from '../shared/types.js';
import { buildSystemPrompt } from './prompt.js';

export const config: TemplateConfig = {
  id: 'minimal',
  skeleton: [
    '# [项目名称]',
    '',
    '[项目一句话定位，不超过20字]',
    '',
    '## 简介',
    '',
    '[项目简要说明，2-3句话，概括背景和目标]',
    '',
    '## 特性',
    '',
    '- **[特性一]** — [一句话说明]',
    '- **[特性二]** — [一句话说明]',
    '- **[特性三]** — [一句话说明]',
    '- **[特性四]** — [一句话说明]',
    '',
    '## 技术栈',
    '',
    '- **[技术一]**：[用途简述]',
    '- **[技术二]**：[用途简述]',
    '- **[技术三]**：[用途简述]',
    '',
    '## 安装',
    '',
    '```bash',
    '[安装命令]',
    '```',
    '',
    '[环境要求，一句话]',
    '',
    '## 使用',
    '',
    '```bash',
    '[基本使用示例]',
    '```',
    '',
    '[说明，一句话]',
    '',
    '## 项目结构',
    '',
    '```',
    '[项目目录结构]',
    '```',
    '',
    '## 贡献指南',
    '',
    '[如何参与贡献，1-2句话]',
    '',
    '## 许可证',
    '',
    '[许可证名称] © [作者]',
  ].join('\n'),
  rules: {
    mustContain: ['# ', '## '],
    forbidden: ['<div', '<p align', '<img', 'shields.io', '```markdown', '自检清单', '项目类型：', '目标读者', '读者最想获得的内容', 'README 侧重点'],
    maxPlaceholderResidue: 8,
    minLength: 200,
  },
  styleRules: `
## 模板风格约束

模板「极简清风」：
- 纯 Markdown，不使用任何 HTML 标签
- 不使用表格、引用块、badges 或 emoji
- 标题 + 列表 + 代码块排版，段落 2-3 句话，空行分隔`,
  chapters: '',
};

export { buildSystemPrompt };
