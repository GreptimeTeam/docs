import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import rollupOptions from './.vitepress/config/rollupOptions'
import { resolve } from 'path'

export default {
  plugins: [
    Components({
      dts: true,
      dirs: ['.vitepress/theme/components'],
      extensions: ['vue', 'md'],
    }),
    AutoImport({
      dts: true,
      imports: ['vue', 'vitepress'],
    }),
  ],
  resolve: {
    alias: {
      '@': '/.vitepress/theme',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, '.vitepress/theme/index.ts'),
        nested: resolve(__dirname, '.vitepress/theme/index.ts'),
      },
      output: {
        main: 'docs/dist/index.html',
        nested: 'docs/dist/v0.3/index.html',
      },
    },
  },
}
