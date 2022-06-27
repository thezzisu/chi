#!/usr/bin/env node
import chalk from 'chalk'
import spawn from 'cross-spawn'
import fs from 'fs-extra'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import prompts from 'prompts'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { confirm, askForString, err, info, warn } from './common.js'
import {
  configJs,
  configJson,
  configTs,
  configYml,
  packageJson,
  tsconfig
} from './data.js'
import { useMirror } from './net.js'

const banner = `
   _____ _     _ 
  / ____| |   (_)
 | |    | |__  _ 
 | |    | '_ \\| |
 | |____| | | | |
  \\_____|_| |_|_|
`

const dir = dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(
  readFileSync(join(dir, '..', './package.json'), 'utf8')
)

async function askForItem<T extends string>(
  message: string,
  items: T[]
): Promise<T> {
  const res = await prompts({
    type: 'select',
    name: 'value',
    message,
    choices: items.map((item) => ({ title: item, value: item }))
  })
  return res.value
}

yargs(hideBin(process.argv))
  .version(version)
  .scriptName('create-chi')
  .command(
    '$0 [dir]',
    'Create a Chi project',
    (yargs) =>
      yargs
        .positional('dir', {
          type: 'string',
          describe: 'Where to create chi project'
        })
        .option('package-manager', {
          alias: 'pm',
          describe: 'Package manager to use',
          choices: ['yarn', 'npm']
        }),
    (argv) => main(argv)
  )
  .demandCommand()
  .recommendCommands()
  .strict()
  .parse()

async function main(argv: { dir?: string; packageManager?: string }) {
  try {
    console.log(chalk.ansi256(205)(banner))
    console.log(chalk.italic.underline.whiteBright('Empower your creativity'))
    let dir = argv.dir ?? (await askForString('Where to create chi project'))
    dir = resolve(dir)
    info(`Will create Chi project in ${chalk.underline.whiteBright(dir)}`)
    if (!(await confirm('Continue'))) {
      return
    }
    if (fs.pathExistsSync(dir)) {
      warn('Target directory already exists')
      if (!(await confirm('Delete all its contents and continue'))) {
        return
      }
      fs.emptyDirSync(dir)
    }
    info(`Will make sure target directory exists`)
    fs.ensureDirSync(dir)
    process.chdir(dir)
    const pm =
      (argv.packageManager as PackageManager) ??
      (await askForItem('Which package manager to use', ['yarn', 'npm']))
    await initWorkspace()
    await createConfig()
    await installDeps(pm)
    info(chalk.greenBright('Chi project created ;D'))
  } catch (e) {
    err('An error has occurred')
    console.error(e)
    process.exit(1)
  }
}

type PackageManager = 'npm' | 'yarn'

async function initWorkspace() {
  info(`Will create package.json`)
  fs.writeFileSync('package.json', packageJson())
}

async function installDeps(pm: PackageManager) {
  const pkgs = [
    '@chijs/cli',
    '@chijs/app',
    '@chijs/ui',
    'typescript',
    'ts-node',
    'sqlite3'
  ]
  const p = pkgs.join(' ')
  const mirrorArgs: string[] = []
  if (await useMirror()) {
    mirrorArgs.push(
      '--registry=https://registry.npmmirror.com',
      '--node_sqlite3_binary_host_mirror=https://cdn.npmmirror.com/binaries/sqlite3/'
    )
  }
  const m = mirrorArgs.join(' ')
  if (pm === 'npm') {
    info(`Will execute ${chalk.underline.whiteBright(`npm install ${p} ${m}`)}`)
    spawn.sync('npm', ['install', ...pkgs, ...mirrorArgs], {
      stdio: 'inherit'
    })
  } else {
    info(`Will execute ${chalk.underline.whiteBright(`yarn add ${p} ${m}`)}`)
    spawn.sync('yarn', ['add', ...pkgs, ...mirrorArgs], {
      stdio: 'inherit'
    })
  }
}

async function createConfig() {
  info(`Will create tsconfig.json`)
  fs.writeFileSync('tsconfig.json', tsconfig())
  const type = await askForItem('Which type of config file to create', [
    'yml',
    'ts',
    'js',
    'json'
  ])
  switch (type) {
    case 'yml':
      fs.writeFileSync('chi.config.yml', configYml())
      break
    case 'ts':
      fs.writeFileSync('chi.config.ts', configTs())
      break
    case 'js':
      fs.writeFileSync('chi.config.js', configJs())
      break
    case 'json':
      fs.writeFileSync('chi.config.json', configJson())
      break
  }
  info(`Config file created`)
}
