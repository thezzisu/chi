import { fork } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { unifiedImport } from './import.js'
import { hasModule } from './utils.js'

const filepath = fileURLToPath(import.meta.url)

async function loadConfig(path: string) {
  const { default: config } = await unifiedImport(path, true)
  return config
}

export function startServer(config: string) {
  const worker = fork(filepath, [], {
    env: {
      ...process.env,
      APP_ROOT_PATH: dirname(config),
      CHI_CONFIG_PATH: config,
      NODE_OPTIONS:
        process.env.NODE_OPTIONS ??
        (hasModule('ts-node') ? '--loader ts-node/esm --no-warnings' : '')
    }
  })
  worker.on('exit', (code, signal) => {
    console.log(
      `Server exited with ` + (signal ? `signal ${signal}` : `code ${code}`)
    )
  })
}

if (process.argv[1] === filepath) {
  try {
    let path = process.env.CHI_CONFIG_PATH
    if (!path) throw new Error(`CHI_CONFIG_PATH not set`)
    path = resolve(path)
    if (!existsSync(path)) throw new Error(`Config file not found: ${path}`)
    const config = await loadConfig(path)
    const { ChiApp } = await import('@chijs/server')
    const app = new ChiApp(config)
    await app.start()
  } catch (e) {
    console.error('Server failed to start')
    console.error(e)
  }
}
