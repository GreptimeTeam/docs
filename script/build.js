import fs from 'fs-extra'
import { execSync } from 'node:child_process'
;(async () => {
  const files = fs.readdirSync('./docs')
  const versionMap = files.filter(file => file.match(/v\d\.\d/))
  for (let i = versionMap.length; i >= 0; i--) {
    await execSync(`pnpm run docs:build`, {
      env: {
        ...process.env,
        VERSION: versionMap[i],
        VERSION_MAP: JSON.stringify(versionMap),
        BASE: versionMap[i] && `/${versionMap[i]}/`,
        ENV: 'prod',
      },
    })
  }
})()
