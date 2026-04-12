/**
 * Docusaurus plugin that generates llms.txt, llms-full.txt, and per-page .md files
 * for the latest stable version.
 *
 * Wraps docusaurus-plugin-llms to handle:
 * 1. Locale-aware source directory selection (en/zh)
 * 2. Relocating generated .md files to match the site's URL structure
 * 3. Resolving VAR:: placeholders using version-specific variables
 * 4. Rewriting URLs from source paths to actual site paths
 * 5. Injecting <link rel="alternate" type="text/markdown"> into every HTML
 *    page that has a .md counterpart, so AI crawlers can discover the
 *    clean markdown version directly
 *
 * Step 5 lives here (rather than as a separate plugin) because
 * Docusaurus runs postBuild hooks in parallel via Promise.all — there is
 * no ordering guarantee across plugins, so any work that must happen
 * *after* the .md files are written must be inside this plugin's own
 * postBuild.
 */
import * as fs from 'fs';
import * as path from 'path';
import type { LoadContext, Plugin } from '@docusaurus/types';

const DESCRIPTION = 'GreptimeDB is an open-source observability database for metrics, logs, traces, and wide events. Drop-in replacement for Prometheus, Loki & Elasticsearch, or the single backend for OpenTelemetry.';

function walkIndexHtml(dir: string, results: string[] = []): string[] {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkIndexHtml(full, results);
    } else if (entry.name === 'index.html') {
      results.push(full);
    }
  }
  return results;
}

/**
 * Derive the .md sibling URL for an index.html file.
 *   build/user-guide/concepts/architecture/index.html
 *     -> /user-guide/concepts/architecture.md
 *   build/index.html
 *     -> /index.md
 */
function deriveMdUrlPath(htmlPath: string, outDir: string): { absolute: string; urlPath: string } {
  const rel = path.relative(outDir, htmlPath);
  const dirName = path.dirname(rel);
  if (dirName === '.') {
    return { absolute: path.join(outDir, 'index.md'), urlPath: '/index.md' };
  }
  const mdRel = `${dirName}.md`;
  return {
    absolute: path.join(outDir, mdRel),
    urlPath: '/' + mdRel.split(path.sep).join('/'),
  };
}

function injectMarkdownAlternateLinks(outDir: string): number {
  let injected = 0;
  for (const htmlPath of walkIndexHtml(outDir)) {
    const md = deriveMdUrlPath(htmlPath, outDir);
    if (!fs.existsSync(md.absolute)) continue;

    const html = fs.readFileSync(htmlPath, 'utf-8');
    if (/rel="alternate"[^>]*type="text\/markdown"/i.test(html)) continue;

    const linkTag = `<link rel="alternate" type="text/markdown" href="${md.urlPath}">`;
    const patched = html.replace('</head>', `${linkTag}</head>`);
    if (patched === html) continue;
    fs.writeFileSync(htmlPath, patched);
    injected++;
  }
  return injected;
}


function loadVariables(version: string): Record<string, string> {
  const filePath = path.resolve(process.cwd(), 'variables', `variables-${version}.ts`);
  if (!fs.existsSync(filePath)) return {};
  return require(filePath).variables;
}

function resolveVariables(content: string, variables: Record<string, string>): string {
  return content.replace(/VAR::([A-Z_]+)/ig, (match, varName) => {
    return variables[varName] || match;
  });
}

function walkDir(dir: string, ext: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

export interface LlmsTxtOptions {
  ignoreFiles?: string[];
  includeOrder?: string[];
}

export default function llmsTxtGenerator(
  context: LoadContext,
  options: LlmsTxtOptions,
): Plugin {
  return {
    name: 'llms-txt-generator',

    async postBuild(props) {
      const { outDir } = props;
      const locale = context.i18n.currentLocale;
      const siteOrigin = new URL(props.siteConfig.url).origin;

      // Determine the latest version and its source directory
      const versionsPath = path.resolve(process.cwd(), 'versions.json');
      const latestVersion: string = JSON.parse(fs.readFileSync(versionsPath, 'utf-8'))[0];

      const docsDir = locale === 'zh'
        ? `i18n/zh/docusaurus-plugin-content-docs/version-${latestVersion}`
        : `versioned_docs/version-${latestVersion}`;

      if (!fs.existsSync(path.resolve(process.cwd(), docsDir))) {
        console.warn(`[llms-txt-generator] Source not found: ${docsDir}, skipping`);
        return;
      }

      // Run the upstream llms plugin
      const mod = require('docusaurus-plugin-llms');
      const createPlugin = typeof mod === 'function' ? mod : mod.default;
      const llmsPlugin = createPlugin(context, {
        ...options,
        generateLLMsTxt: true,
        generateLLMsFullTxt: true,
        generateMarkdownFiles: true,
        excludeImports: true,
        removeDuplicateHeadings: true,
        docsDir,
        title: 'GreptimeDB Documentation',
        description: DESCRIPTION,
      });

      await llmsPlugin.postBuild(props);

      // Relocate .md files from build/{docsDir}/ to build/ (latest is served at root)
      const pluginOutputDir = path.join(outDir, docsDir);
      const movedFiles: string[] = [];

      if (fs.existsSync(pluginOutputDir)) {
        for (const srcFile of walkDir(pluginOutputDir, '.md')) {
          const destFile = path.join(outDir, path.relative(pluginOutputDir, srcFile));
          fs.mkdirSync(path.dirname(destFile), { recursive: true });
          fs.copyFileSync(srcFile, destFile);
          movedFiles.push(destFile);
        }
        fs.rmSync(path.join(outDir, docsDir.split('/')[0]), { recursive: true, force: true });
      }

      // Post-process: resolve VAR:: placeholders, then rewrite URLs
      const variables = loadVariables(latestVersion);
      const escapedDocsDir = docsDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const docsUrlPattern = new RegExp(
        `(${siteOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})?/+${escapedDocsDir}/`, 'g'
      );

      const llmsTxtPath = path.join(outDir, 'llms.txt');
      const llmsFullTxtPath = path.join(outDir, 'llms-full.txt');
      const allFiles = [
        ...(fs.existsSync(llmsTxtPath) ? [llmsTxtPath] : []),
        ...(fs.existsSync(llmsFullTxtPath) ? [llmsFullTxtPath] : []),
        ...movedFiles,
      ];

      let postProcessedCount = 0;
      for (const filePath of allFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        let processed = resolveVariables(content, variables);
        // Rewrite URLs and inject the "About GreptimeDB" block only in
        // the two index files, not in per-page markdown.
        if (filePath === llmsTxtPath || filePath === llmsFullTxtPath) {
          processed = processed.replace(docsUrlPattern, `${siteOrigin}/`);

        }
        if (processed !== content) {
          fs.writeFileSync(filePath, processed, 'utf-8');
          postProcessedCount++;
        }
      }

      console.log(
        `[llms-txt-generator] v${latestVersion}: llms.txt + llms-full.txt + ${movedFiles.length} .md files. ` +
        `Post-processed ${postProcessedCount} files.`
      );

      // Must be the final step: inject <link rel="alternate" type="text/markdown">
      // into every HTML page whose .md sibling we just wrote. Living here
      // (instead of in a separate plugin) guarantees the .md files exist
      // by the time we look for them, since Docusaurus runs plugin
      // postBuild hooks in parallel.
      const altLinksInjected = injectMarkdownAlternateLinks(outDir);
      console.log(
        `[llms-txt-generator] injected rel=alternate type=text/markdown into ${altLinksInjected} HTML pages`,
      );
    },
  };
}
