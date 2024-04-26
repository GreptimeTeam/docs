import { createMarkdownRenderer } from 'vitepress'
import path from 'path'
import fs from 'fs-extra'
import matter from 'gray-matter'
import { getVariate } from './serverUtils'
import { CURRENT_VERSION } from '../config/common'

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
          let src = getFileContent(getTemplate(templateKey), filesMap[templateKey][fileKey])
          src = processIncludes('.', src, fileKey, [])
          src = replaceVariate(src)
          mdMap[fileKey] = md.render(src)
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
  const regex = /\{template ([\s\S]*?)%\}/g
  const matches = content.match(regex).map(match => match.replace(/\{template ([\s\S]*)%\}/, ($1, $2) => $2))
  const map = {}
  matches.forEach(match => {
    const targetKey = match.slice(0, match.indexOf('%'))
    const targetValue = match.slice(match.indexOf('%') + 1)
    const key = targetKey
    const value = targetValue.slice(targetValue[1].indexOf('\n') + 1)
    map[key] = value
  })
  return map
}

const getFileContent = (template, file) => {
  const replacementsMap = getReplacementsMap(file)
  return template.replace(/\{template ([\s\S]*?)%%\}/g, (match, key) => replacementsMap[key] || match)
}

function slash(p) {
  return p.replace(/\\/g, '/')
}

function processIncludes(srcDir, src, file, includes) {
  const includesRE = /<!--\s*@include:\s*(.*?)\s*-->/g
  const rangeRE = /\{(\d*),(\d*)\}$/
  return src.replace(includesRE, (m, m1) => {
    if (!m1.length) return m

    const range = m1.match(rangeRE)
    range && (m1 = m1.slice(0, -range[0].length))
    const atPresent = m1[0] === '@'
    try {
      const includePath = atPresent ? path.join(srcDir, m1.slice(m1[1] === '/' ? 2 : 1)) : path.join(path.dirname(file), m1)
      let content = fs.readFileSync(includePath, 'utf-8')
      if (range) {
        const [, startLine, endLine] = range
        const lines = content.split(/\r?\n/)
        content = lines.slice(startLine ? parseInt(startLine, 10) - 1 : undefined, endLine ? parseInt(endLine, 10) : undefined).join('\n')
      }
      includes.push(slash(includePath))
      // recursively process includes in the content
      return processIncludes(srcDir, content, includePath, includes)
    } catch (error) {
      return m // silently ignore error if file is not present
    }
  })
}

function replaceVariate(src) {
  const variates = getVariate(CURRENT_VERSION)
  const variatesKey = Object.keys(variates)
  
  variatesKey.forEach(key => {
    src = src.replace(new RegExp(/<%\s*(.*?)\s*%>/, 'g'), (_, $1) => {
      if (variates[$1]) return `${variates[key]}`
      else {
        return `${_}`
      }
    })
  })
  return src;
}
