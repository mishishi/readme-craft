import type { TemplateValidationRules } from './validation.js';

export interface TemplateConfig {
  id: string;
  /** 内联 SVG Banner（由系统在生成后自动拼接，AI 不参与生成） */
  banner?: string;
  skeleton: string;
  rules: TemplateValidationRules;
  styleRules: string;
  /** 自定义章节结构说明（空字符串 = 使用默认通用章节列表） */
  chapters: string;
}

export type { TemplateValidationRules };
