import { fork } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { ChiApp, loadConfig } from '@chijs/server'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const filepath = fileURLToPath(import.meta.url)

export function startServer(config: string) {
  const worker = fork(filepath, [], {
    env: {
      CHI_CONFIG_PATH: config,
      NODE_OPTIONS: process.env.NODE_OPTIONS ?? '--loader ts-node/esm'
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
    const app = new ChiApp(config)
    await app.start()
  } catch (e) {
    console.error('Server failed to start')
    console.error(e)
  }
}
