import { CURRENT_VERSION, websiteMap, base } from './common'
import { getVersionList } from '../theme/serverUtils'

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
  locales: {
    root: { label: '简体中文', lang: 'zh-CN', link: '/' },
    en: { label: 'English', lang: 'en-US', link: `${websiteMap['en']}${base}` },
  },
  themeConfig: {
    notFound: {
      title: '页面不存在',
      quote: '您访问的页面不存在',
      linkText: '返回首页',
    },
    search: {
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },
    nav: [
      {
        text: '主页',
        link: 'https://greptime.cn/',
      },
      {
        text: '博客',
        link: 'https://greptime.com/blogs',
      },
      {
        text: `${CURRENT_VERSION}`,
        items: getVersionList('zh'),
      },
    ],
    iconMap: [
      {
        key: '立即开始',
        icon: 'gettingStarted',
      },
      {
        key: '用户指南',
        icon: 'docsUserGuide',
      },
      {
        key: '云服务',
        icon: 'greptimeCloud',
      },
      {
        key: '开发者指南',
        icon: 'developerGuide',
      },
      {
        key: '贡献者指南',
        icon: 'developerGuide',
      },
      {
        key: 'Reference',
        icon: 'reference',
      },
    ],
    editLink: {
      pattern: 'https://github.com/GreptimeTeam/docs/blob/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
    lastUpdatedText: '上次更新',
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    outlineTitle: '目录',
    copyright: '©2024 格睿云(北京)技术咨询有限公司',
    icp: { text: '京ICP备2023008042号', link: 'https://beian.miit.gov.cn/' },
    gongan: { text: '京公网安备 11010502052203号', link: 'https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11010502052203' },
  },
})
