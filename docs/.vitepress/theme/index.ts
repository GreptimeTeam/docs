import DefaultTheme from 'vitepress/theme'
import Layout from './components/Layout.vue'
import './style/index.styl'

export default {
  ...DefaultTheme,
  Layout,
  NotFound: () => '',
  enhanceApp({ app }) {},
}
