import { LATEST_VERSION, CURRENT_VERSION, versionMap, common } from './common'

export const devCommon = async () => {
  const commonConfig = await common()

  const locales = {}
  versionMap
    .filter(v => v !== CURRENT_VERSION)
    .forEach(version => {
      locales[version] = { label: 'English', lang: 'en-US', link: `/` }
    })

  commonConfig.srcExclude = []
  commonConfig.locales = locales

  return commonConfig
}
