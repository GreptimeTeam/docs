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

router.onBeforePageLoad = to => {
  setVersionOnPage(to, latestVersion, sidebar)
}
onBeforeMount(async () => {
  const body = document.querySelector('body')
  body.style.display = 'none'
  const router = useRouter()
  let path = router.route.path
  if (path.includes(latestVersion)) {
    const res = path.replace(`/${latestVersion}`, '')
    await router.go(res)
  }
  body.style.display = 'block'
})
onMounted(async () => {
  setVersionOnPage(router.route.path, latestVersion, sidebar)
  getSidebarIcon(iconMap)
})
</script>
