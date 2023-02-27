import type MarkdownIt from 'markdown-it'

export default function wrap(md: MarkdownIt) {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const rawCode = fence(...args)
    let res = rawCode.replace(/<span class="lang">.*?<\/span>/, function ($1) {
      return `<button name="toggle wrap" class="wrap active"></button> ${$1}`
    })
    return `${res}`
  }
}
