import { describe, it, expect } from 'vitest';
import * as path from 'path';
import {
  AGENT_ONBOARDING_RE,
  DOC_CARD_LIST_RE,
  deriveMdUrlPath,
} from '../llms-txt-generator';

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

describe('MDX tag regexes', () => {
  // The exported regexes carry the /g flag and therefore have a stateful
  // `lastIndex`. Recreate per test so `.test()` calls do not interfere.
  const docCardListRe = () => new RegExp(DOC_CARD_LIST_RE.source, 'g');
  const agentOnboardingRe = () => new RegExp(AGENT_ONBOARDING_RE.source, 'g');

  it.each([
    ['self-closing', '<DocCardList />'],
    ['self-closing no space', '<DocCardList/>'],
    ['with props', '<DocCardList items={links} className="x" />'],
    ['paired', '<DocCardList>\n  inner\n</DocCardList>'],
  ])('DOC_CARD_LIST_RE matches %s form', (_label, input) => {
    expect(docCardListRe().test(input)).toBe(true);
  });

  it.each([
    ['self-closing', '<AgentOnboarding />'],
    ['with props', '<AgentOnboarding label="Hi" url="https://example.com/x.md" />'],
    ['paired', '<AgentOnboarding>kid</AgentOnboarding>'],
  ])('AGENT_ONBOARDING_RE matches %s form', (_label, input) => {
    expect(agentOnboardingRe().test(input)).toBe(true);
  });

  it('regexes do not match similarly-prefixed tags', () => {
    expect(docCardListRe().test('<DocCardListItem />')).toBe(false);
    expect(agentOnboardingRe().test('<AgentOnboardingExtra />')).toBe(false);
  });

  it('regexes leave surrounding whitespace untouched on replace', () => {
    const before = 'text\n\n<DocCardList />\n\nmore text';
    expect(before.replace(docCardListRe(), 'LIST')).toBe('text\n\nLIST\n\nmore text');
    const before2 = 'a\n\n<AgentOnboarding />\n\nb';
    expect(before2.replace(agentOnboardingRe(), 'X')).toBe('a\n\nX\n\nb');
  });
});
