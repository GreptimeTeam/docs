import { makeSidebar } from '../../.vitepress/config/common'

export const zhConfig = async () => ({
  title: 'Greptime 文档',
  description: 'Greptime: 分布式、云原生、融合时序和分析为一体的时序数据实时处理平台',
  head: [
    ['script', { src: 'https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/icons_19361_2.c3035490ebb16aa315f724f1eccdddde.js' }],
    ['link', { rel: 'stylesheet', href: '//at.alicdn.com/t/c/font_3652459_85jeka7sbox.css' }],
    // SEO part
    // Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://docs.greptime.cn/' }],
    ['meta', { property: 'og:title', content: '分布式、云原生、融合时序和分析为一体的时序数据实时处理平台' }],
    ['meta', { property: 'og:description', content: 'Greptime: 分布式、云原生、融合时序和分析为一体的时序数据实时处理平台' }],
    // Twitter
    ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'twitter:url', content: 'https://greptime.com/' }],
    ['meta', { property: 'twitter:title', content: '分布式、云原生、融合时序和分析为一体的时序数据实时处理平台' }],
    ['meta', { property: 'twitter:description', content: 'Greptime: 分布式、云原生、融合时序和分析为一体的时序数据实时处理平台' }],
    ['meta', { property: 'twitter:image', content: 'https://greptime.com/resource/greptime_banner.png' }],
    // Bing verify
    ['meta', { name: 'msvalidate.01', content: 'BD813946F80D5B50E162932BF3FD0D49' }],
  ],
  rewrites: {
    'zh/:file': ':file',
    'zh/:group/:file': ':group/:file',
    'zh/:group/:type/:file': ':group/:type/:file',
  },
  locales: {
    root: { label: '简体中文' },
  },
  themeConfig: {
    nav: [
      {
        text: '主页',
        link: 'https://greptime.cn/',
      },
      {
        text: '博客',
        link: 'https://greptime.com/blogs',
      },
    ],
    sidebar: await makeSidebar('zh'),
    editLink: {
      pattern: 'https://github.com/GreptimeTeam/docs/blob/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/GreptimeTeam/docs',
      },
    ],
    lastUpdatedText: '上次更新',
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    outlineTitle: '目录',
  },
})
