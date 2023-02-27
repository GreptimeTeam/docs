export const openLink = url => {
  window.open(url)
}

//NOTICE: use /i to ignore case
export const isBlog = url => /blogs\//i.test(url)

export const useWrap = () => {
  window.addEventListener('click', e => {
    const el = e.target as HTMLElement
    if (el.matches('div[class*="language-"] > button.wrap')) {
      const code = el.nextElementSibling.nextElementSibling.childNodes[0]
      code.className = code.className ? '' : 'wrap'
    }
  })
}
