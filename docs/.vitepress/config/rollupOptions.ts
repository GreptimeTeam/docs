import multiInput from 'rollup-plugin-multi-input'
import ignore from 'rollup-plugin-ignore'

export default {
  // input: ['docs/.vitepress/theme/index.ts'],
  output: {
    inlineDynamicImports: false,
    entryFileNames: [
      {
        file: 'dist',
        format: 'umd',
      },
      {
        file: 'dist/v0.3',
        format: 'umd',
      },
    ],
  },
  plugins: [multiInput(), ignore(['docs/v0.3/**/*']), ignore(['docs/v0.4/**/*'])],
}
