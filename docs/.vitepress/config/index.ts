import { enConfig } from '../../en/config'
import { zhConfig } from '../../zh/config'
import { common, CURRENT_LANG } from './common'
import merge from 'deepmerge'

export default async () => {
  const commonConfig = await common()

  const lang = {
    zh: await zhConfig(),
    en: await enConfig(),
  }

  const localConfig = lang[CURRENT_LANG]
  return merge(commonConfig, localConfig)
}
