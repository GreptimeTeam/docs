import { createMarkdownRenderer } from 'vitepress'
import fs from 'fs-extra'

const template = fs.readFileSync('docs/v0.4/en/getting-started/quick-start/template.md', 'UTF-8')
const go = fs.readFileSync('docs/v0.4/en/getting-started/quick-start/go.md', 'UTF-8')
const node = fs.readFileSync('docs/v0.4/en/getting-started/quick-start/node.md', 'UTF-8')
const filesMap = { go: go, node: node }

export default {
  load: async () => {
    const md = await createMarkdownRenderer('', {
      theme: { light: 'material-theme-darker', dark: 'material-theme-darker' },
    })
    const mdMap = {}
    Object.keys(filesMap).forEach(key => (mdMap[key] = md.render(getFileContent(filesMap[key]))))
    return mdMap
  },
}

const getReplacementsMap = content => {
  const regex = /<!--([\s\S]*?)-->/g
  const matches = content.match(regex).map(match => match.replace(/<!--([\s\S]*)-->/, '$1'))
  const map = {}
  matches.forEach(match => {
    const key = match.split('%')[0]
    const value = match.split('%')[1].replace(/\n/, '')
    map[key] = value
  })
  return map
}

const getFileContent = file => {
  const replacementsMap = getReplacementsMap(file)
  return template.replace(/<!--% ([\s\S]*?) -->/g, (match, key) => replacementsMap[key] || match)
}
