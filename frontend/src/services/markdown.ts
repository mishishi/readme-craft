import type { Section } from '../types';

/**
 * 将 markdown 解析为标题 + 章节列表
 * 支持 ## 分隔的章节结构
 */
export function parseSections(markdown: string): { title: string; sections: Section[] } {
  const lines = markdown.split('\n');
  let title = '';
  const sections: Section[] = [];
  let currentHeading = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    const h1 = line.match(/^# (.+)/);
    if (h1) {
      title = h1[1].trim();
      continue;
    }

    const h2 = line.match(/^## (.+)/);
    if (h2) {
      if (currentHeading) {
        sections.push({
          id: crypto.randomUUID(),
          heading: currentHeading,
          content: currentContent.join('\n').trim(),
        });
      }
      currentHeading = h2[1].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // 最后一个章节
  if (currentHeading) {
    sections.push({
      id: crypto.randomUUID(),
      heading: currentHeading,
      content: currentContent.join('\n').trim(),
    });
  }

  return { title, sections };
}

/**
 * 将标题 + 章节列表组装回 markdown
 */
export function assembleMarkdown(title: string, sections: Section[]): string {
  const parts = [`# ${title}`];
  for (const s of sections) {
    if (s.content.trim()) {
      parts.push('', `## ${s.heading}`, '', s.content);
    }
  }
  return parts.join('\n');
}
