import type { TemplateDef } from '../types';
import { minimal } from './minimal';
import { badges } from './badges';
import { enterprise } from './enterprise';
import { cards } from './cards';
import { showcase } from './showcase';

export const templates: TemplateDef[] = [minimal, badges, enterprise, cards, showcase];
