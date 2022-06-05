// @ts-check
import { basename, join, resolve } from 'node:path'
import glob from 'glob-promise'
import { argv, chalk, fs } from 'zx'

export async function targetPackages() {
  /** @type {string[]} */
  let packages = []

  if (argv.package) {
    packages = argv.package instanceof Array ? argv.package : [argv.package]
    packages = packages.map((p) => join('packages', p))
  } else {
    packages = await glob('packages/*')
  }

  if (argv.exclude) {
    /** @type {string[]} */
    let exclude = argv.exclude instanceof Array ? argv.exclude : [argv.exclude]
    packages = packages.filter((x) => !exclude.includes(basename(x)))
  }

  packages = packages.map((x) => resolve(x))
  console.log(
    `Targeting ${chalk.red(packages.length)} packages (${packages
      .map((p) => basename(p))
      .map((s) => chalk.green(s))
      .join(', ')})`
  )
  return packages
}

/**
 * @param {string[]} packages
 */
export function sortPackages(packages) {
  const nodes = packages
    .filter((p) => fs.existsSync(join(p, 'package.json')))
    .map((p) => [p, fs.readJsonSync(join(p, 'package.json'))])
    .map(([resolved, { name, dependencies, devDependencies }]) => ({
      resolved,
      name,
      deps: [
        ...[
          ...Object.keys(dependencies ?? {}),
          ...Object.keys(devDependencies ?? {})
        ].filter((x) => x.startsWith('@chijs'))
      ]
    }))
  const deg = Array(nodes.length).fill(0)
  for (const node of nodes) {
    for (const dep of node.deps) {
      const index = nodes.findIndex((x) => x.name === dep)
      if (index >= 0) deg[index]++
    }
  }
  const queue = []
  for (let i = 0; i < nodes.length; i++) {
    if (deg[i] === 0) queue.push(i)
  }
  const sorted = []
  while (queue.length) {
    const index = queue.shift()
    sorted.push(nodes[index])
    for (const dep of nodes[index].deps) {
      const index = nodes.findIndex((x) => x.name === dep)
      if (index >= 0) {
        deg[index]--
        if (deg[index] === 0) queue.push(index)
      }
    }
  }
  sorted.reverse()
  console.log(
    `Topologically order: ${sorted.map((s) => chalk.green(s.name)).join(', ')}`
  )
  return sorted.map((x) => x.resolved)
}
