import { ChildProcess, spawn } from 'child_process'
import { createRequire } from 'module'
import { basename, dirname, join, resolve } from 'path'
import * as readline from 'node:readline'
import which from 'which'
import { Readable } from 'stream'
import { ipcMain, Notification } from 'electron'

export interface IChiProcessOptions {
  config: string
  name?: string
  node?: string
  restart?: boolean
}

export interface IProcessMeta {
  info: IProcessAccessInfo
  restart: boolean
}

const processes = new Map<string, ChildProcess>()
const metas = new WeakMap<ChildProcess, IProcessMeta>()

export interface IProcessAccessInfo {
  url: string
  token: string
}

export async function startServer(
  options: IChiProcessOptions
): Promise<[unknown, IProcessAccessInfo | null]> {
  try {
    const config = resolve(options.config)
    if (processes.has(config)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const meta = metas.get(processes.get(config)!)
      if (meta) return [null, meta.info]
      throw new Error(`Process for ${config} already exists`)
    }
    const base = dirname(config)
    const require = createRequire(join(base, 'resolver'))
    const cli = require.resolve('@chijs/cli')
    const node = options.node ?? (await which('node'))
    const process = spawn(node, [cli, 'serve', config, '--managed'], {
      stdio: ['ignore', 'ignore', 'pipe'],
      shell: true
    })
    processes.set(config, process)
    const info = await new Promise<IProcessAccessInfo>((resolve, reject) => {
      const stream = <Readable>process.stderr
      const rl = readline.createInterface({ input: stream })
      rl.once('line', (line) => {
        try {
          resolve(JSON.parse(line))
        } catch (e) {
          process.kill()
          reject(e)
        }
      })
      process.once('exit', (code, signal) => {
        reject(new Error(signal ? `signal ${signal}` : `code ${code}`))
      })
    })
    process.on('close', (code, signal) => {
      processes.delete(config)
      new Notification({
        title: 'Instance Stopped',
        body:
          `${options.name ?? basename(config)} stopped with ` +
          (signal ? `signal ${signal}` : `code ${code}`)
      }).show()
    })
    metas.set(process, { info, restart: options.restart ?? false })
    return [null, info]
  } catch (e) {
    return [e, null]
  }
}

export async function stopServer(config: string) {
  config = resolve(config)
  const process = processes.get(config)
  if (!process) return
  process.kill()
}

ipcMain.handle('startServer', (event, options: IChiProcessOptions) => {
  return startServer(options)
})

ipcMain.handle('stopServer', (event, config: string) => {
  stopServer(config)
})