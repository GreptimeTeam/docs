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
  if (path.includes(latestVersion)) {
    body.style.display = 'none'
    const to = path.replace(`/${latestVersion}`, '')
    await router.go(to)
    body.style.display = 'block'
  }
  if (path.match(/(v\d\.\d)$/)) {
    body.style.display = 'none'
    const to = `${path}/index.html`
    window.open(to, '_self')
    body.style.display = 'block'
  }
})
onMounted(async () => {
  setVersionOnPage(router.route.path, latestVersion, sidebar)
  getSidebarIcon(iconMap)
})
</script>
