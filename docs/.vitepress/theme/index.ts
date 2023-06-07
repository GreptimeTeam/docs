import DefaultTheme from 'vitepress/theme'
import Layout from 'vitepress/dist/client/theme-default/Layout.vue'
import './style/index.styl'

export default {
  ...DefaultTheme,
  Layout,
  NotFound: () => '',
  enhanceApp({ app }) {},
}
