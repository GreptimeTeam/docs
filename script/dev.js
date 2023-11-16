const fs = require('fs')
const { execSync } = require('node:child_process')
const { getLatestVersion } = require('./utils')

;(async () => {
  const files = fs.readdirSync('./docs')
  const versionMap = files.filter(file => file.match(/v\d\.\d/))
  const LATEST_VERSION = getLatestVersion(versionMap)
  try {
    await execSync(`npm run docs:dev`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        LATEST_VERSION,
        VERSION_MAP: JSON.stringify(versionMap),
        BASE: '/',
        ENV: 'dev',
      },
    })
  } catch (error) {
    if (error.status !== 1) console.error(error)
  }
})()
