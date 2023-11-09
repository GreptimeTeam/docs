import fs from 'fs-extra'
import YAML from 'js-yaml'
import { CURRENT_VERSION, versionMap, websiteMap, LATEST_VERSION } from '../config/common'

export async function makeSidebar(lang, version) {
  const langPath = `/${lang}`
  const versionPath = `/${version}`

  const summary = YAML.load(fs.readFileSync(`docs${versionPath}/en/summary.yml`), 'utf8')
  const summaryI18n = lang !== 'en' ? YAML.load(fs.readFileSync(`docs${versionPath}${langPath}/summary-i18n.yml`), 'utf8') : null
  function makeSidebarItem(items, path, level = 0) {
    if (Array.isArray(items)) {
      return items.map(item => makeSidebarItem(item, path, level + 1))
    } else if (typeof items === 'object') {
      let title = Object.keys(items)[0]
      let content = <Array<string>>Object.values(items)[0]

      if (summaryI18n && !summaryI18n[title]) {
        return {}
      }

      return {
        text: summaryI18n?.[title] || title.replace(/-/g, ' '),
        items: content.map(item => makeSidebarItem(item, `${path}/${title}`, level + 1)),
        collapsed: true,
      }
    } else {
      try {
        let link = `${path}/${items}`.toLocaleLowerCase()
        let file = fs.readFileSync(`docs${versionPath}${langPath}${link}.md`, 'utf-8')
        return {
          text: file.split('\n')[0].replace('# ', ''),
          link: `${link}`,
        }
      } catch (error) {
        return {}
      }
    }
  }

  return makeSidebarItem(summary, '')
}

export const getSrcExclude = (versionMap: Array<string>, lang: string, langMap: Array<string>) => {
  const srcExclude = []
  const excludeLangs = langMap.filter(l => l !== lang)

  versionMap.forEach(version => {
    if (version === CURRENT_VERSION) {
      excludeLangs.forEach(excludeLang => {
        srcExclude.push(`**/${version}/${excludeLang}/**`)
      })
    } else {
      srcExclude.push(`**/${version}/**`)
    }
  })

  return srcExclude
}

export const getVersionList = (lang: string) => {
  const textMap = {
    en: '(latest)',
    zh: '(最新)',
  }
  return versionMap
    .filter(version => version !== CURRENT_VERSION)
    .map(version => {
      const endText = version !== LATEST_VERSION ? '' : textMap[lang] || '(latest)'
      return {
        text: `${version} ${endText}`,
        link: `${websiteMap[lang]}/${version}/`,
      }
    })
}
