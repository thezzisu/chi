// @ts-check
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fs, chalk, cd, $ } from 'zx'
import { targetPackages } from './common.mjs'

cd(join(dirname(fileURLToPath(import.meta.url)), '..'))

const packages = await targetPackages()

const success = [],
  fail = [],
  ignored = []

for (const path of packages) {
  cd(path)
  if (await fs.pathExists('package.json')) {
    const json = fs.readJSONSync('package.json')
    const name = json.name
    if (!json.scripts?.test) {
      ignored.push(name)
      continue
    }
    try {
      console.log(`Testing package ${chalk.green(name)}`)
      if (await fs.pathExists('scripts/test.mjs')) {
        await $`node scripts/test.mjs ${process.argv.slice(2)}`
      } else {
        await $`yarn test`
      }
      success.push(name)
    } catch {
      fail.push(name)
    }
  }
}

if (ignored.length) {
  console.log(`${chalk.gray('Ignored')}: ${ignored.join(', ')}`)
}
if (success.length) {
  console.log(`${chalk.green('Success')}: ${success.join(', ')}`)
}
if (fail.length) {
  console.log(`${chalk.red('Fail')}: ${fail.join(', ')}`)
}
