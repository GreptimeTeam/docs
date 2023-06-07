import { makeSidebar } from './common'

export const enConfig = async () => ({
  themeConfig: {
    nav: [
      {
        text: 'Home',
        link: 'https://greptime.com/',
      },
      {
        text: 'Blogs',
        link: 'https://greptime.com/blogs',
      },
    ],
    sidebar: await makeSidebar('en'),
  },
})
