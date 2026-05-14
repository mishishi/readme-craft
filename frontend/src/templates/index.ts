import type { TemplateDef } from '../types';
import { minimal } from './minimal';
import { badges } from './badges';
import { enterprise } from './enterprise';
import { cards } from './cards';
import { showcase } from './showcase';
import { zhType } from './zh-type';
import { neoMinimal } from './neo-minimal';

export const templates: TemplateDef[] = [minimal, badges, enterprise, cards, showcase, zhType, neoMinimal];

export function getTemplate(id: string): TemplateDef | undefined {
  return templates.find((t) => t.id === id);
}
