// @ts-check
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { argv, fs, chalk, cd, $ } from 'zx'
import { sortPackages, targetPackages } from './common.js'

cd(join(dirname(fileURLToPath(import.meta.url)), '..'))

const packages = sortPackages(await targetPackages())

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

if (argv.ci) {
  const core = await import('@actions/core')
  core.summary
    .addHeading('Build Results')
    .addQuote(
      fail.length ? `❌ ${fail.length} builds failed` : '✅ All builds passed'
    )
    .addTable([
      [
        { data: 'Package', header: true },
        { data: 'Result', header: true }
      ],
      ...fail.map((name) => [name, 'Fail ❌']),
      ...success.map((name) => [name, 'Success ✅'])
    ])
    .write()
  if (fail.length) {
    core.setFailed(`${fail.length} packages failed build`)
  }
}
