import type { TemplateDef } from '../types';

export const showcase: TemplateDef = {
  id: 'showcase',
  name: '项目展厅',
  description: '高质量展示风格，大 Banner + 截图。适合个人作品/App。',
  preview: {
    gradient: 'from-primary-100 to-primary-50',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
    accent: 'bg-primary-600',
  },
};
