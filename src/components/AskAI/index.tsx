import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { usePluginData } from '@docusaurus/useGlobalData';
import styles from './styles.module.css';

/**
 * `biel-bot` is a Stencil custom element defined by the biel-search bundle that
 * docusaurus-biel injects site-wide, so no extra script is needed here.
 */
type BielBotElement = HTMLElement & {
  hideExpandButton?: boolean;
  componentOnReady?: () => Promise<unknown>;
};

type BielBotProps = {
  ref?: React.Ref<BielBotElement>;
  project: string;
  'embedded-mode'?: string;
  'header-title'?: string;
  'welcome-message'?: string;
  'input-placeholder-text'?: string;
  'sources-text'?: string;
  'footer-text'?: string;
  'suggested-questions'?: string;
  'suggested-questions-title'?: string;
  'expand-button-text'?: string;
  'collapse-button-text'?: string;
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
  expandButtonText?: string;
  collapseButtonText?: string;
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

export default function AskAI(): React.JSX.Element | null {
  const { i18n } = useDocusaurusContext();
  // docusaurus-biel is only registered when BIEL_PROJECT_ID is set, so builds
  // without it render nothing instead of an empty panel.
  const biel = usePluginData('docusaurus-biel-plugin') as BielPluginData | undefined;
  const project = biel?.project;

  const botRef = useRef<BielBotElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number>();

  // Embedded mode hides the header's expand button in componentWillLoad, so the
  // property can only be restored once the element has finished its first render.
  useEffect(() => {
    const bot = botRef.current;
    if (!bot) {
      return;
    }
    let cancelled = false;
    customElements
      .whenDefined('biel-bot')
      .then(() => bot.componentOnReady?.())
      .then(() => {
        if (!cancelled) {
          bot.hideExpandButton = false;
        }
      });
    return () => {
      cancelled = true;
    };
  }, [project]);

  // The button lives in biel's shadow DOM and its event bubbles to <body>, where
  // biel-bot would apply a fullscreen layout that embedded mode never styles for.
  // Stop the event at the panel and resize the panel itself instead.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }
    const onFullscreenClicked = (event: Event) => {
      event.stopPropagation();
      if (!expanded) {
        setCollapsedHeight(panel.offsetHeight);
      }
      setExpanded(!expanded);
    };
    panel.addEventListener('fullscreenClicked', onFullscreenClicked);
    return () => panel.removeEventListener('fullscreenClicked', onFullscreenClicked);
  }, [expanded, project]);

  // Route every collapse through biel's own button so its icon and tooltip keep
  // matching the panel state.
  const collapse = useCallback(() => {
    const header = botRef.current?.shadowRoot?.querySelector('biel-header');
    const button = header?.shadowRoot
      ?.querySelector<SVGElement>('.lucide-minimize-2')
      ?.closest('button');
    if (button) {
      button.click();
    } else {
      setExpanded(false);
    }
  }, []);

  useEffect(() => {
    if (!expanded) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        collapse();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded, collapse]);

  if (!project) {
    return null;
  }

  const suggested = SUGGESTED[i18n.currentLocale] ?? SUGGESTED.en;

  return (
    <div className={styles.slot} style={expanded ? { height: collapsedHeight } : undefined}>
      {expanded && <div className={styles.backdrop} onClick={collapse} />}
      <div
        ref={panelRef}
        className={clsx(styles.panel, expanded && styles.expanded)}
        data-ask-ai-embedded
        role={expanded ? 'dialog' : undefined}
        aria-modal={expanded ? true : undefined}
        aria-label={expanded ? biel?.headerTitle : undefined}
      >
        <biel-bot
          ref={botRef}
          project={project}
          embedded-mode="true"
          header-title={biel?.headerTitle}
          welcome-message={biel?.welcomeMessage}
          input-placeholder-text={biel?.inputPlaceholderText}
          sources-text={biel?.sourcesText}
          footer-text={biel?.footerText}
          suggested-questions={JSON.stringify(suggested.questions)}
          suggested-questions-title={suggested.title}
          expand-button-text={biel?.expandButtonText}
          collapse-button-text={biel?.collapseButtonText}
        />
      </div>
    </div>
  );
}
