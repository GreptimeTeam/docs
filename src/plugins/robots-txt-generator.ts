/**
 * Docusaurus plugin that generates robots.txt at build time.
 *
 * Replaces the static file because:
 *   1. The Sitemap directive must point to the current site's absolute URL
 *      (.com or .cn), which is only known at build time via siteConfig.url.
 *   2. Crawl policy is environment-aware and intentionally does NOT
 *      disallow historical versions — they carry a <meta name="robots"
 *      content="noindex,follow"> tag (see src/plugins/version-noindex.ts)
 *      so crawlers can visit, see the noindex, and de-index them. Using
 *      robots.txt Disallow would block crawlers from seeing the meta tag,
 *      leaving stale index entries forever.
 *
 * Policy:
 *   - Only the latest stable version (served at /) is indexed.
 *   - Nightly and historical versions are NOT disallowed — they carry
 *     <meta name="robots" content="noindex,follow"> so crawlers must be
 *     able to fetch the page, see the tag, and de-index it. Sitemap
 *     exclusion (see docusaurus.config.ts) prevents them from being
 *     discovered via sitemap; the meta tag handles de-indexing for any
 *     URLs already known to search engines via external links.
 */
import * as fs from 'fs';
import * as path from 'path';
import type { LoadContext, Plugin } from '@docusaurus/types';

export function generateRobotsTxtContent(siteUrl: string): string {
  const sitemapUrl = `${siteUrl}/sitemap.xml`;

  const lines = [
    '# Allow Algolia to crawl everything so DocSearch can index all',
    '# versions (including nightly) regardless of meta robots tags.',
    'User-agent: Algolia Crawler',
    'Allow: /',
    '',
    '# General crawlers: only the latest stable (served at /) is indexable.',
    '# Nightly and historical versions are intentionally NOT disallowed.',
    '# They carry <meta name="robots" content="noindex,follow"> — crawlers',
    '# must be able to fetch the page and see that tag to de-index it.',
    '# Disallow would block crawlers from seeing noindex, leaving stale',
    '# index entries forever.',
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${sitemapUrl}`,
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
