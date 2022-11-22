<template lang="pug">
.custom-content
  .inner-content
    img(:src="'blogs/art_im1.png'")
    Content
</template>
<script setup name="CustomContent" lang="ts">
const { page, frontmatter } = useData()
// data
const { layout } = frontmatter.value
// methods
// lifecycle
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
.custom-content {
  flex 1
}
</style>
