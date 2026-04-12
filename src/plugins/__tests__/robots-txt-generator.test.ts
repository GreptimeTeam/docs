import { describe, it, expect } from 'vitest';
import { generateRobotsTxtContent } from '../robots-txt-generator';

describe('generateRobotsTxtContent', () => {
  it('contains correct Sitemap directive per locale', () => {
    expect(generateRobotsTxtContent('https://docs.greptime.com'))
      .toContain('Sitemap: https://docs.greptime.com/sitemap.xml');
    expect(generateRobotsTxtContent('https://docs.greptime.cn'))
      .toContain('Sitemap: https://docs.greptime.cn/sitemap.xml');
  });

  it('allows all crawlers and has no Disallow', () => {
    const content = generateRobotsTxtContent('https://docs.greptime.com');
    expect(content).toContain('Allow: /');
    const directives = content.split('\n').filter(l => !l.startsWith('#') && l.trim());
    expect(directives.some(l => l.startsWith('Disallow:'))).toBe(false);
  });
});
