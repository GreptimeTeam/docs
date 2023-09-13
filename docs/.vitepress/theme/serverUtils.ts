import fs from 'fs-extra'
import YAML from 'js-yaml'

export async function makeSidebar(lang) {
  const langPath = lang !== 'en' ? `/${lang}` : ''

  const summary = YAML.load(fs.readFileSync(`docs/summary.yml`), 'utf8')
  const summaryI18n = langPath ? YAML.load(fs.readFileSync(`docs${langPath}/summary-i18n.yml`), 'utf8') : null

  function makeSidebarItem(items, path, level = 0) {
    if (Array.isArray(items)) {
      return items.map(item => makeSidebarItem(item, path, level + 1))
    } else if (typeof items === 'object') {
      let title = Object.keys(items)[0]
      let content = Object.values(items)[0]

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
        let file = fs.readFileSync(`docs${langPath}${link}.md`, 'utf-8')
        return {
          text: file.split('\n')[0].replace('# ', ''),
          link,
        }
      } catch (error) {
        return {}
      }
    }
  }

  return makeSidebarItem(summary, '')
}
