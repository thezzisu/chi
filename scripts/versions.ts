// @ts-check
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fs, cd, chalk, argv } from 'zx'
import glob from 'glob-promise'

cd(join(dirname(fileURLToPath(import.meta.url)), '..'))

async function getPackages() {
  const packages = [await glob('packages/*'), await glob('plugins/*')].flat()
  return packages
    .filter((p) => fs.existsSync(join(p, 'package.json')))
    .map((p) => [p, fs.readJsonSync(join(p, 'package.json'))])
}

const packages = await getPackages()
const nodes = Object.fromEntries(
  packages.map((p) => {
    const [
      path,
      { name, version, dependencies, devDependencies, peerDependencies }
    ] = p
    const deps = [
      ...Object.keys(dependencies ?? {}),
      ...Object.keys(devDependencies ?? {}),
      ...Object.keys(peerDependencies ?? {})
    ]
      .filter((x) => x.startsWith('@chijs'))
      .map((x) => ({
        name: x,
        version: dependencies[x] ?? devDependencies[x] ?? peerDependencies[x]
      }))
    return [name, { name, version, path, deps }]
  })
)

if (argv.list) {
  for (const name of Object.keys(nodes)) {
    console.group(`${chalk.blue(name)}@${chalk.green(nodes[name].version)}`)
    if (nodes[name].deps.length) {
      for (const dep of nodes[name].deps) {
        console.log(`${chalk.yellow(dep.name)}@${chalk.green(dep.version)}`)
      }
    } else {
      console.log('No dependencies')
    }
    console.groupEnd()
  }
}

const problems = []

for (const name of Object.keys(nodes)) {
  for (const dep of nodes[name].deps) {
    if (!nodes[dep.name]) {
      problems.push(
        `${name} depends on ${dep.name} but it is not in the list of packages`
      )
    }
    if (nodes[dep.name].version !== dep.version.substring(1)) {
      problems.push(
        `${chalk.blue(name)} > ${chalk.yellow(dep.name)}: ` +
          `${chalk.red(dep.version)} -> ${chalk.green(nodes[dep.name].version)}`
      )
    }
  }
}

if (problems.length) {
  for (const problem of problems) console.log(problem)
  if (argv.fix) {
    for (const name of Object.keys(nodes)) {
      for (const dep of nodes[name].deps) {
        if (nodes[dep.name].version !== dep.version.substring(1)) {
          console.log(`Fixing ${chalk.blue(name)} > ${chalk.yellow(dep.name)}`)
          const path = join(nodes[name].path, 'package.json')
          fs.writeFileSync(
            path,
            fs
              .readFileSync(path, 'utf-8')
              .replace(
                `"${dep.name}": "${dep.version}"`,
                `"${dep.name}": "^${nodes[dep.name].version}"`
              )
          )
        }
      }
    }
  }
} else {
  console.log(chalk.green('No problems found.'))
}
