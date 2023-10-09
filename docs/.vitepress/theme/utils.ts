export const openLink = url => {
  window.open(url)
}

export const gtag = function () {
  window.dataLayer.push(arguments)
}

//NOTICE: use /i to ignore case
export const isBlog = url => /blogs\//i.test(url)

export const insertIcon = (iconMap, event = false) => {
  const div = document.getElementById('VPSidebarNav')
  if (div) {
    const child = div.children
    const group = Array.from(child).filter(value => value.className === 'group')
    group.forEach(item => {
      const parentElement = item.children[0].children[0]
      const targetElement = <HTMLInputElement>parentElement.children[1]
      if (targetElement.name) return
      const insertElement = <HTMLInputElement>document.createElement('iconpark-icon')
      const key = parentElement.textContent
      insertElement.name = iconMap.find(value => value.key === key)?.icon || ''
      parentElement.insertBefore(insertElement, targetElement)
    })
    return
  }
  event && setTimeout(() => insertIcon(iconMap, event), 50)
}

export function getSidebarIcon(iconMap) {
  insertIcon(iconMap)
  window.addEventListener('click', e => {
    const el = <HTMLInputElement>e.target
    if (el.matches('.VPLink')) {
      insertIcon(iconMap, true)
    }
  })
}
