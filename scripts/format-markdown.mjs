import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const [mode, ...providedPaths] = process.argv.slice(2)

if (!['--check', '--write'].includes(mode)) {
  console.error('Usage: node scripts/format-markdown.mjs <--check|--write> [file-or-directory ...]')
  process.exit(1)
}

const paths = providedPaths.filter(path => path !== '--')
const base = execFileSync('git', ['merge-base', 'HEAD', 'origin/main'], { encoding: 'utf8' }).trim()
const changedPaths = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', base], {
  encoding: 'utf8',
})
  .split('\n')
  .filter(path => /\.mdx?$/.test(path) && existsSync(path))
const inputs = paths.length > 0 ? paths : changedPaths

if (inputs.length === 0) {
  console.log('No changed Markdown or MDX files to format.')
  process.exit(0)
}

const prettier = fileURLToPath(new URL('../node_modules/prettier/bin/prettier.cjs', import.meta.url))
const result = spawnSync(process.execPath, [prettier, mode, ...inputs], { stdio: 'inherit' })
process.exit(result.status ?? 1)
