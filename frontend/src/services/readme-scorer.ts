export interface ReadmeScore {
  total: number;
  checks: {
    sections: number;    // 0-30
    substance: number;   // 0-30
    details: number;     // 0-25
    language: number;    // 0-15
  };
}

const ESSENTIAL_SECTIONS = [
  { keywords: ['安装', 'Installation', 'install'] },
  { keywords: ['使用', 'Usage', 'usage', '快速开始', 'Getting Started'] },
  { keywords: ['API', 'api', '接口', 'API Reference'] },
  { keywords: ['配置', 'Configuration', 'config', '配置项'] },
  { keywords: ['贡献', 'Contributing', 'contributing', '开发'] },
  { keywords: ['许可', 'License', 'license', '协议'] },
];

export function scoreReadme(title: string, sections: { heading: string; content: string }[]): ReadmeScore {
  const markdown = [title, ...sections.map(s => `## ${s.heading}\n${s.content}`)].join('\n\n');

  // 1. Section completeness (0-30)
  let sectionsScore = 0;
  const headingTexts = sections.map(s => s.heading);
  for (const section of ESSENTIAL_SECTIONS) {
    const found = section.keywords.some(kw =>
      headingTexts.some(h => h.includes(kw))
    );
    if (found) sectionsScore += 5;
  }
  sectionsScore = Math.min(sectionsScore, 30);

  // 2. Content richness (0-30)
  let substanceScore = 0;
  if (sections.length > 0) {
    const avgLength = sections.reduce((sum, s) => sum + s.content.length, 0) / sections.length;
    if (avgLength >= 200) substanceScore += 15;
    else if (avgLength >= 100) substanceScore += 10;
    else substanceScore += 5;

    const emptySections = sections.filter(s => s.content.trim().length < 20).length;
    const emptyRatio = emptySections / sections.length;
    if (emptyRatio < 0.1) substanceScore += 10;
    else if (emptyRatio < 0.3) substanceScore += 5;

    // Check for sentences (periods/Chinese punctuation)
    const sentenceCount = (markdown.match(/[。！？.!?]\s/g) || []).length;
    const expectedSentences = sections.length * 3;
    if (sentenceCount >= expectedSentences) substanceScore += 5;
    else if (sentenceCount >= expectedSentences * 0.5) substanceScore += 2;
  }

  // 3. Technical details (0-25)
  let detailsScore = 0;
  const codeBlockCount = (markdown.match(/```/g) || []).length / 2;
  if (codeBlockCount >= 5) detailsScore += 15;
  else if (codeBlockCount >= 3) detailsScore += 10;
  else if (codeBlockCount >= 1) detailsScore += 5;

  const inlineCodeCount = (markdown.match(/`[^`]+`/g) || []).length;
  if (inlineCodeCount >= 10) detailsScore += 5;
  else if (inlineCodeCount >= 5) detailsScore += 3;
  else if (inlineCodeCount >= 2) detailsScore += 1;

  const tableCount = (markdown.match(/^\|.+\|$/gm) || []).length;
  if (tableCount >= 6) detailsScore += 5;
  else if (tableCount >= 3) detailsScore += 3;
  else if (tableCount >= 1) detailsScore += 1;

  detailsScore = Math.min(detailsScore, 25);

  // 4. Chinese quality (0-15)
  let languageScore = 15;
  const placeholderPatterns = [
    /TODO/i,
    /Lorem ipsum/i,
    /\[.*?\]\(.*?\)/g,  // empty links like [text]()
  ];
  for (const pattern of placeholderPatterns) {
    if (pattern.test(markdown)) {
      languageScore -= 3;
    }
  }
  // Check for mixed Chinese/English where English might be untranslated
  const lines = markdown.split('\n');
  let untranslatedLines = 0;
  for (const line of lines) {
    const hasChinese = /[\u4e00-\u9fff]/.test(line);
    if (!hasChinese && line.trim().length > 30 && !line.startsWith('```') && !line.startsWith('|')) {
      untranslatedLines++;
    }
  }
  if (untranslatedLines > lines.length * 0.3) languageScore -= 5;
  else if (untranslatedLines > lines.length * 0.15) languageScore -= 3;

  languageScore = Math.max(languageScore, 0);

  const total = sectionsScore + substanceScore + detailsScore + languageScore;

  return {
    total,
    checks: {
      sections: sectionsScore,
      substance: substanceScore,
      details: detailsScore,
      language: languageScore,
    },
  };
}

export function getScoreLevel(total: number): 'good' | 'ok' | 'poor' {
  if (total >= 70) return 'good';
  if (total >= 45) return 'ok';
  return 'poor';
}

export function getScoreColor(total: number): string {
  if (total >= 70) return 'text-emerald-600';
  if (total >= 45) return 'text-amber-600';
  return 'text-red-500';
}

export function getScoreBg(total: number): string {
  if (total >= 70) return 'bg-emerald-100';
  if (total >= 45) return 'bg-amber-100';
  return 'bg-red-100';
}

export function getScoreLabel(total: number): string {
  if (total >= 70) return '优质';
  if (total >= 45) return '一般';
  return '需优化';
}
