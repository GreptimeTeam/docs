/**
 * Docusaurus plugin that injects <meta name="robots" content="noindex,follow">
 * into HTML pages for:
 *   - nightly (/nightly/**)
 *   - every version except the one served at the site root (/<version>/**)
 *
 * Rationale: we only want Google to index the version served at the root.
 * nightly is a near-duplicate of it; pre-release and historical versions are
 * for users on other deployments but should not compete in SERP with it.
 *
 * The prefix list is derived from versions.json and the `lastVersion` option
 * so that cutting a new version automatically downgrades the previous one to
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

export interface VersionNoindexOptions {
  /** Version served at the site root; defaults to the newest one. */
  lastVersion?: string;
}

export default function versionNoindex(
  context: LoadContext,
  options: VersionNoindexOptions = {},
): Plugin {
  return {
    name: 'version-noindex',

    async postBuild({ outDir }) {
      // Load versions.json at build time so the plugin follows the source of
      // truth without hardcoding version numbers.
      const versionsPath = path.resolve(process.cwd(), 'versions.json');
      const versions: string[] = JSON.parse(fs.readFileSync(versionsPath, 'utf-8'));
      const lastVersion = options.lastVersion ?? versions[0];

      // nightly + every version that is not served at the root.
      const noindexDirs = ['nightly', ...versions.filter(v => v !== lastVersion)];

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
