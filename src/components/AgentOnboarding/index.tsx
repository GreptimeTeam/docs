import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import copy from 'copy-text-to-clipboard';
import { onboardingLabels, onboardingPrompt } from './prompt';
import styles from './styles.module.css';

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

interface Props {
  label?: string;
  url?: string;
  prompt?: string;
}

export default function AgentOnboarding({ label, url, prompt }: Props): JSX.Element {
  const { i18n } = useDocusaurusContext();
  const fallback = onboardingPrompt(i18n.currentLocale);
  const labels = onboardingLabels(i18n.currentLocale);
  const resolvedUrl = url ?? fallback.url;
  const resolvedLabel = label ?? labels.label;
  const resolvedPrompt = prompt ?? fallback.text;

  const [copied, setCopied] = useState(false);

  const trackEvent = (eventName: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, { locale: i18n.currentLocale });
    }
  };

  const handleCopy = () => {
    if (copy(resolvedPrompt)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      trackEvent('agent_onboarding_copy');
    }
  };

  const handleLinkClick = () => {
    trackEvent('agent_onboarding_link_click');
  };

  const promptParts = resolvedPrompt.split(resolvedUrl);
  const promptContainsUrl = promptParts.length > 1;

  return (
    <aside className={styles.card} aria-label={resolvedLabel}>
      <div className={styles.label}>{resolvedLabel}</div>
      <div className={styles.row}>
        <p className={styles.prompt}>
          {promptContainsUrl ? (
            <>
              {promptParts[0]}
              <a
                href={resolvedUrl}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
              >
                {resolvedUrl}
              </a>
              {promptParts.slice(1).join(resolvedUrl)}
            </>
          ) : (
            resolvedPrompt
          )}
        </p>
        <button
          type="button"
          className={styles.copyButton}
          onClick={handleCopy}
          aria-label={labels.copyAriaLabel}
        >
          {copied ? labels.copied : labels.copy}
        </button>
      </div>
    </aside>
  );
}
