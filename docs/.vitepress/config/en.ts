import { makeSidebar } from '../theme/serverUtils'
import { CURRENT_VERSION } from './common'

// TODO
const filePath = `en/${CURRENT_VERSION}/:file`
const groupPath = `en/${CURRENT_VERSION}/:group/:file`
const typePath = `en/${CURRENT_VERSION}/:group/:type/:file`
const namePath = `en/${CURRENT_VERSION}/:group/:type/:file/:name`

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
  rewrites: {
    [filePath]: ':file',
    [groupPath]: ':group/:file',
    [typePath]: ':group/:type/:file',
    [namePath]: ':group/:type/:file/:name',
    'en/v0.3/:v0': 'v0.3/:v0',
    'en/v0.3/:v0/:file': 'v0.3/:v0/:file',
    'en/v0.3/:v0/:group/:file': 'v0.3/:v0/:group/:file',
    'en/v0.3/:v0/:group/:type/:file': 'v0.3/:v0/:group/:type/:file',
    'en/v0.3/:v0/:group/:type/:file/:name': 'v0.3/:v0/:group/:type/:file/:name',
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
        text: 'The Version Of History',
        items: [
          {
            text: `${CURRENT_VERSION}(latest)`,
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
      '/': await makeSidebar('en', CURRENT_VERSION),
      '/v0.3/': await makeSidebar('en', 'v0.3'),
    },
  },
})
