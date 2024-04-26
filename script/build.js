import fs from 'fs-extra'
import { execSync } from 'node:child_process'
;(async () => {
  const files = fs.readdirSync('./docs')
  const versionMap = files.filter(file => file.match(/v\d\.\d/))
  for (let i = versionMap.length; i >= 0; i--) {
    // Retrieve command-line arguments, excluding the first two default arguments (Node.js path and script path).
    const additionalArgs = process.argv.slice(2)
    // Concatenate the command with additional arguments.
    const command = `pnpm run docs:build ${additionalArgs.join(' ')}`;
    console.log(`Running command: ${command}`)

    await execSync(command, {
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
