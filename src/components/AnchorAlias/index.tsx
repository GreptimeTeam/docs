import React from 'react';
import useBrokenLinks from '@docusaurus/useBrokenLinks';

type AnchorAliasProps = {
  id: string;
};

export default function AnchorAlias({id}: AnchorAliasProps) {
  useBrokenLinks().collectAnchor(id);

  return <span id={id} aria-hidden="true" />;
}
