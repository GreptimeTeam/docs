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
import { gtag } from '@/utils.ts'
import Layout from '../default/Layout.vue'
const { frontmatter, theme } = useData()
const { layout, cover } = frontmatter.value

// data
// methods
// lifecycle
onMounted(() => {
  initGA()
})

function initGA() {
  const oScript = document.createElement('script')

  oScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-BYNN8J57JZ'
  document.body.appendChild(oScript)

  window.dataLayer = window.dataLayer || []
  gtag('js', new Date())
  gtag('config', 'G-BYNN8J57JZ')
}

</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
.layout
  display flex
  flex-direction column
</style>
