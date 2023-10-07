import { enConfig } from './en'
import { zhConfig } from '../../zh/config/index'
import { common } from './common'
import dotenv from 'dotenv'
import merge from 'deepmerge'

export default async () => {
  const commonConfig = await common()

  const lang = {
    zh: await zhConfig(),
    en: await enConfig(),
  }

  const localConfig = lang[dotenv.config().parsed?.VITE_LANG || 'en']
  return merge(commonConfig, localConfig)
}
