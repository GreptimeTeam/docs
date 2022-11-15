<template lang="pug">
.header.inner-content
    a(href="/")
      img.logo(src="/logo-text-tinted.png")
    .nav
      a.nav-item(v-for="(item, index) in navItems" :href="item.link") {{item.text}}
</template>
<script setup name="Header" lang="ts">
const { theme } = useData()
// data
const { navItems } = theme.value
// methods
// lifecycle
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
.header {
    height 80px
    z-index 999
    position absolute
    left 50%
    transform translateX(-50%)
    align-items center
    .nav {
      display flex
      align-items center
      .nav-item {
        margin-left 44px
        font-weight 600
        font-size 14px
        color #fff
        text-decoration none
        &:hover {
          color #D8D8D8
        }
      }
    }
    .logo {
      height 32px
    }
  }
</style>
