import { enConfig } from './en'
import { zhConfig } from './zh'
import { common, CURRENT_LANG, ENV } from './common'
import { devCommon } from './dev'
import merge from 'deepmerge'

export default async () => {
  const config = {
    dev: await devCommon(),
    prod: await common(),
  }
  const lang = {
    zh: await zhConfig(),
    en: await enConfig(),
  }

  const commonConfig = config[ENV]
  const localConfig = lang[CURRENT_LANG]

  return merge(commonConfig, localConfig)
}
