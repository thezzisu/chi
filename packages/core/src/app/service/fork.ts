import { fork } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { deserialize, serialize } from 'node:v8'
import { Logger } from 'pino'
import { ServiceBootstrapData } from '../../service/index.js'

const modulePath = fileURLToPath(import.meta.url)

export interface IForkWorkerOptions {
  data: ServiceBootstrapData
  logger?: Logger
}

export function forkWorker(options: IForkWorkerOptions) {
  const { data } = options
  options.logger?.info(
    { options },
    `Forking worker for ${data.service} using ${data.plugin}`
  )
  const payload = Buffer.from(serialize(data)).toString('base64')
  const ps = fork(
    modulePath,
    ['--plugin', data.plugin, '--service', data.service],
    {
      env: {
        CHI_WORKER_OPTIONS: payload
      },
      stdio: ['ignore', 'inherit', 'inherit', 'ipc']
    }
  )
  return ps
}

if (process.argv[1] === modulePath) {
  const payload = process.env.CHI_WORKER_OPTIONS
  if (!payload) {
    console.error('CHI_WORKER_OPTIONS is not defined')
    process.exit(1)
  }
  const options: ServiceBootstrapData = deserialize(
    Buffer.from(payload, 'base64')
  )
  const { bootstrap } = await import('../../service/bootstrap.js')
  await bootstrap(options)
}
