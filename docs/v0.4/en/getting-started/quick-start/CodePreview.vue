<template lang="pug">
div(v-html="md")
</template>
<script setup>
import { data } from './template.data.js'
const props = defineProps({
  file: {
    type: String,
    default: '',
  },
})
// data
const md = computed(() => data[props.file])
// methods
// lifecycle
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
. {

}
</style>
