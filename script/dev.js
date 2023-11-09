const fs = require('fs')
const { execSync } = require('node:child_process')
const settingData = require('./setting.json')

const { LATEST_VERSION, websiteMap } = settingData

;(async () => {
  const files = fs.readdirSync('./docs')
  const versionMap = files.filter(file => file.match(/v\d\.\d/))
  await execSync(`npm run docs:dev`, {
    env: {
      ...process.env,
      LATEST_VERSION,
      VERSION: LATEST_VERSION,
      VERSION_MAP: JSON.stringify(versionMap),
      WEBSITE_MAP: JSON.stringify(websiteMap),
      BASE: '/',
      ENV: 'dev',
    },
  })
})()
