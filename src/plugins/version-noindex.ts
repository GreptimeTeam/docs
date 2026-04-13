/**
 * Docusaurus plugin that injects <meta name="robots" content="noindex,follow">
 * into HTML pages for:
 *   - nightly (/nightly/**)
 *   - all historical versions (/<version>/**, derived from versions.slice(1))
 *
 * Rationale: we only want Google to index the latest stable version. nightly
 * is near-duplicate of stable; historical versions are for users on old
 * deployments but should not compete in SERP with current docs.
 *
 * The prefix list is dynamically derived from versions.json so that when a
 * new stable is cut (e.g. 1.1), the old 1.0 is automatically downgraded to
 * noindex without any manual config change.
 */
import * as fs from 'fs';
import * as path from 'path';
import type { LoadContext, Plugin } from '@docusaurus/types';

const ROBOTS_META = '<meta name="robots" content="noindex,follow">';

function walkHtml(dir: string, results: string[] = []): string[] {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtml(fullPath, results);
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

function injectNoindex(filePath: string): boolean {
  const html = fs.readFileSync(filePath, 'utf-8');
  // Idempotent: skip if the page already declares a robots directive.
  if (/<meta\s+name=["']robots["']/i.test(html)) {
    return false;
  }
  const patched = html.replace('</head>', `${ROBOTS_META}</head>`);
  if (patched === html) {
    // No </head> found (should not happen for Docusaurus output, but be safe).
    return false;
  }
  fs.writeFileSync(filePath, patched);
  return true;
}

export default function versionNoindex(context: LoadContext): Plugin {
  return {
    name: 'version-noindex',

    async postBuild({ outDir }) {
      // Load versions.json at build time so the plugin follows the source of
      // truth without hardcoding version numbers.
      const versionsPath = path.resolve(process.cwd(), 'versions.json');
      const versions: string[] = JSON.parse(fs.readFileSync(versionsPath, 'utf-8'));

      // nightly + every version except the latest stable (versions[0]).
      const noindexDirs = ['nightly', ...versions.slice(1)];

      let totalPatched = 0;
      for (const dirName of noindexDirs) {
        const dirPath = path.join(outDir, dirName);
        if (!fs.existsSync(dirPath)) {
          continue;
        }
        for (const htmlFile of walkHtml(dirPath)) {
          if (injectNoindex(htmlFile)) {
            totalPatched++;
          }
        }
      }

      console.log(
        `[version-noindex] injected noindex into ${totalPatched} HTML files ` +
          `across: ${noindexDirs.join(', ')}`,
      );
    },
  };
}
