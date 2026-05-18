// Shared single source of truth for the agent onboarding prompt. Consumed by:
//   - src/components/AgentOnboarding/index.tsx (rendered in docs as a card)
//   - src/plugins/llms-txt-generator.ts (rendered as plain markdown in the
//     generated .md / llms-full.txt agent-facing endpoints)
//
// Keep this file dependency-free (no React, no Docusaurus imports) so both
// the browser-bundled component and the Node-side plugin can import it.

export const ONBOARDING_URL = {
  en: 'https://docs.greptime.com/SKILL.md',
  zh: 'https://docs.greptime.cn/SKILL.md',
} as const;

interface OnboardingLabels {
  label: string;
  copy: string;
  copied: string;
  copyAriaLabel: string;
}

const LABELS: Record<'en' | 'zh', OnboardingLabels> = {
  en: {
    label: 'AGENT ONBOARDING',
    copy: 'Copy',
    copied: 'Copied',
    copyAriaLabel: 'Copy prompt to clipboard',
  },
  zh: {
    label: 'AGENT 接入',
    copy: '复制',
    copied: '已复制',
    copyAriaLabel: '复制提示词到剪贴板',
  },
};

export function onboardingLabels(locale: string): OnboardingLabels {
  return locale === 'zh' ? LABELS.zh : LABELS.en;
}

export function onboardingPrompt(locale: string): { url: string; text: string } {
  const url = locale === 'zh' ? ONBOARDING_URL.zh : ONBOARDING_URL.en;
  const text = locale === 'zh'
    ? `阅读 ${url} 并按其中的指引在你的 AI Agent 中使用 GreptimeDB（部署、配置、写入、查询）。`
    : `Read ${url} and follow the instructions to use GreptimeDB with your AI agent — deploy, configure, ingest, and query.`;
  return { url, text };
}
