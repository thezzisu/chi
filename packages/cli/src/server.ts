import { uniqueId } from '@chijs/util'
import chalk from 'chalk'
import fs from 'fs-extra'
import getPort from 'get-port'
import { fork } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { unifiedImport } from './import.js'
import { hasModule } from './utils.js'

const CLI_CONFIG_NOT_FOUND = 52
const CLI_START_FAILED = 53

const WORKER_REQUEST_STOP = 0
const WORKER_REQUEST_RESTART = 61
const WORKER_START_FAILED = 62

const filepath = fileURLToPath(import.meta.url)

async function loadConfig(path: string) {
  const { default: config } = await unifiedImport(path, true)
  return config
}

function report(msg: unknown) {
  console.error(JSON.stringify(msg))
}

function resolveConfig(config?: string) {
  if (config) return resolve(config)
  const prefixes = ['chi', 'chi.conf', 'chi.config']
  const suffixes = [
    '.ts',
    '.mts',
    '.cts',
    '.js',
    '.mjs',
    '.cjs',
    '.json',
    '.json5',
    '.yml',
    '.yaml'
  ]
  return prefixes
    .map((p) => suffixes.map((s) => resolve(p + s)))
    .flat()
    .filter((path) => fs.pathExistsSync(path))[0]
}

export function startServer(options: {
  config?: string
  managed?: boolean
  restart?: boolean
}) {
  const config = resolveConfig(options.config)
  if (!config || !existsSync(config)) {
    process.exit(CLI_CONFIG_NOT_FOUND)
  }
  options.config = config
  process.chdir(dirname(config))
  const worker = fork(filepath, ['--cli-server-worker'], {
    env: {
      ...process.env,
      APP_ROOT_PATH: dirname(config),
      CHI_CONFIG_PATH: config,
      NODE_OPTIONS:
        process.env.NODE_OPTIONS ??
        (hasModule('ts-node') ? '--loader ts-node/esm --no-warnings' : '')
    },
    stdio: ['ignore', 'inherit', 'ignore', 'ipc']
  })
  worker.on('exit', (code, signal) => {
    switch (code) {
      case WORKER_REQUEST_RESTART:
        console.log(chalk.yellow('Restarting...'))
        return setImmediate(() => startServer(options))
      case WORKER_REQUEST_STOP:
        console.log(chalk.yellow('Server stopped'))
        return process.exit(0)
      case WORKER_START_FAILED:
        console.log(chalk.red('Failed to start server'))
        return process.exit(CLI_START_FAILED)
      default:
        console.log(
          `Server exited with ` + (signal ? `signal ${signal}` : `code ${code}`)
        )
        if (options.restart) {
          console.log('Restart in 5 seconds...')
          setTimeout(() => startServer(options), 5000)
        }
    }
  })
  worker.on('message', (msg) => {
    if (options.managed) {
      report(msg)
    }
  })
}

if (process.argv.includes('--cli-server-worker')) {
  try {
    let path = process.env.CHI_CONFIG_PATH
    if (!path) throw new Error(`CHI_CONFIG_PATH not set`)
    path = resolve(path)
    if (!existsSync(path)) throw new Error(`Config file not found: ${path}`)
    const { ChiServer } = await import('@chijs/app')
    type Config = ConstructorParameters<typeof ChiServer>[0]
    const config: Config = await loadConfig(path)
    if (config?.web?.token === '#RANDOM') {
      config.web.token = `${uniqueId()}-${uniqueId()}`
      console.log(`Generated token: ${chalk.yellow(config.web.token)}`)
    }
    if (config?.web?.port === -1) {
      config.web.port = await getPort()
      console.log(`Listen port: ${chalk.yellow(config.web.port)}`)
    }
    const server = new ChiServer(config)
    await server.start()
    const host = server.config.web.address ?? 'localhost'
    const port = server.config.web.port ?? 3000
    const url = `ws://${host}:${port}`
    process.send?.([
      null,
      {
        token: server.config.web.token ?? '',
        url
      }
    ])
  } catch (e) {
    console.log('Server failed to start')
    console.log(e)
    process.send?.(['' + e, null])
    process.exit(WORKER_START_FAILED)
  }
}
