import { createMarkdownRenderer } from 'vitepress'
import fs from 'fs-extra'
import matter from 'gray-matter'

const templateBasePath = 'docs/docs-template/'
const filePaths = ['docs/v0.4/en/getting-started/quick-start/']

export default {
  load: async () => {
    const md = await createMarkdownRenderer('', {
      theme: { light: 'material-theme-darker', dark: 'material-theme-darker' },
    })
    const mdMap = {}
    const templateMap = getTemplateMap(templateBasePath)
    const filesMap = getFilesMap(filePaths)
    Object.keys(templateMap).forEach(templateKey => {
      filesMap[templateKey] &&
        Object.keys(filesMap[templateKey]).forEach(fileKey => {
          mdMap[fileKey] = md.render(getFileContent(templateMap[templateKey], filesMap[templateKey][fileKey]))
        })
    })
    return mdMap
  },
}

const getTemplateMap = path => {
  const fileNames = fs
    .readdirSync(path)
    .filter(file => file.match(/\.md/))
    .map(file => file.replace(/\.md/, ''))
  const templateMap = {}
  fileNames.forEach(fileName => {
    const template = fs.readFileSync(`${path}${fileName}.md`, 'UTF-8')
    templateMap[fileName] = template
  })
  return templateMap
}

const getFilesMap = paths => {
  const fileNames = paths.map(path => fs.readdirSync(path).filter(file => file.match(/\.md/)))
  const filesMap = {}
  fileNames.forEach((files, index) => {
    files.forEach(fileName => {
      const file = fs.readFileSync(`${paths[index]}${fileName}`, 'UTF-8')
      const { data, content } = matter(file)
      if (data.template) {
        filesMap[data.template] = filesMap[data.template] || {}
        filesMap[data.template][`${paths[index]}${fileName}`] = content
      }
    })
  })
  return filesMap
}

const getReplacementsMap = content => {
  const regex = /<!--template ([\s\S]*?)-->/g
  const matches = content.match(regex).map(match => match.replace(/<!--template ([\s\S]*)-->/, ($1, $2) => $2))
  const map = {}
  matches.forEach(match => {
    const target = match.split('%')
    const key = target[0]
    const value = target[1].slice(target[1].indexOf('\n') + 1)
    map[key] = value
  })
  return map
}

const getFileContent = (template, file) => {
  const replacementsMap = getReplacementsMap(file)
  return template.replace(/<!--template ([\s\S]*?)% -->/g, (match, key) => replacementsMap[key] || match)
}
