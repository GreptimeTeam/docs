import React from 'react';
import styles from './styles.module.css';

/**
 * Renders a markdown link list as a card grid.
 *
 * The links stay in MDX rather than moving into this component so they keep
 * Docusaurus's version-aware `.md` resolution and broken-link checking, and so
 * the agent-facing `.md` and llms.txt output still contains a plain list.
 */
export default function HomeCards({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <div className={styles.cards}>{children}</div>;
}
