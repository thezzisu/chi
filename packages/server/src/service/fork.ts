import fs from 'fs-extra'
import { fork } from 'node:child_process'
import { serialize } from 'node:v8'
import { dirname } from 'node:path'
import { ServiceBootstrapData } from '@chijs/runtime'
import { Logger } from 'pino'
import { workerPath } from './worker.js'

export interface IForkWorkerOptions {
  data: ServiceBootstrapData
  logPath?: string
  logger?: Logger
}

export function forkWorker(options: IForkWorkerOptions) {
  const { data, logPath } = options
  if (logPath) {
    fs.ensureDirSync(dirname(logPath))
  }
  const out = logPath ? fs.openSync(logPath, 'a') : 'inherit'
  options.logger?.info(
    `Forking worker for ${data.service} using ${data.plugin}`
  )
  const payload = Buffer.from(serialize(data)).toString('base64')
  const ps = fork(
    workerPath,
    ['--plugin', data.plugin, '--service', data.service],
    {
      env: {
        CHI_WORKER_OPTIONS: payload,
        NODE_OPTIONS: process.env.NODE_OPTIONS ?? '--loader ts-node/esm'
      },
      stdio: ['ignore', out, out, 'ipc'],
      serialization: 'advanced'
    }
  )
  return ps
}
