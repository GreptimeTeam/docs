import DefaultTheme from 'vitepress/theme'
import Layout from './components/Layout.vue'
import './style/index.styl'
import { useWrap } from '@/utils'
export default {
  ...DefaultTheme,
  Layout,
  NotFound: () => '',
  enhanceApp({ app }) {
    useWrap()
  },
}
