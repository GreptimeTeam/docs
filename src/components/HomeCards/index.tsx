import React from 'react';
import styles from './styles.module.css';

/**
 * Renders a markdown link list as a card grid.
 *
 * Interaction matches @theme/DocCard (whole-card hit target, hover chrome);
 * visual weight is tuned for homepage entry points, not category indexes.
 * Links stay in MDX for version-aware `.md` resolution, broken-link checking,
 * and plain-list agent / llms.txt output.
 */
export default function HomeCards({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <div className={styles.cards}>{children}</div>;
}
