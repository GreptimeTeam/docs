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
 *   - Nightly is disallowed for general crawlers (but still crawlable by
 *     Algolia for search indexing), and also carries noindex at the meta
 *     level for belt-and-suspenders.
 *   - Historical versions: crawlable (no Disallow), but noindex'd via meta.
 */
import * as fs from 'fs';
import * as path from 'path';
import type { LoadContext, Plugin } from '@docusaurus/types';

export default function robotsTxtGenerator(context: LoadContext): Plugin {
  return {
    name: 'robots-txt-generator',

    async postBuild({ outDir, siteConfig }) {
      const siteUrl = siteConfig.url.replace(/\/$/, '');
      const sitemapUrl = `${siteUrl}/sitemap.xml`;

      const lines = [
        '# Allow Algolia to crawl everything so DocSearch can index all',
        '# versions (including nightly) regardless of meta robots tags.',
        'User-agent: Algolia Crawler',
        'Allow: /',
        '',
        '# General crawlers: only the latest stable (served at /) is indexable.',
        '# Nightly is disallowed here. Historical versions are NOT disallowed —',
        '# they carry <meta name="robots" content="noindex,follow"> so Google',
        '# can crawl them, see the noindex, and remove them from the index.',
        'User-agent: *',
        'Allow: /',
        'Disallow: /nightly/',
        '',
        `Sitemap: ${sitemapUrl}`,
        '',
      ];

      fs.writeFileSync(path.join(outDir, 'robots.txt'), lines.join('\n'));
      console.log(`[robots-txt-generator] wrote robots.txt with Sitemap: ${sitemapUrl}`);
    },
  };
}
