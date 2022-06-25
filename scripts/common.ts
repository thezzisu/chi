/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { basename, join, resolve } from 'node:path'
import { argv, chalk, fs } from 'zx'
import _glob from 'glob'

export function glob(pattern: string, options: _glob.IOptions = {}) {
  return new Promise<string[]>((resolve, reject) =>
    _glob(pattern, options, (err, files) =>
      err ? reject(err) : resolve(files)
    )
  )
}

export async function targetPackages() {
  /** @type {string[]} */
  let packages = []

  if (argv.package) {
    packages = argv.package instanceof Array ? argv.package : [argv.package]
    packages = packages
      .flatMap((p) => [join('packages', p), join('plugins', p)])
      .filter((p) => fs.pathExistsSync(p))
  } else {
    packages = [await glob('packages/*'), await glob('plugins/*')].flat()
  }

  if (argv.exclude) {
    /** @type {string[]} */
    const exclude =
      argv.exclude instanceof Array ? argv.exclude : [argv.exclude]
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

export function sortPackages(packages: string[]) {
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
    const index = queue.shift()!
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
    `Topo order: ${sorted.map((s) => chalk.green(s.name)).join(', ')}`
  )
  return sorted.map((x) => x.resolved)
}
