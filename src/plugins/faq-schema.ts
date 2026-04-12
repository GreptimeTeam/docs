/**
 * Docusaurus plugin that injects a schema.org FAQPage JSON-LD block into
 * the built HTML for the FAQ page.
 *
 * Parsing is done against the source markdown (not the rendered HTML)
 * because the source format is stable and owned by us:
 *   - "## " headings are category sections (General, Data Model, ...)
 *   - "### " headings are actual questions
 *   - everything between an H3 and the next H3/H2 is the answer
 *
 * Admonition blocks (`:::tip ... :::`) and code fences are stripped from
 * answers since they don't belong in structured data.
 *
 * Note on Google SERP impact: as of May 2023 Google restricts FAQ rich
 * results to "well-known, authoritative government and health websites".
 * A tech-docs site like ours will likely NOT get a visible rich result
 * in Google SERP. The value we capture here is:
 *   1. Bing still renders FAQ rich results
 *   2. AI tools (ChatGPT, Claude, Perplexity, Copilot) can consume the
 *      structured data directly, improving citation accuracy
 *   3. Google still uses the data for entity understanding even when
 *      not displayed
 */
import * as fs from 'fs';
import * as path from 'path';
import type { LoadContext, Plugin } from '@docusaurus/types';

export interface QA {
  question: string;
  answer: string;
}

/**
 * Parse the FAQ markdown into a flat list of Q&A pairs, skipping any
 * content that precedes the first H3 (e.g. the intro admonition block).
 */
export function parseFaqMarkdown(content: string, siteUrl?: string): QA[] {
  // Strip frontmatter.
  const withoutFm = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  // Strip Docusaurus admonitions (`:::tip ... :::`, `:::note ... :::`, etc.)
  const withoutAdmonitions = withoutFm.replace(/^:::[a-z]+[^\n]*\n[\s\S]*?^:::\s*$/gm, '');

  const lines = withoutAdmonitions.split('\n');
  const qas: QA[] = [];

  let inCodeFence = false;
  let currentQ: string | null = null;
  let currentAnswer: string[] = [];

  const flush = () => {
    if (currentQ) {
      const answer = markdownToPlainText(currentAnswer.join('\n'), siteUrl);
      if (answer) {
        qas.push({ question: currentQ.trim(), answer });
      }
    }
    currentQ = null;
    currentAnswer = [];
  };

  for (const line of lines) {
    // Track fenced code blocks so headings inside them are ignored.
    if (/^```/.test(line)) {
      inCodeFence = !inCodeFence;
      if (currentQ) currentAnswer.push(line);
      continue;
    }
    if (inCodeFence) {
      if (currentQ) currentAnswer.push(line);
      continue;
    }

    const h3 = line.match(/^###\s+(.+?)\s*$/);
    if (h3) {
      flush();
      currentQ = h3[1].replace(/\{#[^}]+\}\s*$/, '').trim();
      continue;
    }

    // Any H1/H2 resets the current category; flush in-progress Q&A.
    if (/^##?\s+/.test(line)) {
      flush();
      continue;
    }

    if (currentQ) {
      currentAnswer.push(line);
    }
  }
  flush();

  return qas;
}

/**
 * Convert a Docusaurus-style internal link to an absolute URL.
 *   /user-guide/concepts/data-model.md → https://docs.greptime.com/user-guide/concepts/data-model/
 * External URLs pass through unchanged.
 */
function resolveUrl(rawUrl: string, siteUrl: string): string {
  if (!rawUrl.startsWith('/')) return rawUrl;
  const stripped = rawUrl.replace(/\.mdx?$/, '').replace(/\/+$/, '');
  return `${siteUrl}${stripped}/`;
}

/**
 * Convert markdown answer body to lightly formatted text for JSON-LD.
 *
 * Google's FAQ structured data spec explicitly supports HTML in
 * acceptedAnswer.text — including <a> links, which Bing renders as
 * clickable links in SERP rich results, and AI tools can use for
 * deeper context.
 *
 * When siteUrl is provided, markdown links are converted to <a> tags
 * with absolute URLs. Other markdown syntax is stripped to plain text.
 */
export function markdownToPlainText(md: string, siteUrl?: string): string {
  return md
    // Fenced code blocks: drop entirely (too noisy for a Q&A answer).
    .replace(/```[\s\S]*?```/g, '')
    // Inline code: keep the text.
    .replace(/`([^`]+)`/g, '$1')
    // Images: keep alt text only.
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Links: convert to <a> tags if siteUrl is available, otherwise keep text only.
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
      if (siteUrl) {
        const href = resolveUrl(url, siteUrl);
        return `<a href="${href}">${text}</a>`;
      }
      return text;
    })
    // Bold / italic / strike markers.
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    // Leftover headings (defensive).
    .replace(/^#+\s+/gm, '')
    // Bullet and numbered list markers.
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Blockquote markers.
    .replace(/^\s*>\s?/gm, '')
    // Collapse whitespace.
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function buildFaqPageJsonLd(qas: QA[], siteUrl: string, pageUrl: string, locale: string): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${siteUrl}${pageUrl}#faq`,
    url: `${siteUrl}${pageUrl}`,
    inLanguage: locale === 'zh' ? 'zh-CN' : 'en',
    mainEntity: qas.map((qa) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qa.answer,
      },
    })),
  };
  return JSON.stringify(jsonLd);
}

