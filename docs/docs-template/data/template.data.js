import { createMarkdownRenderer } from 'vitepress'
import fs from 'fs-extra'
import matter from 'gray-matter'

export default {
  load: async () => {
    const md = await createMarkdownRenderer('', {
      theme: { light: 'material-theme-darker', dark: 'material-theme-darker' },
    })
    const mdMap = {}
    const filesMap = getAllFilesMap()
    Object.keys(filesMap).forEach(templateKey => {
      filesMap[templateKey] &&
        Object.keys(filesMap[templateKey]).forEach(fileKey => {
          mdMap[fileKey] = md.render(getFileContent(getTemplate(templateKey), filesMap[templateKey][fileKey]))
        })
    })
    return mdMap
  },
}

const getTemplate = path => fs.readFileSync(path, 'UTF-8')

const getAllFilesMap = () => {
  const filesMap = {}
  const getFilesMap = (filesMap, path) => {
    try {
      const fileNames = fs.readdirSync(path)
      fileNames.forEach(fileName => {
        if (fileName.match(/.md/)) {
          const file = fs.readFileSync(`${path}/${fileName}`, 'UTF-8')
          const { data, content } = matter(file)
          if (data.template) {
            const templatePath = getAbsolutePath(data.template, path)
            filesMap[templatePath] = filesMap[templatePath] || {}
            filesMap[templatePath][`${path}/${fileName}`] = content
          }
        } else {
          getFilesMap(filesMap, `${path}/${fileName}`)
        }
      })
    } catch {
      return
    }
  }
  getFilesMap(filesMap, 'docs')
  return filesMap
}

const getAbsolutePath = (relativePath, currentPath) => {
  const relativePathArray = relativePath.split('/')
  const currentPathArray = currentPath.split('/')
  relativePathArray.forEach((path, index) => {
    if (path === '..') {
      currentPathArray.pop()
      relativePathArray.splice(index, 1)
    } else if (path == '.') {
      relativePathArray.splice(index, 1)
    }
  })
  return `${currentPathArray.join('/')}/${relativePathArray.join('/')}`
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
