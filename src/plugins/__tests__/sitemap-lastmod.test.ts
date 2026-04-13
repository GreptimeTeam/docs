import { describe, it, expect } from 'vitest';
import { urlToSourceFile } from '../sitemap-lastmod';

describe('urlToSourceFile', () => {
  // These tests run against the real repo tree. If the versioned_docs
  // layout changes, they'll catch it.

  const LATEST = '1.0';

  it('maps a deep doc URL to its versioned source file', () => {
    const result = urlToSourceFile(
      'https://docs.greptime.com/user-guide/concepts/architecture/',
      'en',
      LATEST,
    );
    expect(result).toBe(`versioned_docs/version-${LATEST}/user-guide/concepts/architecture.md`);
  });

  it('maps root URL to index.md', () => {
    const result = urlToSourceFile('https://docs.greptime.com/', 'en', LATEST);
    expect(result).toBe(`versioned_docs/version-${LATEST}/index.md`);
  });

  it('maps zh locale to i18n path', () => {
    const result = urlToSourceFile(
      'https://docs.greptime.cn/user-guide/concepts/architecture/',
      'zh',
      LATEST,
    );
    expect(result).toBe(
      `i18n/zh/docusaurus-plugin-content-docs/version-${LATEST}/user-guide/concepts/architecture.md`,
    );
  });

  it('returns null for release-notes URLs', () => {
    expect(urlToSourceFile('https://docs.greptime.com/release-notes/release-1-0-0/', 'en', LATEST))
      .toBeNull();
  });

  it('returns null for /search/', () => {
    expect(urlToSourceFile('https://docs.greptime.com/search/', 'en', LATEST))
      .toBeNull();
  });

  it('returns null for non-existent doc path', () => {
    expect(urlToSourceFile('https://docs.greptime.com/does-not-exist-xyz/', 'en', LATEST))
      .toBeNull();
  });

  it('handles overview pages served from slug/index.md on disk', () => {
    // Docusaurus renders docs/getting-started/installation/overview.md
    // at /getting-started/installation/overview/ — source is overview.md
    const result = urlToSourceFile(
      'https://docs.greptime.com/getting-started/installation/overview/',
      'en',
      LATEST,
    );
    expect(result).toMatch(/overview\.md$/);
    expect(result).not.toBeNull();
  });
});
