import dotenv from 'dotenv'
import { getSrcExclude, makeSidebar } from '../theme/serverUtils'

const { ENV, VERSION, LATEST_VERSION, VERSION_MAP, WEBSITE_MAP, BASE: base = '/' } = process.env
const CURRENT_LANG = dotenv.config().parsed?.VITE_LANG || 'en'

const CURRENT_VERSION = VERSION || LATEST_VERSION
const versionPath = `:version/${CURRENT_LANG}/:path+`
const versionMap = JSON.parse(VERSION_MAP)
const websiteMap = JSON.parse(WEBSITE_MAP)
const langMap = ['en', 'zh']

const common = async () => {
  return {
    base,
    outDir: `./.vitepress/dist${base}`,
    srcExclude: getSrcExclude(versionMap, CURRENT_LANG, langMap),
    appearance: false,
    lastUpdated: true,
    ignoreDeadLinks: false,
    head: [['script', { src: 'https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/icons_19361_134.ede7dfbb02f3e5cba425f4d574d089ba.js' }]],
    markdown: {
      theme: { light: 'material-theme-darker', dark: 'material-theme-darker' },
    },
    rewrites: {
      [versionPath]: `:path+`,
    },
    locales: {},
    themeConfig: {
      latestVersion: LATEST_VERSION,
      search: {
        provider: 'local',
      },
      siteTitle: '',
      sidebar: {
        '/': await makeSidebar(CURRENT_LANG, CURRENT_VERSION),
      },
      logo: '/logo-text-tinted.png',
      copyright: '©Copyright 2022 Greptime Inc. All Rights Reserved',
      email: 'marketing@greptime.com',
      editLink: {
        pattern: 'https://github.com/GreptimeTeam/docs/blob/main/docs/:path',
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
    async transformHead(context) {
      return [
        ['meta', { property: 'og:title', content: 'Text For Meta In Docs' }],
        ['meta', { property: 'og:description', content: 'If it successfully, we can start next!' }],
      ]
    },
  }
}

export { ENV, CURRENT_LANG, LATEST_VERSION, CURRENT_VERSION, versionMap, websiteMap, versionPath, base, common }
