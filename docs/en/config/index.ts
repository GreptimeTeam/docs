import { makeSidebar } from '../../.vitepress/theme/serverUtils'
import { LATEST_VERSION } from '../../.vitepress/config/common'

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
    ['meta', { property: 'twitter:image', content: 'https://greptime.com/resource/greptime_banner.png' }],
    // Bing verify
    ['meta', { name: 'msvalidate.01', content: 'BD813946F80D5B50E162932BF3FD0D49' }],
  ],
  locales: {
    root: { label: 'English' },
  },
  themeConfig: {
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
        // TODO change version
        text: 'All Version',
        items: [
          {
            text: `${LATEST_VERSION}(latest)`,
            link: '/',
          },
          {
            text: 'v0.3',
            link: '/v0.3/',
          },
        ],
      },
    ],
    sidebar: {
      '/': await makeSidebar('en', LATEST_VERSION),
      '/v0.3/': await makeSidebar('en', 'v0.3'),
    },
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
        key: 'Reference',
        icon: 'reference',
      },
      {
        key: 'Changelog',
        icon: 'changelog',
      },
      {
        key: 'FAQ and Others',
        icon: 'FAQandOthers',
      },
    ],
  },
})
