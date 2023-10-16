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
// methods
// lifecycle

router.onBeforePageLoad = async to => {
  setVersionOnPage(to, latestVersion, sidebar)
}

onBeforeMount(async () => {
  const body = document.querySelector('body')
  console.log(`body.style.display:`, body.style.display)
  if (path.includes(latestVersion)) {
    body.style.display = 'none'
    const to = path.replace(`/${latestVersion}`, '')
    console.log(`body.style.displayBefore:`, body.style.display)
    window.open(to, '_self')
    // await router.go(to)
    // body.style.display = 'block'
    console.log(`body.style.displayAfter:`, body.style.display)
  }
  if (path.match(/(v\d\.\d)$/)) {
    console.log('path2: ', path)
    const to = `${path}/index.html`
    console.log(`body.style.displayBefore:`, body.style.display)
    await window.open(to, '_self')
    body.style.display = 'block'
    console.log(`body.style.displayAfter:`, body.style.display)
  }
  // body.style.display = 'block'
  console.log(`body.style.displayLast:`, body.style.display)
})
onMounted(async () => {
  setVersionOnPage(router.route.path, latestVersion, sidebar)
  getSidebarIcon(iconMap)
})
</script>
