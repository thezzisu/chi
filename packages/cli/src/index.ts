#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { startServer } from './server.js'

const dir = dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(
  readFileSync(join(dir, '..', './package.json'), 'utf8')
)

yargs(hideBin(process.argv))
  .version(version)
  .scriptName('chi')
  .command(
    'serve <config>',
    'Start Chi Server',
    (yargs) =>
      yargs.positional('config', {
        type: 'string',
        describe: 'the path to the config file',
        demandOption: true
      }),
    (argv) => startServer(argv.config)
  )
  .demandCommand()
  .recommendCommands()
  .strict()
  .parse()
