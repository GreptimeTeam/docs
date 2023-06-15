import { makeSidebar } from '../../.vitepress/config/common'

export const zhConfig = async () => ({
  themeConfig: {
    nav: [
      {
        text: '主页',
        link: 'https://greptime.cn/',
      },
      {
        text: '博客',
        link: 'https://greptime.com/blogs',
      },
    ],
    sidebar: await makeSidebar('zh'),
  },
})
