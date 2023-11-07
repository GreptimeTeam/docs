import dotenv from 'dotenv'
import rollupOptions from './rollupOptions'

const { VERSION } = process.env

export const CURRENT_LANG = dotenv.config().parsed?.VITE_LANG || 'en'
export const LATEST_VERSION = 'v0.4'
export const CURRENT_VERSION = VERSION || LATEST_VERSION

const versionPath = `:version/${CURRENT_LANG}/:path+`

let base = VERSION ? `/${VERSION}/` : '/'

export const common = async () => {
  return {
    base,
    outDir: `./.vitepress/dist${base}`,
    srcExclude: base === '/' ? ['**/v0.3/**'] : ['**/v0.4/**'],
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
    themeConfig: {
      latestVersion: LATEST_VERSION,
      search: {
        provider: 'local',
      },
      siteTitle: '',
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
  }
}
