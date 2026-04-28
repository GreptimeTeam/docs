import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { deriveMdUrlPath } from '../llms-txt-generator';

describe('deriveMdUrlPath', () => {
  const outDir = '/tmp/build';

  it('maps a nested index.html to its .md sibling', () => {
    const result = deriveMdUrlPath(
      path.join(outDir, 'user-guide/concepts/architecture/index.html'),
      outDir,
    );
    expect(result.urlPath).toBe('/user-guide/concepts/architecture.md');
    expect(result.absolute).toBe(path.join(outDir, 'user-guide/concepts/architecture.md'));
  });

  it('maps root index.html to /index.md', () => {
    const result = deriveMdUrlPath(path.join(outDir, 'index.html'), outDir);
    expect(result.urlPath).toBe('/index.md');
    expect(result.absolute).toBe(path.join(outDir, 'index.md'));
  });

  it('maps a single-level path correctly', () => {
    const result = deriveMdUrlPath(
      path.join(outDir, 'getting-started/index.html'),
      outDir,
    );
    expect(result.urlPath).toBe('/getting-started.md');
  });

  it('maps deeply nested paths', () => {
    const result = deriveMdUrlPath(
      path.join(outDir, 'user-guide/deployments-administration/wal/remote-wal/configuration/index.html'),
      outDir,
    );
    expect(result.urlPath).toBe('/user-guide/deployments-administration/wal/remote-wal/configuration.md');
  });
});
