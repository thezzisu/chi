import glob from 'glob-promise'
import { basename, dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { argv, fs, chalk, cd, $ } from 'zx'

cd(join(dirname(fileURLToPath(import.meta.url)), '..'))

let packages = argv.package
  ? [join('packages', argv.package)]
  : await glob('packages/*')

packages = packages.map((x) => resolve(x))
console.log(
  `Build ${chalk.red(packages.length)} packages (${packages
    .map((p) => basename(p))
    .map((s) => chalk.green(s))
    .join(', ')})`
)

const success = [],
  fail = []

for (const path of packages) {
  cd(path)
  if (await fs.pathExists('package.json')) {
    const name = fs.readJSONSync('package.json').name
    try {
      console.log(`Building package ${chalk.green(name)}`)
      if (await fs.pathExists('scripts/build.mjs')) {
        await $`node scripts/build.mjs`
      } else {
        await fs.remove('lib')
        await $`tsc`
      }
      if (argv.tidy) {
        await fs.remove('lib/tsconfig.tsbuildinfo')
      }
      success.push(name)
    } catch {
      fail.push(name)
    }
  }
}

if (success.length) {
  console.log(`${chalk.green('Success')}: ${success.join(', ')}`)
}
if (fail.length) {
  console.log(`${chalk.red('Fail')}: ${fail.join(', ')}`)
}
