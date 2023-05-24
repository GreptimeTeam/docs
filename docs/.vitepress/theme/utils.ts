export const openLink = url => {
  window.open(url)
}

export const gtag = function () {
  window.dataLayer.push(arguments)
}

//NOTICE: use /i to ignore case
export const isBlog = url => /blogs\//i.test(url)
