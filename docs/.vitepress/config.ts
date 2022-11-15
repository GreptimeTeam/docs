import fs from 'fs'
import { parse } from 'yaml'
import YAML from 'js-yaml'

export default (async () => ({
  title: 'Greptime Docs',
  appearance: false,
  description: 'Greptime provides cloud-scale, fast and efficient Time Series Data Infrastructure',
  head: [
    ['script', { src: 'https://app.mailjet.com/statics/js/widget.modal.js' }],
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
    root: { label: 'English', lang: 'en-US' },
  },
  lastUpdated: true,
  ignoreDeadLinks: true,
  themeConfig: {
    siteTitle: '',
    logo: 'logo-text-tinted.png',
    locales: { root: { label: 'English' } },
    copyright: '©Copyright 2022 Greptime Inc. All Rights Reserved',
    email: 'marketing@greptime.com',
    sidebar: await makeSidebar(),
    nav: [
      {
        text: 'Getting Started',
        link: '/Getting-Started/Overview',
      },
      {
        text: 'User Guide',
        link: '/User-Guide/Concepts',
      },
      {
        text: 'Developer Guide',
        link: '/Developer-Guide/Get-Started',
      },
    ],
  },
}))()

async function makeSidebar() {
  const summary = YAML.load(fs.readFileSync('docs/summary.yml'), 'utf8')

  function makeSidebarItem(items, path) {
    if (Array.isArray(items)) {
      return items.map((item) => makeSidebarItem(item, path))
    } else if (typeof items === 'object') {
      let title = Object.keys(items)[0]
      let content = Object.values(items)[0]

      return {
        text: title.replace(/-/g, ' '),
        collapsible: true,
        items: content.map((item) => makeSidebarItem(item, `${path}/${title}`)),
      }
    } else {
      return {
        text: items.replace(/-/g, ' '),
        link: `${path}/${items}`,
      }
    }
  }

  return makeSidebarItem(summary, '')
}
