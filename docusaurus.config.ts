import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import variablePlaceholder from './src/plugins/variable-placeholder'
const locale = process.env.DOC_LANG || 'en'

const metaMap = {
  'en': [
    { name: 'keywords', content: 'time series database, open source time series database, time series data, observability tools, cloud native database, data observability, observability platform, edge database, IoT edge computing, edge cloud computing, log management, log aggregation, high cardinality, sql query examples, opentelemetry collector, GreptimeDB' },
    { name: 'description', content: 'GreptimeDB is an open-source unified time-series database for Metrics, Logs, Events, and Traces. Learn how to gain real-time insights from edge to cloud at any scale with GreptimeDB and GreptimeCloud.' },
    { property: 'og:type', content: 'website' },
   
    { property: 'og:image', content: 'https://greptime.com/resource/greptime_home_thumbnail.png' },
    { property: 'og:title', content: 'GreptimeDB Documentation | Unified Time-Series Database' },
    { property: 'og:description', content: 'Discover how GreptimeDB unifies metrics, logs, events, and traces with SQL and PromQL. Real-time insights, high scalability, and cloud-native flexibility.' },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:image', content: 'https://greptime.com/resource/greptime_home_thumbnail.png' },
    { name: 'msvalidate.01', content: 'BD813946F80D5B50E162932BF3FD0D49' }
  ],
  'zh': [
    { name: 'keywords', content: '时序数据库, 开源时序数据库, 时序数据, 可观测性工具, 云原生数据库, 数据可观测性, 可观测性平台, 边缘数据库, 物联网边缘计算, 边缘云计算, 日志管理, 日志聚合, 高基数, SQL查询示例, OpenTelemetry 收集器, GreptimeDB' },
    { name: 'description', content: 'GreptimeDB 是一个开源的统一时序数据库，用于处理指标、日志、事件和追踪。了解如何使用 GreptimeDB 和 GreptimeCloud 从边缘到云端在任何规模上获得实时洞察。' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://docs.greptime.com/' },
    { property: 'og:image', content: 'https://greptime.com/logo/img/logo-routine-level.png' },
    { property: 'og:title', content: 'GreptimeDB 文档 | 统一时序数据库' },
    { property: 'og:description', content: '了解 GreptimeDB 如何通过 SQL 和 PromQL 统一指标、日志、事件和追踪。实时洞察，高可扩展性和云原生灵活性。' },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:url', content: 'https://greptime.com/' },
    { property: 'twitter:title', content: 'GreptimeDB 文档 | 统一时序数据库' },
    { property: 'twitter:description', content: '探索 GreptimeDB，这个开源的时序数据库，用于处理指标、日志、事件和追踪。无缝扩展，实时洞察和可观测性工作流。' },
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
  title: 'GreptimeDB Documentation | Unified Time-Series Database',
  tagline: 'Open-source unified time-series database for Metrics, Logs, Events, and Traces.',
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
            'user-guide/ingest-data/for-iot/grpc-sdks/template.md',
            'contributor-guide/datanode/python-scripts.md',
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
