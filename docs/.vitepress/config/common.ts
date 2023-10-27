import dotenv from 'dotenv'
import rollupOptions from './rollupOptions'

export const CURRENT_LANG = dotenv.config().parsed?.VITE_LANG || 'en'
export const LATEST_VERSION = 'v0.4'

const latestVersionPath = `${LATEST_VERSION}/${CURRENT_LANG}/:path+`
const versionPath = `:version/${CURRENT_LANG}/:path+`

export const common = async () => {
  return {
    rollupOptions,
    appearance: false,
    lastUpdated: true,
    ignoreDeadLinks: false,
    head: [['script', { src: 'https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/icons_19361_134.ede7dfbb02f3e5cba425f4d574d089ba.js' }]],
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
        options: {
          _render(src, env, md) {
            if (env.frontmatter?.search === false) return ''
            if (!env.relativePath.match(`/${LATEST_VERSION}/`)) return ''
            return md.render(src, env)
          },
        },
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
