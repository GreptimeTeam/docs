import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { injectNoindex } from '../version-noindex';

let dir: string;

function writePage(name: string, head: string): string {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, `<html><head>${head}</head><body></body></html>`);
  return filePath;
}

function robotsTagCount(filePath: string): number {
  return fs.readFileSync(filePath, 'utf-8').split(/<meta[^>]+name=["']robots["']/i).length - 1;
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'version-noindex-'));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('injectNoindex', () => {
  it('injects into a page without a robots directive', () => {
    const filePath = writePage('plain.html', '<title>t</title>');
    expect(injectNoindex(filePath)).toBe(true);
    expect(robotsTagCount(filePath)).toBe(1);
  });

  it('leaves a Docusaurus unlisted directive as the only one', () => {
    // Docusaurus puts data-rh before name, which a `<meta name=` match misses.
    const filePath = writePage(
      'unlisted.html',
      '<meta data-rh="true" name="robots" content="noindex, nofollow">',
    );
    expect(injectNoindex(filePath)).toBe(false);
    expect(robotsTagCount(filePath)).toBe(1);
  });

  it('is idempotent across repeated runs', () => {
    const filePath = writePage('plain.html', '<title>t</title>');
    injectNoindex(filePath);
    expect(injectNoindex(filePath)).toBe(false);
    expect(robotsTagCount(filePath)).toBe(1);
  });

  it('leaves a page without a head untouched', () => {
    const filePath = path.join(dir, 'broken.html');
    fs.writeFileSync(filePath, '<html><body></body></html>');
    expect(injectNoindex(filePath)).toBe(false);
    expect(robotsTagCount(filePath)).toBe(0);
  });
});
