import { describe, it, expect } from 'vitest';
import { parseFaqMarkdown, markdownToPlainText } from '../faq-schema';

describe('parseFaqMarkdown', () => {
  it('extracts H3 Q&A pairs across H2 sections', () => {
    const md = `---
keywords: [test]
description: test
---

# FAQ

## General

### What is GreptimeDB?

GreptimeDB is an observability database.

### How fast is it?

Very fast. See benchmarks.
`;
    const qas = parseFaqMarkdown(md);
    expect(qas).toHaveLength(2);
    expect(qas[0].question).toBe('What is GreptimeDB?');
    expect(qas[0].answer).toContain('observability database');
  });

  it('strips Docusaurus admonitions from answers', () => {
    const md = `### Question?

:::tip Some tip
This should be removed.
:::

The actual answer.
`;
    const qas = parseFaqMarkdown(md);
    expect(qas).toHaveLength(1);
    expect(qas[0].answer).not.toContain('tip');
    expect(qas[0].answer).toContain('actual answer');
  });

  it('ignores H3 headings inside code fences', () => {
    const md = `### Real question?

\`\`\`sql
### This is NOT a heading
SELECT 1;
\`\`\`

More answer text.
`;
    const qas = parseFaqMarkdown(md);
    expect(qas).toHaveLength(1);
    expect(qas[0].answer).toContain('More answer text');
  });

  it('parses the real FAQ file with at least 20 Q&A pairs', () => {
    const fs = require('fs');
    const path = require('path');
    const faqPath = path.resolve(
      process.cwd(),
      'versioned_docs/version-1.0/faq-and-others/faq.md',
    );
    if (!fs.existsSync(faqPath)) return;
    const qas = parseFaqMarkdown(fs.readFileSync(faqPath, 'utf-8'));
    expect(qas.length).toBeGreaterThanOrEqual(20);
    for (const qa of qas) {
      expect(qa.question.length).toBeGreaterThan(0);
      expect(qa.answer.length).toBeGreaterThan(0);
    }
  });
});

describe('markdownToPlainText', () => {
  it('strips links and keeps visible text', () => {
    expect(markdownToPlainText('[GreptimeDB](https://greptime.com)')).toBe('GreptimeDB');
  });

  it('removes fenced code blocks entirely', () => {
    const result = markdownToPlainText('Before.\n\n```sql\nSELECT 1;\n```\n\nAfter.');
    expect(result).not.toContain('SELECT');
    expect(result).toContain('Before');
    expect(result).toContain('After');
  });
});
