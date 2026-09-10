import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { location, versions, redirect } = vi.hoisted(() => ({
  location: { pathname: '/', search: '', hash: '' },
  versions: [
    { name: 'current', isLast: false, docs: [{ path: '/nightly/' }] },
    { name: '1.2', isLast: true, docs: [{ path: '/' }, { path: '/user-guide/overview' }] },
    { name: '1.1', isLast: false, docs: [{ path: '/1.1/' }] },
  ],
  redirect: vi.fn<(props: unknown) => null>(() => null),
}));

vi.mock('@docusaurus/router', () => ({
  useLocation: () => location,
  Redirect: redirect,
}));
vi.mock('@docusaurus/useGlobalData', () => ({
  usePluginData: () => ({ versions }),
}));

import Root from '../index';

const render = () => renderToStaticMarkup(
  React.createElement(Root, { children: 'Original route' }),
);

beforeEach(() => {
  Object.assign(location, { pathname: '/', search: '', hash: '' });
  versions[1].name = '1.2';
  redirect.mockClear();
});

describe('stable alias navigation', () => {
  it.each(['/1.2/user-guide/overview', '/1.2/user-guide/overview/'])(
    'redirects %s before rendering the original route and preserves query/hash',
    pathname => {
      Object.assign(location, { pathname, search: '?source=search', hash: '#overview' });
      expect(render()).toBe('');
      expect(redirect.mock.calls[0][0]).toEqual({
        to: { pathname: '/user-guide/overview/', search: '?source=search', hash: '#overview' },
      });
    },
  );

  it.each(['/1.2', '/1.2/'])('redirects the version root %s', pathname => {
    location.pathname = pathname;
    render();
    expect(redirect.mock.calls[0][0]).toEqual({ to: { pathname: '/', search: '', hash: '' } });
  });

  it.each([
    '/user-guide/overview/', '/1.1/', '/nightly/', '/1.20/',
    '/1.2/missing/', '/1.2/nightly/', '/1.2/1.1/', '/1.2/search/',
  ])('leaves %s to the normal router', pathname => {
    location.pathname = pathname;
    expect(render()).toBe('Original route');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('follows stable promotion without keeping the previous alias', () => {
    versions[1].name = '1.3';
    location.pathname = '/1.3/user-guide/overview/';
    expect(render()).toBe('');
    redirect.mockClear();
    location.pathname = '/1.2/user-guide/overview/';
    expect(render()).toBe('Original route');
    expect(redirect).not.toHaveBeenCalled();
  });
});
