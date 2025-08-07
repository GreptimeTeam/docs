import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import variablePlaceholder from './src/plugins/variable-placeholder';
import versions from './versions.json';

const locale = process.env.DOC_LANG || 'en';
const biel_project_id = process.env.BIEL_PROJECT_ID;

// Get the latest version (first item in versions array)
const latestVersion = versions[0];
const latestVersionNumber = parseFloat(latestVersion);

const metaMap = {
  'en': [
    { name: 'keywords', content: 'time series database, open source time series database, time series data, observability database, open source observability database, observability tools, cloud native database, data observability, observability platform, edge database, IoT edge computing, edge cloud computing, log management, log aggregation, high cardinality, sql query examples, opentelemetry collector, GreptimeDB, opentelemetry, Greptime, open source database, log storage, traces storage, metrics, rust database, OpenTelemetry database' },
    { name: 'description', content: 'GreptimeDB is a cloud-native, real-time observability database for metrics, logs, and traces. Learn how to gain fast, cost-efficient insights at any scale from edge to cloud with GreptimeDB and GreptimeCloud.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: 'https://greptime.com/resource/greptime_home_thumbnail.png' },
    { property: 'og:title', content: 'GreptimeDB Documentation | Unified observability database' },
    { property: 'og:description', content: 'Discover how GreptimeDB unifies metrics, logs, and traces with SQL and PromQL. Fast, Efficient, and Real-Time.' },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:image', content: 'https://greptime.com/resource/greptime_home_thumbnail.png' },
    { name: 'msvalidate.01', content: 'BD813946F80D5B50E162932BF3FD0D49' }
  ],
  'zh': [
    { name: 'keywords', content: '时序数据库, 开源时序数据库, 时序数据, 可观测数据，可观测数据库，可观测性工具, 云原生数据库, 数据可观测性, 可观测性平台, 边缘数据库, 物联网边缘计算, 边缘云计算, 日志管理, 日志聚合, 日志存储, 链路存储, PromQL 存储, 高基数, SQL查询示例, OpenTelemetry, OpenTelemetry 收集器, GreptimeDB, Greptime, Rust 数据库, 开源数据库, OpenTelemetry 数据库' },
    { name: 'description', content: 'GreptimeDB 是一款云原生的实时可观测数据库，统一处理指标、日志和链路追踪数据。通过 GreptimeDB 和 GreptimeCloud，您可以在从边缘到云的任意规模下，实现快速且高性价比的数据洞察。' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://docs.greptime.com/' },
    { property: 'og:image', content: 'https://greptime.com/logo/img/logo-routine-level.png' },
    { property: 'og:title', content: 'GreptimeDB 文档 | 可观测数据库' },
    { property: 'og:description', content: '了解 GreptimeDB 如何通过 SQL 和 PromQL 统一处理指标、日志和链路追踪。快速、高效、实时。' },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:url', content: 'https://greptime.com/' },
    { property: 'twitter:image', content: 'https://greptime.com/resource/greptime_home_thumbnail.png' },
    { name: 'msvalidate.01', content: 'BD813946F80D5B50E162932BF3FD0D49' }
  ]
};

const bielMetaMap = {
  'en': {
    project: biel_project_id,
    headerTitle: 'Greptime AI',
    bielButtonText: "Ask AI",
    version: 'latest',
    buttonStyle: 'dark',
    sourcesText: 'Related Documents',
    inputPlaceholderText: 'Ask a question about Greptime...',
    footerText: 'AI-generated answers may contain errors. <br> You can also communicate with engineers through <b><a href="https://github.com/orgs/GreptimeTeam/discussions">Github Discussions</a></b> or join <a href="https://greptime.com/slack">Slack community</a>.',
    welcomeMessage: 'Hi! I am Greptime AI. You can ask me questions about GreptimeDB. For example, I can help you write SQL, Pipelines, or other GreptimeDB-related code.'
  },
  'zh': {
    project: biel_project_id,
    headerTitle: 'Greptime AI',
    bielButtonText: "向 AI 提问",
    version: 'latest',
    buttonStyle: 'dark',
    sourcesText: '相关文档',
    inputPlaceholderText: '请输入和 Greptime 相关的问题...',
    footerText: 'AI 生成的答案可能包含错误。<br> 你还可以通过 <b><a href="https://github.com/orgs/GreptimeTeam/discussions">Github Discussions</a></b> 或加入 <a href="https://greptime.com/slack">Slack 社区</a>与工程师沟通。',
    welcomeMessage: '你好，我是 Greptime AI。你可以问我关于 GreptimeDB 的问题，例如我可以帮助你编写 SQL、Pipeline 或其他与 GreptimeDB 相关的代码。',
  }
};

const hostMap = {
  'en': 'https://greptime.com',
  'zh': 'https://greptime.cn'
};

const algoliaMap = {
  'en': {
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
};

const config: Config = {
  title: 'GreptimeDB Documentation',
  tagline: 'Open-source unified time-series database for Metrics, Logs, and Traces.',
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
              label: 'Nightly',
              path: 'nightly',
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
        sitemap: {
          priority: 0.8, // Default priority
          createSitemapItems: async (params) => {
            const { defaultCreateSitemapItems, ...rest } = params;
            const items = await defaultCreateSitemapItems(rest);
            
            return items.map((item) => {
              // Check for historical version patterns in URL
              const isHistoricalVersion = versions.slice(1).some(version => 
                item.url.includes(`/${version}/`)
              );
              
              if (isHistoricalVersion) {
                return {
                  ...item,
                  priority: 0.1, // Low priority for historical versions
                };
              }
              
              return {
                ...item,
                priority: 0.8, // Normal priority for current version and nightly
              };
            });
          },
        },
      } satisfies Preset.Options,
    ],
  ],
  trailingSlash: true,
  plugins: [
    ['docusaurus-biel', bielMetaMap[locale]],
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
      additionalLanguages: ['java', 'toml'],
    },
    algolia: algoliaMap[locale]
  } satisfies Preset.ThemeConfig,
};

export default config;
