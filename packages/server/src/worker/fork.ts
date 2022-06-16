import fs from 'fs-extra'
import { fork } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Logger } from '@chijs/util'
import { RpcId } from '@chijs/rpc'
import minimist from 'minimist'

export interface IWorkerOptions {
  rpcId: RpcId
}

export interface IForkWorkerOptions extends IWorkerOptions {
  rpcId: RpcId
  logPath?: string
  logger?: Logger
}

export const workerPath = fileURLToPath(import.meta.url)

export function forkWorker(options: IForkWorkerOptions) {
  const { logPath } = options
  logPath && fs.ensureDirSync(dirname(logPath))
  const out = logPath ? fs.openSync(logPath, 'a') : 'inherit'
  options.logger?.info(`Forking worker`)
  const ps = fork(workerPath, ['--worker', '--rpcId', options.rpcId], {
    env: {
      ...process.env
    },
    stdio: ['ignore', out, out, 'ipc'],
    serialization: 'advanced'
  })
  return ps
}

const args = minimist(process.argv.slice(2))
if (args.worker) {
  const { boot } = await import('./boot.js')
  boot(<never>args)
}
