// @ts-check
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fs, chalk, cd, $, argv } from 'zx'
import { targetPackages } from './common.js'

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
    if (!json.scripts?.lint) {
      ignored.push(name)
      continue
    }
    try {
      console.log(`Linting package ${chalk.green(name)}`)
      await $`yarn lint`
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

if (argv.ci) {
  const core = await import('@actions/core')
  core.summary
    .addHeading('Lint Results')
    .addQuote(fail.length ? `❌ ${fail.length} failed` : '✅ All passed')
    .addTable([
      [
        { data: 'Package', header: true },
        { data: 'Result', header: true }
      ],
      ...fail.map((name) => [name, 'Fail ❌']),
      ...success.map((name) => [name, 'Success ✅']),
      ...ignored.map((name) => [name, 'Ignored ➖'])
    ])
    .write()
  if (fail.length) {
    core.setFailed(`${fail.length} packages failed`)
  }
}
