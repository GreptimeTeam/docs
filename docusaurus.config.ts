import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import variablePlaceholder from './src/plugins/variable-placeholder'
const locale = process.env.DOC_LANG || 'en'

const metaMap = {
  'en': [
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://docs.greptime.com/' },
    { property: 'og:title', content: 'Cloud-scale, Fast and Efficient Time Series Data Infrastructure' },
    { property: 'og:description', content: 'Greptime provides cloud-scale, fast and efficient Time Series Data Infrastructure' },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:url', content: 'https://greptime.com/' },
    { property: 'twitter:title', content: 'Cloud-scale, Fast and Efficient Time Series Data Infrastructure' },
    { property: 'twitter:description', content: 'Greptime provides cloud-scale, fast and efficient Time Series Data Infrastructure' },
    { property: 'twitter:image', content: 'https://greptime.com/resource/greptime_home_thumbnail.png' },
    { name: 'msvalidate.01', content: 'BD813946F80D5B50E162932BF3FD0D49' }

  ],
  'zh': [
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://docs.greptime.cn/' },
    { property: 'og:title', content: '分布式、云原生、融合时序和分析为一体的时序数据实时处理平台' },
    { property: 'og:description', content: 'Greptime: 分布式、云原生、融合时序和分析为一体的时序数据实时处理平台' },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:url', content: 'https://greptime.com/' },
    { property: 'twitter:title', content: '分布式、云原生、融合时序和分析为一体的时序数据实时处理平台' },
    { property: 'twitter:description', content: 'Greptime: 分布式、云原生、融合时序和分析为一体的时序数据实时处理平台' },
    { property: 'twitter:image', content: 'https://greptime.com/resource/greptime_home_thumbnail.png' },
    { name: 'msvalidate.01', content: 'BD813946F80D5B50E162932BF3FD0D49' }
  ]
}


const hostMap = {
  'en': 'https://greptime.com',
  'zh': 'https://greptime.cn'
}

const algoliaMap = {
  'en':  {
      // The application ID provided by Algolia
      appId: 'SRGB68Y6CW',

      // Public API key: it is safe to commit it
      apiKey: 'eacb3d367f08bb200e8dbfc2470984d8',

      indexName: 'greptime',

      // Optional: see doc section below
      contextualSearch: true,

      // Optional: Algolia search parameters
      searchParameters: {},

      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',

      // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
      insights: false,
    },
    'zh': {
      // The application ID provided by Algolia
      appId: 'SCVT6GSUZV',

      // Public API key: it is safe to commit it
      apiKey: '450bf5e5a3c1ecd3c4154530e25678c5',

      indexName: 'greptime',

      // Optional: see doc section below
      contextualSearch: true,

      // Optional: Algolia search parameters
      searchParameters: {},

      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',

      // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
      insights: false,
    }
}

const config: Config = {
  title: 'GreptimeDB',
  tagline: 'Dinosaurs are cool',
  favicon: '/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.greptime.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'greptime', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  onBrokenAnchors: "ignore",
  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: locale,
    locales: ['en', 'zh'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/GreptimeTeam/docs/blob/main',
          routeBasePath: '/',
          exclude: [
            'db-cloud-shared/**',
            'user-guide/client-libraries/template.md',
            'getting-started/quick-start/quick-start-template.md',
            '**/template.md',
            'user-guide/python-scripts/**',
            'user-guide/ingest-data/for-iot/grpc-sdks/template.md'
          ],
          versions: {
            current: {
              label: 'nightly',
              path: 'nightly',
            },
            '0.8': {
              path: 'v0.8'
            },
            '0.7': {
              path: 'v0.7'
            },
            '0.6': {
              path: 'v0.6'
            }
          },
          remarkPlugins: [
            [variablePlaceholder, {}]
          ]
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/GreptimeTeam/blog/',
          routeBasePath: 'release-notes',
          blogSidebarCount: 'ALL',
          blogSidebarTitle: 'Release Notes'
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-BYNN8J57JZ',
          anonymizeIP: false,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card

    metadata: metaMap[locale],
    navbar: {
      title: 'GreptimeDB',
      logo: {
        alt: 'GreptimeDB Logo',
        src: 'img/logo-routine.svg',
      },
      items: [
        {
          to: hostMap[locale],
          position: 'left',
          label: 'Home',
        },
        {to: hostMap[locale] + '/blogs/', label: 'Blogs', position: 'left'},
        {
          type: 'docsVersionDropdown',
          position: 'right'
        },
        {
          type: 'localeDropdown',
          position: 'right'
        },
        {
          href: 'https://github.com/GreptimeTeam/docs/',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `©Copyright ${new Date().getFullYear()} Greptime Inc.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java'],
    },
    algolia: algoliaMap[locale]
   //,
  } satisfies Preset.ThemeConfig,
};

export default config;
