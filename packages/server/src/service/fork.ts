import { fork } from 'node:child_process'
import { serialize } from 'node:v8'
import { ServiceBootstrapData } from '@chijs/runtime'
import { Logger } from 'pino'
import { workerPath } from './worker.js'

export interface IForkWorkerOptions {
  data: ServiceBootstrapData
  logger?: Logger
}

export function forkWorker(options: IForkWorkerOptions) {
  const { data } = options
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
      stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
      serialization: 'advanced'
    }
  )
  return ps
}
