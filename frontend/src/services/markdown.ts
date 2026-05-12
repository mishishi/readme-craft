import type { Section } from '../types';
import { uuid } from '../utils/uuid';

/**
 * 将 markdown 解析为 title + preamble（H2 前的内容）+ 章节列表
 */
export function parseSections(markdown: string): { title: string; preamble: string; sections: Section[] } {
  const lines = markdown.split('\n');
  let title = '';
  let preambleLines: string[] = [];
  const sections: Section[] = [];
  let currentHeading = '';
  let currentContent: string[] = [];
  let seenFirstH2 = false;

  for (const line of lines) {
    const h1 = line.match(/^# (.+)/);
    if (h1) {
      title = h1[1].trim();
      continue;
    }

    const h2 = line.match(/^## (.+)/);
    if (h2) {
      if (!seenFirstH2) {
        seenFirstH2 = true;
        preambleLines = [...currentContent];
        currentContent = [];
      } else if (currentHeading) {
        sections.push({
          id: uuid(),
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
  if (!seenFirstH2 && currentContent.length > 0) {
    // 没有 H2 的情况，全部作为 preamble
    preambleLines = [...currentContent];
  } else if (currentHeading) {
    sections.push({
      id: uuid(),
      heading: currentHeading,
      content: currentContent.join('\n').trim(),
    });
  }

  return {
    title,
    preamble: preambleLines.join('\n').trim(),
    sections,
  };
}

/**
 * 将 title + preamble + sections 组装回 markdown
 */
export function assembleMarkdown(title: string, preamble: string, sections: Section[]): string {
  const parts = [`# ${title}`];
  if (preamble) {
    parts.push('', preamble);
  }
  for (const s of sections) {
    if (s.content.trim()) {
      parts.push('', `## ${s.heading}`, '', s.content);
    }
  }
  return parts.join('\n');
}
