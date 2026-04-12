/**
 * Helper for @docusaurus/plugin-sitemap's createSitemapItems: resolves the
 * git last-commit timestamp for each doc URL and returns it as an ISO-8601
 * string suitable for the <lastmod> sitemap field.
 *
 * Docusaurus' built-in sitemap plugin omits lastmod entirely, so Google gets
 * no freshness signal. This helper reconstructs the source file path from
 * the URL slug (following versioned_docs convention) and looks up git mtime.
 *
 * Blog/release-notes URLs are skipped — those pages come from a separate
 * git subtree and have their own `date` frontmatter that Docusaurus already
 * exposes differently.
 */
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const mtimeCache = new Map<string, string | null>();

function gitMtime(relativePath: string): string | null {
  if (mtimeCache.has(relativePath)) {
    return mtimeCache.get(relativePath)!;
  }
  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', relativePath],
      { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    const result = out || null;
    mtimeCache.set(relativePath, result);
    return result;
  } catch {
    mtimeCache.set(relativePath, null);
    return null;
  }
}

/**
 * Resolve a sitemap URL to its source markdown file path relative to the
 * repo root. Returns null if the URL does not correspond to a doc page we
 * can map (e.g. release-notes, search, 404).
 */
export function urlToSourceFile(
  urlString: string,
  locale: 'en' | 'zh',
  latestVersion: string,
): string | null {
  let pathname: string;
  try {
    pathname = new URL(urlString).pathname;
  } catch {
    return null;
  }

  // Skip non-doc routes.
  if (
    pathname.startsWith('/release-notes/') ||
    pathname === '/search/' ||
    pathname === '/404/'
  ) {
    return null;
  }

  const baseDir =
    locale === 'zh'
      ? `i18n/zh/docusaurus-plugin-content-docs/version-${latestVersion}`
      : `versioned_docs/version-${latestVersion}`;

  // Root path → index.md at version root.
  if (pathname === '/') {
    const indexPath = `${baseDir}/index.md`;
    return fs.existsSync(path.resolve(process.cwd(), indexPath)) ? indexPath : null;
  }

  const slug = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!slug) return null;

  // Try common file layout: slug.md, slug.mdx, slug/index.md, slug/index.mdx
  const candidates = [
    `${baseDir}/${slug}.md`,
    `${baseDir}/${slug}.mdx`,
    `${baseDir}/${slug}/index.md`,
    `${baseDir}/${slug}/index.mdx`,
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.resolve(process.cwd(), candidate))) {
      return candidate;
    }
  }
  return null;
}

/**
 * Resolve a lastmod ISO-8601 timestamp for a given sitemap URL, or null if
 * the URL has no mapped source file.
 */
export function resolveLastmod(
  url: string,
  locale: 'en' | 'zh',
  latestVersion: string,
): string | null {
  const sourceFile = urlToSourceFile(url, locale, latestVersion);
  if (!sourceFile) return null;
  return gitMtime(sourceFile);
}
