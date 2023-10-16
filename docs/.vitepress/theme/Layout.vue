<template lang="pug">
Layout
</template>
<script setup name="Layout" lang="ts">
import Layout from 'vitepress/dist/client/theme-default/Layout.vue'
import { useRouter } from 'vitepress'
import { getSidebarIcon, setVersionOnPage } from '@/utils.ts'

// data
const { theme } = useData()
const { latestVersion, iconMap, sidebar } = theme.value
const router = useRouter()
let path = router.route.path
// const body = document.querySelector('body')
// methods
// lifecycle

router.onBeforePageLoad = async to => {
  setVersionOnPage(to, latestVersion, sidebar)
}

if (path.includes(latestVersion)) {
  // body.style.display = 'none'
  // console.log(`body.style.display11111:`, body.style.display)
  const to = path.replace(`/${latestVersion}`, '')
  window.open(to)
  // router.go(res)
  // body.style.display = 'block'
}
if (path.match(/(v\d\.\d)$/)) {
  // body.style.display = 'none'
  console.log('path2: ', path)
  const to = `${path}/index.html`
  window.open(to)

  // await window.open(to)
  console.log('to222: ', to)
  // body.style.display = 'block'
  // console.log('path: ', `${path}/index.html`)
  // console.log(`2222path.match(/(v\d\.\d)$/):`, path.match(/(v\d\.\d)$/))
}
onBeforeMount(async () => {
  // const body = document.querySelector('body')
  // const router = useRouter()
  // if (path.includes(latestVersion)) {
  //   body.style.display = 'none'
  //   console.log(`body.style.display11111:`, body.style.display)
  //   const res = path.replace(`/${latestVersion}`, '')
  //   window.location.href = res
  //   // await router.go(res)
  //   // body.style.display = 'block'
  // }
  // console.log(`body.style.display11111:`, body.style.display)
})
onMounted(async () => {
  setVersionOnPage(router.route.path, latestVersion, sidebar)
  getSidebarIcon(iconMap)
})
</script>
