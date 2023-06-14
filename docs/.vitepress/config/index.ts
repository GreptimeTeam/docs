import { enConfig } from './en'
import { zhConfig } from '../../zh/config/index'
import { common } from './common'
import dotenv from 'dotenv'

export default async () => {
  const commonConfig = await common()

  const zh = { label: '简体中文', lang: 'zh', ...(await zhConfig()) }
  const en = { label: 'English', lang: 'en', ...(await enConfig()) }
  let root = en
  let rewrites = {}

  switch (dotenv.config().parsed?.VITE_LANG) {
    case 'zh':
      root = zh
      rewrites = {
        'zh/:file': ':file',
        'zh/:group/:file': ':group/:file',
        'zh/:group/:type/:file': ':group/:type/:file',
      }
      break
    default:
      root = en
      rewrites = {}
  }

  return {
    ...commonConfig,
    locales: {
      root,
      en: { ...en, link: 'https://docs.greptime.com/' },
      zh: { ...zh, link: 'https://docs.greptime.cn/' },
    },
    rewrites,
  }
}
