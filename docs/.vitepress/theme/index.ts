import { gtag } from '@/utils.ts'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import DocsTemplate from './components/DocsTemplate.vue'
import './style/index.styl'

export default {
  ...DefaultTheme,
  Layout,
  NotFound: () => '',
  enhanceApp({ app }) {
    app.component('DocsTemplate', DocsTemplate)

    if (typeof window !== 'undefined') {
      const oScript = window.document.createElement('script')

      oScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-BYNN8J57JZ'
      window.document.body.appendChild(oScript)

      window.dataLayer = window.dataLayer || []
      gtag('js', new Date())
      gtag('config', 'G-BYNN8J57JZ')
    }
  },
}
