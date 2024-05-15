import fs from 'fs-extra'
import YAML from 'js-yaml'
import { CURRENT_VERSION, versionMap, websiteMap, LATEST_VERSION, CURRENT_LANG } from '../config/common'
import semver from 'semver'

const NIGHTLY_VERSION = "nightly"

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

        let filepath: string
        if (link.startsWith('/release-notes/') && link !== '/release-notes/all-releases') {
          filepath = `docs${link}.md`
        } else {
          filepath = `docs${versionPath}${langPath}${link}.md`
        }

        let file = fs.readFileSync(filepath, 'utf-8')
        const text = file
          .split('\n')
          .find(line => line.startsWith('# '))
          ?.replace('# ', '')
        return {
          text,
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

  const curVer = semver.parse(`${CURRENT_VERSION}.0`)
  versionMap.forEach(version => {
    if (version === CURRENT_VERSION) {
      excludeLangs.forEach(excludeLang => {
        srcExclude.push(`**/${version}/${excludeLang}/**`)
      })
    } else {
      srcExclude.push(`**/${version}/**`)
    }

    if (version !== NIGHTLY_VERSION) {
      const ver = semver.parse(`${version}.0`);
      if (ver > curVer) {
        const fixedVer = `${ver.major}-${ver.minor}`
        srcExclude.push(`**/release-notes/release-${fixedVer}-*`)
      }
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
      const linkVersion = version !== LATEST_VERSION ? `${version}/` : ''
      return {
        text: `${version} ${endText}`,
        link: `/${linkVersion}`,
        target: '_blank',
        activeMatch: `/${linkVersion}/`,
      }
    })
}

export const getVariate = (version: string) => {
  const variatePath = `docs/${version}/variates.yml`
  let variate = {}
  if (fs.existsSync(variatePath)) variate = YAML.load(fs.readFileSync(variatePath), 'utf8')
  return variate
}
