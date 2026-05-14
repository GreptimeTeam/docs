import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import copy from 'copy-text-to-clipboard';
import styles from './styles.module.css';

interface Props {
  label?: string;
  url?: string;
  prompt?: string;
}

const DEFAULT_LABEL = 'AGENT ONBOARDING';
const DEFAULT_URL_EN = 'https://docs.greptime.com/SKILL.md';
const DEFAULT_URL_ZH = 'https://docs.greptime.cn/SKILL.md';

function defaultPrompt(url: string, locale: string): string {
  if (locale === 'zh') {
    return `阅读 ${url} 并按其中的指引为你的 AI Agent 安装并配置 GreptimeDB。`;
  }
  return `Read ${url} and follow the instructions to install and configure GreptimeDB for your AI agent.`;
}

export default function AgentOnboarding({ label, url, prompt }: Props): JSX.Element {
  const { i18n } = useDocusaurusContext();
  const resolvedUrl = url ?? (i18n.currentLocale === 'zh' ? DEFAULT_URL_ZH : DEFAULT_URL_EN);
  const resolvedLabel = label ?? DEFAULT_LABEL;
  const resolvedPrompt = prompt ?? defaultPrompt(resolvedUrl, i18n.currentLocale);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (copy(resolvedPrompt)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const [before, ...rest] = resolvedPrompt.split(resolvedUrl);
  const after = rest.join(resolvedUrl);

  return (
    <aside className={styles.card} aria-label={resolvedLabel}>
      <div className={styles.label}>{resolvedLabel}</div>
      <div className={styles.row}>
        <p className={styles.prompt}>
          {before}
          <a href={resolvedUrl} className={styles.link} target="_blank" rel="noreferrer">
            {resolvedUrl}
          </a>
          {after}
        </p>
        <button
          type="button"
          className={styles.copyButton}
          onClick={handleCopy}
          aria-label="Copy prompt to clipboard"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </aside>
  );
}
