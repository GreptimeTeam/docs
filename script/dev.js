const fs = require('fs')
const { execSync } = require('node:child_process')

;(async () => {
  const files = fs.readdirSync('./docs')
  const versionMap = files.filter(file => file.match(/v\d\.\d/))
  try {
    await execSync(`npm run docs:dev`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        VERSION_MAP: JSON.stringify(versionMap),
        BASE: '/',
        ENV: 'dev',
      },
    })
  } catch (error) {
    if (error.status !== 1) console.log(error)
  }
})()
