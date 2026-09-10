import React, { type ReactNode } from 'react';
import { Redirect, useLocation } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';

export default function Root({ children }: { children: ReactNode }): ReactNode {
  const { pathname, search, hash } = useLocation();
  const { versions } = usePluginData('docusaurus-plugin-content-docs') as {
    versions: { name: string; isLast: boolean; docs: { path: string }[] }[];
  };
  const stable = versions.find(version => version.isLast);
  if (!stable) return children;
  const prefix = `/${stable.name}`;

  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    const targetPath = pathname.slice(prefix.length).replace(/\/$/, '') || '/';
    const target = stable.docs.find(doc =>
      (doc.path.replace(/\/$/, '') || '/') === targetPath,
    );
    if (target) {
      // Static redirect files are bypassed by same-site React Router navigation.
      return <Redirect to={{ pathname: `${targetPath.replace(/\/$/, '')}/`, search, hash }} />;
    }
  }

  return children;
}
