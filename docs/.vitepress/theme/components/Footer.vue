<template lang="pug">
.footer 
  .copyright-wrapper
    .copyright {{copyright}}
    a.icp(v-if="showIcp" :href="icp.link" target="_blank") {{ icp.text }}
    a.icp(v-if="showIcp" :href="gongan.link" target="_blank") {{ gongan.text }}
</template>
<script setup name="Footer" lang="ts">
// data
const { theme } = useData()
const { copyright, icp, gongan } = theme.value

const showIcp = computed(() => !!icp)
// methods
// lifecycle
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

@media(max-width 600px)
  .footer .copyright-wrapper
    margin-top 48px
    flex-direction column
    .icp
      margin-top 8px
      margin-left 0
      padding-left 0
      border-left none
      display block
</style>
