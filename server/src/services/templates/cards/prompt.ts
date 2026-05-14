import { buildPromptFromConfig } from '../shared/helpers.js';
import type { TemplateConfig } from '../shared/types.js';

export function buildSystemPrompt(config: TemplateConfig, strictMode?: boolean): string {
  return buildPromptFromConfig(config, strictMode);
}
