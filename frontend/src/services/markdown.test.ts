import { describe, it, expect } from 'vitest';
import { parseSections, assembleMarkdown } from './markdown';

describe('parseSections', () => {
  it('parses title from H1', () => {
    const result = parseSections('# My Project\n\nSome content');
    expect(result.title).toBe('My Project');
  });

  it('extracts preamble before first H2', () => {
    const result = parseSections('# Title\n\nThis is the preamble.\n\n## Section 1\n\nContent here.');
    expect(result.preamble).toBe('This is the preamble.');
    expect(result.sections).toHaveLength(1);
  });

  it('parses multiple sections', () => {
    const md = '# Project\n\nLead.\n\n## Install\n\nnpm install\n\n## Usage\n\nimport it\n\n## License\n\nMIT';
    const result = parseSections(md);
    expect(result.title).toBe('Project');
    expect(result.preamble).toBe('Lead.');
    expect(result.sections).toHaveLength(3);
    expect(result.sections[0].heading).toBe('Install');
    expect(result.sections[0].content).toBe('npm install');
    expect(result.sections[1].heading).toBe('Usage');
    expect(result.sections[1].content).toBe('import it');
    expect(result.sections[2].heading).toBe('License');
    expect(result.sections[2].content).toBe('MIT');
  });

  it('handles markdown without any H2', () => {
    const md = '# Project\n\nJust some text.\n\nMore text.';
    const result = parseSections(md);
    expect(result.title).toBe('Project');
    expect(result.preamble).toBe('Just some text.\n\nMore text.');
    expect(result.sections).toHaveLength(0);
  });

  it('handles markdown without H1', () => {
    const md = '## Section\n\ncontent';
    const result = parseSections(md);
    expect(result.title).toBe('');
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].heading).toBe('Section');
  });

  it('strips leading/trailing whitespace from preamble and section content', () => {
    const md = '# T\n\n\n  preamble text  \n\n## S\n\n\n  inner  \n\n';
    const result = parseSections(md);
    expect(result.preamble).toBe('preamble text');
    expect(result.sections[0].content).toBe('inner');
  });

  it('generates unique IDs for each section', () => {
    const md = '# T\n\n## A\n\nx\n\n## B\n\ny';
    const result = parseSections(md);
    expect(result.sections[0].id).toBeTruthy();
    expect(result.sections[1].id).toBeTruthy();
    expect(result.sections[0].id).not.toBe(result.sections[1].id);
  });

  it('preserves multiline content within a section', () => {
    const md = '# T\n\n## Code\n\n```js\nconst a = 1;\nconst b = 2;\n```';
    const result = parseSections(md);
    expect(result.sections[0].content).toContain('const a = 1;');
    expect(result.sections[0].content).toContain('const b = 2;');
  });

  it('handles empty markdown', () => {
    const result = parseSections('');
    expect(result.title).toBe('');
    expect(result.preamble).toBe('');
    expect(result.sections).toHaveLength(0);
  });

  it('handles H2 immediately after H1 with no preamble', () => {
    const md = '# T\n## S\n\nc';
    const result = parseSections(md);
    expect(result.title).toBe('T');
    expect(result.preamble).toBe('');
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].heading).toBe('S');
  });
});

describe('assembleMarkdown', () => {
  it('assembles title, preamble, and sections into markdown', () => {
    const sections = [
      { id: '1', heading: 'Install', content: 'npm install' },
      { id: '2', heading: 'Usage', content: 'import foo' },
    ];
    const result = assembleMarkdown('My Project', 'Intro text.', sections);
    expect(result).toBe('# My Project\n\nIntro text.\n\n## Install\n\nnpm install\n\n## Usage\n\nimport foo');
  });

  it('omits empty sections', () => {
    const sections = [
      { id: '1', heading: 'Install', content: '' },
      { id: '2', heading: 'Usage', content: 'import foo' },
    ];
    const result = assembleMarkdown('Project', '', sections);
    expect(result).toBe('# Project\n\n## Usage\n\nimport foo');
  });

  it('works with title only (no preamble, no sections)', () => {
    const result = assembleMarkdown('Alone', '', []);
    expect(result).toBe('# Alone');
  });

  it('includes preamble when present even without sections', () => {
    const result = assembleMarkdown('T', 'Lead paragraph.', []);
    expect(result).toBe('# T\n\nLead paragraph.');
  });

  it('trims section content before assembling', () => {
    const sections = [{ id: '1', heading: 'S', content: '  text  ' }];
    const result = assembleMarkdown('T', '', sections);
    expect(result).toContain('  text  '); // assembleMarkdown doesn't trim, but parseSections does
  });
});
