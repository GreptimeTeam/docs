/**
 * Generates robots.txt at build time so the Sitemap directive points to
 * the correct domain (.com or .cn) based on the current locale.
 *
 * Non-stable versions (nightly, historical) are de-indexed via bot-specific
 * meta tags (see src/plugins/version-noindex.ts), not via robots.txt.
 */
import * as fs from 'fs';
import * as path from 'path';
import type { LoadContext, Plugin } from '@docusaurus/types';

export function generateRobotsTxtContent(siteUrl: string): string {
  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ];
  return lines.join('\n');
}

export default function robotsTxtGenerator(context: LoadContext): Plugin {
  return {
    name: 'robots-txt-generator',

    async postBuild({ outDir, siteConfig }) {
      const siteUrl = siteConfig.url.replace(/\/$/, '');
      const content = generateRobotsTxtContent(siteUrl);
      fs.writeFileSync(path.join(outDir, 'robots.txt'), content);
      console.log(`[robots-txt-generator] wrote robots.txt with Sitemap: ${siteUrl}/sitemap.xml`);
    },
  };
}
