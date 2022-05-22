import { fork } from 'node:child_process'
import { serialize } from 'node:v8'
import { ServiceBootstrapData } from '@chijs/runtime'
import { Logger } from 'pino'
import { workerPath } from './worker.js'
import { openSync } from 'node:fs'

export interface IForkWorkerOptions {
  data: ServiceBootstrapData
  logPath?: string
  logger?: Logger
}

export function forkWorker(options: IForkWorkerOptions) {
  const { data, logPath } = options
  const out = logPath ? openSync(logPath, 'a') : 'inherit'
  options.logger?.info(
    `Forking worker for ${data.service} using ${data.plugin}`
  )
  const payload = Buffer.from(serialize(data)).toString('base64')
  const ps = fork(
    workerPath,
    ['--plugin', data.plugin, '--service', data.service],
    {
      env: {
        CHI_WORKER_OPTIONS: payload
      },
      stdio: ['ignore', out, out, 'ipc'],
      serialization: 'advanced'
    }
  )
  return ps
}
