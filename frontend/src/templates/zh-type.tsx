import type { TemplateDef } from '../types';

export const zhType: TemplateDef = {
  id: 'zh-type',
  name: '汉字风韵',
  description: '中文字体优化，温润琥珀色调，书法美学排版。适合中文优先的开源项目。',
  premium: true,
  preview: {
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>
    ),
    accent: 'bg-amber-500',
  },
};
