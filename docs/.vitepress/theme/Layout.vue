<template lang="pug">
Layout
</template>
<script setup name="Layout" lang="ts">
import Layout from 'vitepress/dist/client/theme-default/Layout.vue'
import { useRouter } from 'vitepress'
import { getSidebarIcon } from '@/utils.ts'

// data
const { theme } = useData()
const { latestVersion, iconMap } = theme.value
// methods
// lifecycle
onMounted(async () => {
  const router = useRouter()
  let path = router.route.path
  if (path.includes(latestVersion)) {
    const res = path.replace(`/${latestVersion}`, '')
    await router.go(res)
  }
  getSidebarIcon(iconMap)
})
onUnmounted(() => {})
</script>
