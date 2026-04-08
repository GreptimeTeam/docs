/**
 * Docusaurus plugin that generates llms.txt, llms-full.txt, and per-page .md files
 * for the latest stable version.
 *
 * Wraps docusaurus-plugin-llms to handle:
 * 1. Locale-aware source directory selection (en/zh)
 * 2. Relocating generated .md files to match the site's URL structure
 * 3. Resolving VAR:: placeholders using version-specific variables
 * 4. Rewriting URLs from source paths to actual site paths
 */
import * as fs from 'fs';
import * as path from 'path';
import type { LoadContext, Plugin } from '@docusaurus/types';

const DESCRIPTION = 'GreptimeDB is an open-source observability database for metrics, logs, traces, and wide events. Drop-in replacement for Prometheus, Loki & Elasticsearch, or the single backend for OpenTelemetry.';

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

      let varResolvedCount = 0;
      for (const filePath of allFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        let processed = resolveVariables(content, variables);
        // Rewrite URLs only in index files, not in per-page markdown
        if (filePath === llmsTxtPath || filePath === llmsFullTxtPath) {
          processed = processed.replace(docsUrlPattern, `${siteOrigin}/`);
        }
        if (processed !== content) {
          fs.writeFileSync(filePath, processed, 'utf-8');
          varResolvedCount++;
        }
      }

      console.log(
        `[llms-txt-generator] v${latestVersion}: llms.txt + llms-full.txt + ${movedFiles.length} .md files. ` +
        `VAR:: resolved in ${varResolvedCount} files.`
      );
    },
  };
}
