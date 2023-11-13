<template lang="pug">
Layout
</template>
<script setup name="Layout" lang="ts">
import Layout from 'vitepress/dist/client/theme-default/Layout.vue'
import { getSidebarIcon } from '@/utils.ts'

// data
const { theme } = useData()
const { iconMap } = theme.value
// methods
// lifecycle
onMounted(async () => {
  getSidebarIcon(iconMap)
})
</script>
