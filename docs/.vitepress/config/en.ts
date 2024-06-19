import { CURRENT_VERSION, websiteMap, base } from './common'
import { getVersionList } from '../theme/serverUtils'

export const enConfig = async () => ({
  title: 'Greptime Docs',
  description: 'Greptime provides cloud-scale, fast and efficient Time Series Data Infrastructure',
  head: [
    ['script', { src: 'https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/icons_19361_2.c3035490ebb16aa315f724f1eccdddde.js' }],
    ['link', { rel: 'stylesheet', href: '//at.alicdn.com/t/c/font_3652459_85jeka7sbox.css' }],
    // SEO part
    // Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://docs.greptime.com/' }],
    ['meta', { property: 'og:title', content: 'Cloud-scale, Fast and Efficient Time Series Data Infrastructure' }],
    ['meta', { property: 'og:description', content: 'Greptime provides cloud-scale, fast and efficient Time Series Data Infrastructure' }],
    // Twitter
    ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'twitter:url', content: 'https://greptime.com/' }],
    ['meta', { property: 'twitter:title', content: 'Cloud-scale, Fast and Efficient Time Series Data Infrastructure' }],
    ['meta', { property: 'twitter:description', content: 'Greptime provides cloud-scale, fast and efficient Time Series Data Infrastructure' }],
    ['meta', { property: 'twitter:image', content: 'https://greptime.com/resource/greptime_home_thumbnail.png' }],
    // Bing verify
    ['meta', { name: 'msvalidate.01', content: 'BD813946F80D5B50E162932BF3FD0D49' }],
    ['meta', { name: 'docsearch:language', content: 'en-US'}],
    ['meta', { name: 'docsearch:version', content: CURRENT_VERSION}]
  ],
  locales: {
    root: { label: 'English', lang: 'en-US', link: '/' },
    zh: { label: '简体中文', lang: 'zh-CN', link: `${websiteMap['zh']}${base}` },
  },
  themeConfig: {
    search: {
      options: {
        appId: 'SRGB68Y6CW',
        apiKey: 'eacb3d367f08bb200e8dbfc2470984d8',
        indexName: 'greptime',
        searchParameters: {
          facetFilters: [`version:${CURRENT_VERSION}`],
        },
        maxResultsPerGroup: 7,
      },
    },
    notFound: {
      quote: 'Unfortunately, the content you are looking for is not found.',
      linkText: 'Take me to homepage',
    },
    nav: [
      {
        text: 'Home',
        link: 'https://greptime.com/',
      },
      {
        text: 'Blogs',
        link: 'https://greptime.com/blogs',
      },
      {
        text: `${CURRENT_VERSION}`,
        items: getVersionList('en'),
      },
    ],
    iconMap: [
      {
        key: 'Getting Started',
        icon: 'gettingStarted',
      },
      {
        key: 'User Guide',
        icon: 'docsUserGuide',
      },
      {
        key: 'GreptimeCloud',
        icon: 'greptimeCloud',
      },
      {
        key: 'Developer Guide',
        icon: 'developerGuide',
      },
      {
        key: 'Contributor Guide',
        icon: 'developerGuide',
      },
      {
        key: 'Reference',
        icon: 'reference',
      },
      {
        key: 'Changelog',
        icon: 'changelog',
      },
      {
        key: 'Release Notes',
        icon: 'changelog',
      },
      {
        key: 'FAQ and Others',
        icon: 'FAQandOthers',
      },
    ],
    copyright: '©Copyright 2024 Greptime Inc. All Rights Reserved',
  },
  sitemap: {
    hostname: 'https://docs.greptime.com'
  }
})
