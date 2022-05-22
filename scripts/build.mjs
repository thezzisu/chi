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
        await $`node scripts/build.mjs ${process.argv.slice(2)}`
      } else {
        if (argv.rebuild) {
          await fs.remove('lib')
          await fs.remove('tsconfig.tsbuildinfo')
        }
        if (argv.w || argv.watch) {
          $`tsc -w`
        } else {
          await $`tsc`
        }
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
