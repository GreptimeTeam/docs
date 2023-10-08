<template lang="pug">
Layout
</template>
<script setup name="Layout" lang="ts">
import Layout from 'vitepress/dist/client/theme-default/Layout.vue'
import { useRouter } from 'vitepress'

// data
const { theme } = useData()
const { latestVersion } = theme.value
// methods
// lifecycle

onMounted(() => {
  const router = useRouter()
  let path = router.route.path
  if (path.includes(latestVersion)) {
    const res = path.replace(`/${latestVersion}`, '')
    router.go(res)
  }
})
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
. {

}
</style>
