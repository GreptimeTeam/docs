<template lang="pug">
Layout
  template(#doc-after)
    Footer
</template>
<script setup name="Layout" lang="ts">
import Layout from 'vitepress/dist/client/theme-default/Layout.vue'
import Footer from './components/Footer.vue'
import { getSidebarIcon } from '@/utils'

// data
const { theme } = useData()
const { iconMap } = theme.value

// methods
// lifecycle
onMounted(async () => {
  getSidebarIcon(iconMap)
})
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
.footer
  display flex
  align-items center
  justify-content center
  .copyright-wrapper
    width 100%
    margin-top 60px
    margin-bottom -148px
    padding 16px 0
    color var(--color-gray-5)
    font-size var(--font-size-xxs)
    line-height var(--line-height-xxs)
    display flex
    justify-content center
    align-items center
    .copyright
      display inline-block
    .icp
      line-height 12px
      display inline-block
      padding-left 5px
      margin-left 5px
      border-left 1px solid var(--color-gray-5)
</style>
