const { execSync } = require('node:child_process')
const fs = require('fs')

const LATEST_VERSION = 'v0.4'
const websiteMap = { en: 'https://feat-catalog.greptime-docs.pages.dev', zh: 'https://feat-catalog.greptime-docs.pages.dev' }

;(async () => {
  const files = fs.readdirSync('./docs')
  const versionMap = files.filter(file => file.match(/v\d.\d/))
  for (let i = versionMap.length; i >= 0; i--) {
    await execSync(`npm run docs:build`, {
      env: {
        ...process.env,
        LATEST_VERSION,
        VERSION: versionMap[i],
        VERSION_MAP: JSON.stringify(versionMap),
        WEBSITE_MAP: JSON.stringify(websiteMap),
        BASE: versionMap[i] && `/${versionMap[i]}/`,
      },
    })
  }
})()
