import type { TemplateDef } from '../types';

export const badges: TemplateDef = {
  id: 'badges',
  name: 'Badge 大满贯',
  description: '顶部 badge 墙 + 功能卡片。适合开源项目，视觉冲击力强。',
  preview: {
    gradient: 'from-amber-50 to-rose-50',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    accent: 'bg-amber-500',
  },
};
