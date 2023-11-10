const fs = require('fs')
const { execSync } = require('node:child_process')

;(async () => {
  const files = fs.readdirSync('./docs')
  const versionMap = files.filter(file => file.match(/v\d\.\d/))
  await execSync(`npm run docs:dev`, {
    env: {
      ...process.env,
      VERSION_MAP: JSON.stringify(versionMap),
      BASE: '/',
      ENV: 'dev',
    },
  })
})()
