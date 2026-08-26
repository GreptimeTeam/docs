import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { resolveLastVersion } from '../site-versions';

let rootDir: string;

function writeVariables(version: string, greptimedbVersion: string): void {
  fs.writeFileSync(
    path.join(rootDir, 'variables', `variables-${version}.ts`),
    `export const variables = {\n  greptimedbVersion: '${greptimedbVersion}',\n};\n`,
  );
}

beforeEach(() => {
  rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'site-versions-'));
  fs.mkdirSync(path.join(rootDir, 'variables'));
});

afterEach(() => {
  fs.rmSync(rootDir, { recursive: true, force: true });
});

describe('resolveLastVersion', () => {
  it('picks the newest version when it is GA', () => {
    writeVariables('1.2', 'v1.2.0');
    writeVariables('1.1', 'v1.1.4');
    expect(resolveLastVersion(['1.2', '1.1'], rootDir)).toBe('1.2');
  });

  it('skips a pre-release version', () => {
    writeVariables('1.2', 'v1.2.0-beta.1');
    writeVariables('1.1', 'v1.1.4');
    expect(resolveLastVersion(['1.2', '1.1'], rootDir)).toBe('1.1');
  });

  it('recognizes alpha, rc and nightly as pre-releases', () => {
    writeVariables('1.4', 'v1.4.0-nightly-20260706');
    writeVariables('1.3', 'v1.3.0-rc.2');
    writeVariables('1.2', 'v1.2.0-alpha');
    writeVariables('1.1', 'v1.1.4');
    expect(resolveLastVersion(['1.4', '1.3', '1.2', '1.1'], rootDir)).toBe('1.1');
  });

  it('skips versions without a variables file', () => {
    writeVariables('1.1', 'v1.1.4');
    expect(resolveLastVersion(['1.2', '1.1'], rootDir)).toBe('1.1');
  });

  it('falls back to the newest version when none is GA', () => {
    writeVariables('1.2', 'v1.2.0-beta.1');
    writeVariables('1.1', 'v1.1.0-rc.1');
    expect(resolveLastVersion(['1.2', '1.1'], rootDir)).toBe('1.2');
  });
});
