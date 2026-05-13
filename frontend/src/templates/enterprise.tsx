import type { TemplateDef } from '../types';

export const enterprise: TemplateDef = {
  id: 'enterprise',
  name: '企业蓝图',
  description: '正式专业，结构化清晰。适合商业/团队项目。',
  preview: {
    gradient: 'from-primary-50 to-blue-100',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    accent: 'bg-primary-600',
  },
};
