import { enConfig } from './en'
import { zhConfig } from '../../zh/config/index'
import { common } from './common'
import dotenv from 'dotenv'

export default async () => {
  const commonConfig = await common()

  const zh = { label: '简体中文', lang: 'zh', ...(await zhConfig()) }
  const en = { label: 'English', lang: 'en', ...(await enConfig()) }
  let root = en

  switch (dotenv.config().parsed?.VITE_LANG) {
    case 'zh':
      root = zh
      break
    default:
      root = en
  }

  return {
    ...commonConfig,
    locales: {
      root,
      en: { ...en, link: 'https://docs.greptime.com/' },
      zh: { ...zh, link: 'http://greptime-document-bucket.s3-website.cn-northwest-1.amazonaws.com.cn' },
    },
  }
}
