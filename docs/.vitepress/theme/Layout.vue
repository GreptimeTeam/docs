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
// methods
// lifecycle
const router = useRouter()
let path = router.route.path
router.onBeforeRouteChange = async to => {
  console.log(`path.match(/(v\d\.\d)$/)11111:`, path.match(/(v\d\.\d)$/))
  // if (path.match(/(v\d\.\d)$/)) {
  //   console.log('path: ', path)
  //   console.log('path1: ', `${path}/index.html`)
  //   // await router.go(`${path}/index.html`)
  //   await router.go(`${path}/index.html`)
  //   console.log('path1: ', `${path}/index.html`)
  // }
}
router.onBeforePageLoad = async to => {
  setVersionOnPage(to, latestVersion, sidebar)
}
onBeforeMount(async () => {
  const body = document.querySelector('body')
  const router = useRouter()
  if (path.includes(latestVersion)) {
    body.style.display = 'none'
    console.log(`body.style.display11111:`, body.style.display)
    const res = path.replace(`/${latestVersion}`, '')
    window.location.href = res
    // await router.go(res)
    // body.style.display = 'block'
  }
  if (path.match(/(v\d\.\d)$/)) {
    body.style.display = 'none'
    console.log('path2: ', path)
    const to = `${path}/index.html`
    await router.go(to)
    router.onBeforeRouteChange = async to => {
      console.log('onBeforeRouteChange: ', to)
      body.style.display = 'none'
    }
    router.onAfterRouteChanged = async to => {
      console.log('onAfterRouteChanged: ', to)
      body.style.display = 'none'
    }
    router.onBeforePageLoad = async to => {
      console.log('onBeforePageLoad: ', to)
      body.style.display = 'none'
    }
    // await window.open(to)
    console.log('to222: ', to)
    // body.style.display = 'block'
    // console.log('path: ', `${path}/index.html`)
    // console.log(`2222path.match(/(v\d\.\d)$/):`, path.match(/(v\d\.\d)$/))
  }
  // console.log(`body.style.display11111:`, body.style.display)
})
onMounted(async () => {
  setVersionOnPage(router.route.path, latestVersion, sidebar)
  getSidebarIcon(iconMap)
})
</script>
