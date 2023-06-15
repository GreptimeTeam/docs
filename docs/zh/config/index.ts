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
    editLink: {
      text: '在 GitHub 上编辑此页',
    },
    lastUpdatedText: '上次更新',
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    outlineTitle: '目录',
  },
})