// Each entry pairs a source markdown path (relative to versioned docs root)
// with the built HTML output path (relative to outDir). Add more here if
// additional Q&A pages are introduced later.
const FAQ_TARGETS: Array<{ srcRelPath: string; htmlRelPath: string; pageUrl: string }> = [
  {
    srcRelPath: 'faq-and-others/faq.md',
    htmlRelPath: 'faq-and-others/faq/index.html',
    pageUrl: '/faq-and-others/faq/',
  },
];

export default function faqSchema(context: LoadContext): Plugin {
  return {
    name: 'faq-schema',

    async postBuild({ outDir, siteConfig }) {
      const locale = context.i18n.currentLocale;
      const siteUrl = siteConfig.url.replace(/\/$/, '');

      const versionsPath = path.resolve(process.cwd(), 'versions.json');
      const latestVersion: string = JSON.parse(fs.readFileSync(versionsPath, 'utf-8'))[0];

      const srcRoot = locale === 'zh'
        ? path.resolve(process.cwd(), `i18n/zh/docusaurus-plugin-content-docs/version-${latestVersion}`)
        : path.resolve(process.cwd(), `versioned_docs/version-${latestVersion}`);

      for (const target of FAQ_TARGETS) {
        const srcPath = path.join(srcRoot, target.srcRelPath);
        const htmlPath = path.join(outDir, target.htmlRelPath);

        if (!fs.existsSync(srcPath)) {
          console.warn(`[faq-schema] source not found: ${srcPath}`);
          continue;
        }
        if (!fs.existsSync(htmlPath)) {
          console.warn(`[faq-schema] html target not found: ${htmlPath}`);
          continue;
        }

        const source = fs.readFileSync(srcPath, 'utf-8');
        const qas = parseFaqMarkdown(source, siteUrl);
        if (qas.length === 0) {
          throw new Error(
            `[faq-schema] parsed 0 Q&A pairs from ${target.srcRelPath}. ` +
            `The FAQ markdown format may have changed — check that questions ` +
            `use ### headings. See src/plugins/__tests__/faq-schema.test.ts ` +
            `for the expected format.`,
          );
        }

        const html = fs.readFileSync(htmlPath, 'utf-8');
        // Idempotent: skip if a FAQPage JSON-LD is already present.
        if (/"@type"\s*:\s*"FAQPage"/.test(html)) {
          console.log(`[faq-schema] already present on ${target.htmlRelPath}, skipping`);
          continue;
        }

        const jsonLd = buildFaqPageJsonLd(qas, siteUrl, target.pageUrl, locale);
        // Escape "</script>" inside JSON-LD to prevent premature script tag
        // termination if any FAQ answer happens to contain that literal.
        const safeJsonLd = jsonLd.replace(/<\//g, '<\\/');
        const scriptTag = `<script type="application/ld+json">${safeJsonLd}</script>`;
        const patched = html.replace('</head>', `${scriptTag}</head>`);
        if (patched === html) {
          console.warn(`[faq-schema] could not find </head> in ${target.htmlRelPath}`);
          continue;
        }
        fs.writeFileSync(htmlPath, patched);
        console.log(
          `[faq-schema] injected FAQPage schema with ${qas.length} Q&A pairs into ${target.htmlRelPath}`,
        );
      }
    },
  };
}
