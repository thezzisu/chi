import { fork } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { deserialize, serialize } from 'node:v8'
import { createLogger } from '../../logger/index.js'
import { ForkWorkerOptions } from './common.js'

const modulePath = fileURLToPath(import.meta.url)
const logger = createLogger('core', 'worker/fork')

export function forkWorker(options: ForkWorkerOptions) {
  logger.info(
    { options },
    `Forking worker for ${options.service} using ${options.plugin}`
  )
  const payload = Buffer.from(serialize(options)).toString('base64')
  const ps = fork(
    modulePath,
    ['--plugin', options.plugin, '--service', options.service],
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
    logger.error('CHI_WORKER_OPTIONS is not defined')
    process.exit(1)
  }
  const options: ForkWorkerOptions = deserialize(Buffer.from(payload, 'base64'))
  const { bootstrap } = await import('./runtime.js')
  await bootstrap(options)
}
