import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { usePluginData } from '@docusaurus/useGlobalData';
import styles from './styles.module.css';

/**
 * `biel-bot` is a Stencil custom element defined by the biel-search bundle that
 * docusaurus-biel injects site-wide, so no extra script is needed here.
 */
type BielBotProps = {
  project: string;
  'embedded-mode'?: string;
  'header-title'?: string;
  'welcome-message'?: string;
  'input-placeholder-text'?: string;
  'sources-text'?: string;
  'footer-text'?: string;
  'suggested-questions'?: string;
  'suggested-questions-title'?: string;
};

// Augment react's own JSX namespace rather than the global one: @types/react 19
// no longer declares a global JSX, so a `declare global` block here would be
// inert and would shadow the namespace other files expect.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'biel-bot': BielBotProps;
    }
  }
}

/** Options docusaurus-biel publishes through setGlobalData. */
interface BielPluginData {
  project?: string;
  headerTitle?: string;
  inputPlaceholderText?: string;
  sourcesText?: string;
  footerText?: string;
  welcomeMessage?: string;
}

const SUGGESTED: Record<string, { title: string; questions: string[] }> = {
  en: {
    title: 'Try asking',
    questions: [
      'How do I migrate from Prometheus?',
      'Write a pipeline that parses Nginx access logs',
      'When should I use Flow instead of a query?',
      'How do I deploy a cluster on Kubernetes?',
    ],
  },
  zh: {
    title: '可以这样问',
    questions: [
      '如何从 Prometheus 迁移到 GreptimeDB？',
      '写一个解析 Nginx 访问日志的 Pipeline',
      '什么时候该用 Flow，什么时候直接查询？',
      '如何在 Kubernetes 上部署集群？',
    ],
  },
};

export default function AskAI(): JSX.Element | null {
  const { i18n } = useDocusaurusContext();
  // docusaurus-biel is only registered when BIEL_PROJECT_ID is set, so builds
  // without it render nothing instead of an empty panel.
  const biel = usePluginData('docusaurus-biel-plugin') as BielPluginData | undefined;
  const project = biel?.project;

  if (!project) {
    return null;
  }

  const suggested = SUGGESTED[i18n.currentLocale] ?? SUGGESTED.en;

  return (
    <div className={styles.panel} data-ask-ai-embedded>
      <biel-bot
        project={project}
        embedded-mode="true"
        header-title={biel.headerTitle}
        welcome-message={biel.welcomeMessage}
        input-placeholder-text={biel.inputPlaceholderText}
        sources-text={biel.sourcesText}
        footer-text={biel.footerText}
        suggested-questions={JSON.stringify(suggested.questions)}
        suggested-questions-title={suggested.title}
      />
    </div>
  );
}
