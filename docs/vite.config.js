import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'

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
}
