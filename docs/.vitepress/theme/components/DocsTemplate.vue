<template lang="pug">
div(v-html="md")
</template>
<script setup>
import { data } from '../template.data.js'
// data
const route = useRoute()
const fileKey = `docs/${route.data.filePath}`

const md = computed(() => data[fileKey])
// methods
// lifecycle
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
. {

}
</style>
