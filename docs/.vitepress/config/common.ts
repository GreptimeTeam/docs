import dotenv from 'dotenv'

export const CURRENT_LANG = dotenv.config().parsed?.VITE_LANG || 'en'
export const LATEST_VERSION = 'v0.4'

const latestVersionPath = `${CURRENT_LANG}/${LATEST_VERSION}/:path+`
const versionPath = `${CURRENT_LANG}/:version/:path+`

export const common = async () => {
  return {
    appearance: false,
    lastUpdated: true,
    ignoreDeadLinks: false,
    head: [['script', { src: 'https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/icons_19361_134.ede7dfbb02f3e5cba425f4d574d089ba.js' }]],
    locales: {
      zh: { label: '简体中文', lang: 'zh-CN', link: 'https://docs.greptime.cn/' },
      en: { label: 'English', lang: 'en-US', link: 'https://docs.greptime.com/' },
    },
    markdown: {
      theme: { light: 'material-theme-darker', dark: 'material-theme-darker' },
    },
    rewrites: {
      [latestVersionPath]: `:path+`,
      [versionPath]: `:version(v\\d\.\\d)?/:path+`,
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
