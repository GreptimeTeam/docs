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
const router = useRouter()
router.onBeforePageLoad = to => {
  const pre = to
  let res = to.replace(`/zh`, '')
  res = res.replace(`/en`, '')
  res = res.replace(`/v0.4`, '')
  res = res.replace(`/v0.4`, '')

  if (pre !== res) router.go(res)
}

onMounted(async () => {
  getSidebarIcon(iconMap)
})
</script>
