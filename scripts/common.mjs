// @ts-check
import { basename, join, resolve } from 'node:path'
import glob from 'glob-promise'
import { argv, chalk } from 'zx'

export async function targetPackages() {
  /** @type {string[]} */
  let packages = []

  if (argv.package) {
    packages = argv.package instanceof Array ? argv.package : [argv.package]
    packages = packages.map((p) => join('packages', p))
  } else {
    packages = await glob('packages/*')
  }

  if (argv.exlude) {
    /** @type {string[]} */
    let exlude = argv.exlude instanceof Array ? argv.exlude : [argv.exlude]
    packages = packages.filter((x) => !exlude.includes(basename(x)))
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
