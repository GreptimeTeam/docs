<template lang="pug">
Layout
  template(#doc-page-before)
    Cover(v-if="cover !== undefined")
  template(#doc-before)
    // need change condition (v-if=" ")
    Author(v-if="cover !== undefined")
  template(#home-hero-before)
    Home(v-if="layout === 'home'")
  template(#layout-bottom)  
    //- Footer(v-if="layout !== 'doc'")
</template>
<script setup name="Layout" lang="ts">
import Layout from '../default/Layout.vue'
const { frontmatter, theme } = useData()
const { layout, cover } = frontmatter.value

// data
// methods
// lifecycle
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
.layout
  display flex
  flex-direction column
</style>
