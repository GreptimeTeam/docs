export const openLink = url => {
  window.open(url)
}

//NOTICE: use /i to ignore case
export const isBlog = url => /blogs\//i.test(url)
