import { gtag } from '@/utils.ts'
import DefaultTheme from 'vitepress/theme'
import Layout from 'vitepress/dist/client/theme-default/Layout.vue'
import './style/index.styl'

function initGA() {
  const oScript = document.createElement('script')

  oScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-BYNN8J57JZ'
  document.body.appendChild(oScript)

  window.dataLayer = window.dataLayer || []
  gtag('js', new Date())
  gtag('config', 'G-BYNN8J57JZ')
}

initGA()

export default {
  ...DefaultTheme,
  Layout,
  NotFound: () => '',
  enhanceApp({ app }) {},
}
