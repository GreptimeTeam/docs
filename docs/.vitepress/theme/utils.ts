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
export const selectSearchResult = () => {
  const domObserver = new MutationObserver((_mutationList, observer) => {
    const div = document.getElementById('localsearch-list')

    if (div) {
      const child = div.children
      const regVersion = /\/v\d\.\d\//
      const temp = window.location.href.match(regVersion)?.[0]
      if (!temp) {
        Array.from(child).forEach(item => item.children[0].getAttribute('href').match(regVersion) && item.remove())
      } else {
        Array.from(child).forEach(item => !item.children[0].getAttribute('href').includes(temp) && item.remove())
      }
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
      selectSearchResult()
    }
  })
}

export function setVersionOnPage(path, latestVersion, sidebar) {
  const allVersions = getAllVersions(sidebar, latestVersion)
  const version = allVersions.find(version => path.includes(version)) || latestVersion
  const div = document.querySelector('.VPNavBarMenuGroup')
  const targetElement = <HTMLInputElement>div.childNodes[0].childNodes[0].childNodes[1]
  targetElement.innerText = version
}

export const getAllVersions = (sidebar, latestVersion) =>
  Object.keys(sidebar).map(v => {
    if (v === '/') return latestVersion
    return v.replace(new RegExp(/\//g), '')
  })
