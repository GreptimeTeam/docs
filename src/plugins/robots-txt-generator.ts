/**
 * Docusaurus plugin that generates robots.txt at build time.
 *
 * Replaces the static file because:
 *   1. The Sitemap directive must point to the current site's absolute URL
 *      (.com or .cn), which is only known at build time via siteConfig.url.
 *   2. The Disallow list for historical versions should be derived from
 *      versions.json so new releases auto-update without manual edits.
 *
 * Policy:
 *   - Only the latest stable version (served at /) is indexed.
 *   - Nightly is crawlable by Algolia for search indexing but disallowed
 *     for general crawlers and noindex'd at the meta level.
 *   - Historical versions are NOT disallowed here — they are noindex'd via
 *     <meta name="robots"> (see src/plugins/version-noindex.ts). Using
 *     robots.txt Disallow would prevent Google from seeing the noindex tag
 *     and leave stale index entries forever.
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
        'Disallow: /markdown-page/',
        '',
        `Sitemap: ${sitemapUrl}`,
        '',
      ];

      fs.writeFileSync(path.join(outDir, 'robots.txt'), lines.join('\n'));
      console.log(`[robots-txt-generator] wrote robots.txt with Sitemap: ${sitemapUrl}`);
    },
  };
}
