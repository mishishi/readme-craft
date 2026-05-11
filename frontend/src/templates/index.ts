import type { TemplateDef } from '../types';

export const templates: TemplateDef[] = [
  {
    id: 'minimal',
    name: '极简清风',
    description: '干净、留白、排版至上。适合通用项目或工具库。',
    preview: {
      gradient: 'from-slate-50 to-blue-50',
      icon: '🌿',
      accent: 'bg-blue-500',
    },
  },
  {
    id: 'badges',
    name: 'Badge 大满贯',
    description: '顶部 badge 墙 + 功能卡片。适合开源项目，视觉冲击力强。',
    preview: {
      gradient: 'from-amber-50 to-rose-50',
      icon: '🏅',
      accent: 'bg-amber-500',
    },
  },
  {
    id: 'enterprise',
    name: '企业蓝图',
    description: '正式专业，结构化清晰。适合商业/团队项目。',
    preview: {
      gradient: 'from-indigo-50 to-blue-100',
      icon: '🏢',
      accent: 'bg-indigo-600',
    },
  },
  {
    id: 'cards',
    name: '卡片视界',
    description: '卡片式布局，视觉层次丰富。适合前端/设计项目。',
    preview: {
      gradient: 'from-emerald-50 to-teal-50',
      icon: '🎴',
      accent: 'bg-emerald-500',
    },
  },
  {
    id: 'showcase',
    name: '项目展厅',
    description: '高质量展示风格，大 Banner + 截图。适合个人作品/App。',
    preview: {
      gradient: 'from-violet-50 to-purple-50',
      icon: '🎬',
      accent: 'bg-violet-600',
    },
  },
];
