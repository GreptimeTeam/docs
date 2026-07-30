import React from 'react';
// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
import AnchorAlias from '@site/src/components/AnchorAlias';
import InjectContent from '@site/src/components/InjectContent';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

export default {
  // Re-use the default mapping
  ...MDXComponents,
  // Map the "<Highlight>" tag to our Highlight component
  // `Highlight` will receive all props that were passed to `<Highlight>` in MDX
  AnchorAlias,
  InjectContent,
  Tabs,
  TabItem,
};
