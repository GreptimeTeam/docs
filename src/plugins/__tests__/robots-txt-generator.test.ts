import { describe, it, expect } from 'vitest';
import { generateRobotsTxtContent } from '../robots-txt-generator';

describe('generateRobotsTxtContent', () => {
  it('contains correct Sitemap directive for en site', () => {
    const content = generateRobotsTxtContent('https://docs.greptime.com');
    expect(content).toContain('Sitemap: https://docs.greptime.com/sitemap.xml');
  });

  it('contains correct Sitemap directive for zh site', () => {
    const content = generateRobotsTxtContent('https://docs.greptime.cn');
    expect(content).toContain('Sitemap: https://docs.greptime.cn/sitemap.xml');
  });

  it('allows Algolia to crawl everything', () => {
    const content = generateRobotsTxtContent('https://docs.greptime.com');
    const algoliaBlock = content.split('User-agent: Algolia Crawler')[1]
      .split('User-agent:')[0];
    expect(algoliaBlock).toContain('Allow: /');
  });

  it('does NOT disallow nightly or historical versions', () => {
    const content = generateRobotsTxtContent('https://docs.greptime.com');
    // Check actual directives (non-comment lines), not comment text.
    const directives = content.split('\n').filter(l => !l.startsWith('#') && l.trim());
    expect(directives.some(l => l.startsWith('Disallow:'))).toBe(false);
  });

  it('has a general Allow: / for all crawlers', () => {
    const content = generateRobotsTxtContent('https://docs.greptime.com');
    const generalBlock = content.split('User-agent: *')[1];
    expect(generalBlock).toContain('Allow: /');
  });
});
