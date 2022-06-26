#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const dir = dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(
  readFileSync(join(dir, '..', './package.json'), 'utf8')
)

yargs(hideBin(process.argv))
  .version(version)
  .scriptName('create-chi')
  .command(
    '$0 [dir]',
    'Create a Chi project',
    (yargs) =>
      yargs.positional('dir', {
        type: 'string',
        describe: 'Where to create chi project'
      }),
    (argv) => {
      console.log(argv)
    }
  )
  .demandCommand()
  .recommendCommands()
  .strict()
  .parse()
