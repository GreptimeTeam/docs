import fs from 'fs'
import { parse } from 'yaml'
import YAML from 'js-yaml'

export const common = async () => ({
  title: 'Greptime Docs',
  appearance: false,
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
    root: { label: 'English', lang: 'en-US' },
  },
  lastUpdated: true,
  ignoreDeadLinks: false,
  themeConfig: {
    search: {
      provider: 'local',
    },
    siteTitle: '',
    logo: 'logo-text-tinted.png',
    copyright: '©Copyright 2022 Greptime Inc. All Rights Reserved',
    email: 'marketing@greptime.com',
    // sidebar: await makeSidebar('en'),
    editLink: {
      pattern: 'https://github.com/GreptimeTeam/docs/blob/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/GreptimeTeam/docs',
      },
    ],
    outline: [2, 4],
  },
  cleanUrls: 'without-subfolders',
})

export async function makeSidebar(lang) {
  const langPath = lang !== 'en' ? `/${lang}` : ''

  const summary = YAML.load(fs.readFileSync(`docs/summary.yml`), 'utf8')
  const summaryI18n = langPath ? YAML.load(fs.readFileSync(`docs${langPath}/summary-i18n.yml`), 'utf8') : null

  function makeSidebarItem(items, path) {
    if (Array.isArray(items)) {
      return items.map(item => makeSidebarItem(item, path))
    } else if (typeof items === 'object') {
      let title = Object.keys(items)[0]
      let content = Object.values(items)[0]

      if (summaryI18n && !summaryI18n[title]) {
        return {}
      }

      return {
        text: summaryI18n ? summaryI18n[title] : title.replace(/-/g, ' '),
        items: content.map(item => makeSidebarItem(item, `${path}/${title}`)),
        collapsed: false,
      }
    } else {
      try {
        let link = `${path}/${items}`.toLocaleLowerCase()
        let file = fs.readFileSync(`docs${langPath}${link}.md`, 'utf-8')
        return {
          text: file.split('\n')[0].replace('# ', ''),
          link,
        }
      } catch (error) {
        return {}
      }
    }
  }

  return makeSidebarItem(summary, '')
}
