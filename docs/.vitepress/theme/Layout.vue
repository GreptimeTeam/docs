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
  if (path.match(/(v\d\.\d)$/)) {
    await router.go(`${path}/index.html`)
  }
}
router.onBeforePageLoad = to => {
  setVersionOnPage(to, latestVersion, sidebar)
}
onBeforeMount(async () => {
  const body = document.querySelector('body')
  body.style.display = 'none'
  const router = useRouter()
  if (path.includes(latestVersion)) {
    const res = path.replace(`/${latestVersion}`, '')
    await router.go(res)
  } else if (path.match(/(v\d\.\d)$/)) {
    console.log('path: ', path)
    console.log('path1: ', `${path}/index.html`)
    await router.go(`${path}/index.html`)
    console.log('path1: ', `${path}/index.html`)
  }
  body.style.display = 'block'
})
onMounted(async () => {
  setVersionOnPage(router.route.path, latestVersion, sidebar)
  getSidebarIcon(iconMap)
})
</script>
