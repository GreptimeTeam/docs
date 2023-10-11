export const openLink = url => {
  window.open(url)
}

export const gtag = function () {
  window.dataLayer.push(arguments)
}

//NOTICE: use /i to ignore case
export const isBlog = url => /blogs\//i.test(url)

export const insertIcon = iconMap => {
  const domObserver = new MutationObserver((_mutationList, observer) => {
    const div = document.getElementById('VPSidebarNav')

    if (div) {
      const child = div.children
      const group = Array.from(child).filter(value => value.className === 'group')
      group.forEach(item => {
        const parentElement = item.children[0].children[0]
        const targetElement = <HTMLInputElement>parentElement.children[1]
        if (targetElement.name) {
          observer.disconnect()
          return
        }
        const insertElement = <HTMLInputElement>document.createElement('iconpark-icon')
        const key = parentElement.textContent
        insertElement.name = iconMap.find(value => value.key === key)?.icon || ''
        parentElement.insertBefore(insertElement, targetElement)
      })
      observer.disconnect()
    }
  })
  domObserver.observe(document.body, { childList: true, subtree: true })
}

export function getSidebarIcon(iconMap) {
  insertIcon(iconMap)
  window.addEventListener('click', e => {
    const el = <HTMLInputElement>e.target
    if (el.matches('.VPLink')) {
      insertIcon(iconMap)
    }
  })
}

export function setVersionOnPage(path, currentVersion) {
  currentVersion.value = path.includes('/v0.3/') ? 'V0.3' : 'V0.4'
  const div = document.querySelector('.VPNavBarMenuGroup')
  const targetElement = <HTMLInputElement>div.childNodes[0].childNodes[0].childNodes[1]
  targetElement.innerText = currentVersion.value
}
