import type { TemplateConfig } from './shared/types.js';
import type { TemplateValidationRules } from './shared/validation.js';
import { validateOutput, buildRefinePrompt, checkCoverage } from './shared/validation.js';
import * as minimal from './minimal/index.js';
import * as badges from './badges/index.js';
import * as enterprise from './enterprise/index.js';
import * as cards from './cards/index.js';
import * as showcase from './showcase/index.js';
import * as zhType from './zh-type/index.js';
import * as neoMinimal from './neo-minimal/index.js';

// ===== 模板注册表 =====
interface TemplateEntry {
  config: TemplateConfig;
  buildSystemPrompt: (config: TemplateConfig, strictMode?: boolean) => string;
}

const registry: Record<string, TemplateEntry> = {
  minimal,
  badges,
  enterprise,
  cards,
  showcase,
  'zh-type': zhType,
  'neo-minimal': neoMinimal,
};

export const TEMPLATES: Record<string, TemplateConfig> = Object.fromEntries(
  Object.entries(registry).map(([id, entry]) => [id, entry.config])
);

/** 获取模板配置，找不到时返回默认（minimal） */
export function getTemplateConfig(templateId: string): TemplateConfig {
  return registry[templateId]?.config || registry.minimal.config;
}

/** 构建 System Prompt */
export function buildSystemPrompt(templateId: string, strictMode?: boolean): string {
  const entry = registry[templateId] || registry.minimal;
  return entry.buildSystemPrompt(entry.config, strictMode);
}

/** 获取所有模板 ID */
export function getTemplateIds(): string[] {
  return Object.keys(registry);
}

// Re-export for backward compat with commented validate-retry in generate.ts
export { validateOutput, buildRefinePrompt, checkCoverage };
export type { TemplateValidationRules };
