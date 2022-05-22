import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import glob from 'glob-promise'
import { argv, fs, chalk, cd, $ } from 'zx'

cd(join(dirname(fileURLToPath(import.meta.url)), '..'))

let packages = argv.package
  ? [join('packages', argv.package)]
  : await glob('packages/*')

packages = packages.map((x) => resolve(x))
console.log(
  `Test ${chalk.red(packages.length)} packages (${packages
    .map((p) => basename(p))
    .map((s) => chalk.green(s))
    .join(', ')})`
)

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
