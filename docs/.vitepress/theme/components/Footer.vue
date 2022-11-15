<template lang="pug">
footer
  .inner-content
    img.logo(src="/logo-text-tinted.png")
    .email
      a(:href="`mailto:${email}`") Contact us
    Subscribe.contact
  .copyright 
    span {{copyright}}
</template>
<script setup name="Footer" lang="ts">
const { theme } = useData()
// data
const { copyright, email } = theme.value
// methods
// lifecycle
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
footer
  background #110922
  position relative
  .logo
    height 32px
    width auto
    position absolute
    top 43px
    left 16px
  .copyright
    height 90px
    display flex
    align-items center
    justify-content center
    box-shadow -1px 0px 0px 1px rgba(255, 255, 255, 0.15)
    margin-top 30px
    line-height 1.5
    span
      color #D8D8D8
      font-size 14px
      display inline-block
  .email
    margin-top 100px
    opacity .7
  .contact
    height 120px
    flex 1
    display flex
    flex-direction column
    align-items flex-end
    margin-top 28px
@media(max-width 750px)
  footer
    .inner-content
      flex-direction column
      .email
        margin-top 100px
      .contact
        align-items flex-start
    .copyright
      height 90px
      padding-left 20px
      align-items center
      justify-content flex-start
</style>
