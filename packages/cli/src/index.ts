#!/usr/bin/env node
import chalk from 'chalk'
import { fork } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { startServer } from './server.js'

const cwd = process.cwd()
const require = createRequire(resolve(cwd, 'index.js'))
try {
  const resolved = require.resolve('@chijs/cli')
  if (resolved === fileURLToPath(import.meta.url)) throw 0
  console.log(chalk.blue('Local Chi CLI detected.'))
  fork(resolved, { execArgv: process.argv.slice(2) })
} catch {
  const dir = dirname(fileURLToPath(import.meta.url))
  const { version } = JSON.parse(
    readFileSync(join(dir, '..', './package.json'), 'utf8')
  )

  yargs(hideBin(process.argv))
    .version(version)
    .scriptName('chi')
    .option('managed', { type: 'boolean' })
    .command(
      'serve <config>',
      'Start Chi Server',
      (yargs) =>
        yargs.positional('config', {
          type: 'string',
          describe: 'the path to the config file',
          demandOption: true
        }),
      (argv) => startServer(argv.config, argv.managed)
    )
    .demandCommand()
    .recommendCommands()
    .strict()
    .parse()
}
