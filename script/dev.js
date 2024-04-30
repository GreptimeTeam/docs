import fs from 'fs-extra'
import { execSync } from 'node:child_process'
;(async () => {
  const files = fs.readdirSync('./docs')
  const versionMap = files.filter(file => file.match(/v\d\.\d/))
  versionMap.push('nightly')
  try {
    // Retrieve command-line arguments, excluding the first two default arguments (Node.js path and script path).
    const additionalArgs = process.argv.slice(2)
    // Concatenate the command with additional arguments.
    const command = `pnpm run docs:dev ${additionalArgs.join(' ')}`;
    console.log(`Running command: ${command}`)

    await execSync(command, {
      stdio: 'inherit',
      env: {
        ...process.env,
        VERSION_MAP: JSON.stringify(versionMap),
        BASE: '/',
        ENV: 'dev',
      },
    })
  } catch (error) {
    if (error.status !== 1) console.error(error)
  }
})()
