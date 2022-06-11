import { nanoid } from '@chijs/core'
import chalk from 'chalk'
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

export function startServer(options: {
  config: string
  managed?: boolean
  restart?: boolean
}) {
  // config: string, managed = false, restart = false
  const config = resolve(options.config)
  if (!existsSync(config)) {
    process.exit(CLI_CONFIG_NOT_FOUND)
  }
  process.chdir(dirname(config))
  const worker = fork(filepath, [], {
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

if (process.argv[1] === filepath) {
  try {
    let path = process.env.CHI_CONFIG_PATH
    if (!path) throw new Error(`CHI_CONFIG_PATH not set`)
    path = resolve(path)
    if (!existsSync(path)) throw new Error(`Config file not found: ${path}`)
    const { ChiApp } = await import('@chijs/server')
    type Config = ConstructorParameters<typeof ChiApp>[0]
    const config: Config = await loadConfig(path)
    if (config?.web?.token === '$RANDOM') {
      config.web.token = `${nanoid()}-${nanoid()}`
      console.log(`Generated token: ${chalk.yellow(config.web.token)}`)
    }
    if (config?.web?.port === -1) {
      config.web.port = await getPort()
      console.log(`Listen port: ${chalk.yellow(config.web.port)}`)
    }
    const app = new ChiApp(config)
    await app.start()
    const host = app.config.web.address ?? 'localhost'
    const port = app.config.web.port ?? 3000
    const url = `ws://${host}:${port}`
    process.send?.([
      null,
      {
        token: app.config.web.token ?? '',
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
