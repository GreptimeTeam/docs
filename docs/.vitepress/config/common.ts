export const common = async () => {
  return {
    appearance: false,
    lastUpdated: true,
    ignoreDeadLinks: false,
    locales: {
      zh: { label: '简体中文', lang: 'zh', link: 'https://docs.greptime.cn/' },
      en: { label: 'English', lang: 'en', link: 'https://docs.greptime.com/' },
    },
    themeConfig: {
      search: {
        provider: 'local',
      },
      siteTitle: '',
      logo: 'logo-text-tinted.png',
      copyright: '©Copyright 2022 Greptime Inc. All Rights Reserved',
      email: 'marketing@greptime.com',
      editLink: {
        pattern: 'https://github.com/GreptimeTeam/docs/blob/main/docs/:path',
      },
      socialLinks: [
        {
          icon: 'github',
          link: 'https://github.com/GreptimeTeam/docs',
        },
      ],
      outline: [2, 4],
    },
    cleanUrls: 'without-subfolders',
  }
}
