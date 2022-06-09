import {
  RPC,
  RpcEndpoint,
  WorkerDescriptor,
  createLogger,
  IRpcMsg
} from '@chijs/core'
import { isAbsolute } from 'node:path'
import { pathToFileURL } from 'node:url'
import { deserialize } from 'node:v8'
import { ServiceContext } from './context/service.js'
import { ServiceBootstrapData } from './index.js'
import { initialization, applyWorkerImpl } from './rpc.js'

const payload = process.env.CHI_WORKER_OPTIONS
if (!payload) {
  console.error('CHI_WORKER_OPTIONS is not defined')
  process.exit(1)
}
const data: ServiceBootstrapData = deserialize(Buffer.from(payload, 'base64'))

try {
  let resolved = data.resolved
  if (isAbsolute(resolved)) resolved = pathToFileURL(resolved).href
  const { default: plugin } = await import(resolved)
  const logger = createLogger('runtime')
  logger.level = data.level
  const endpoint = new RpcEndpoint<WorkerDescriptor>(
    RPC.worker(data.workerId),
    (msg) => process.send?.(msg),
    logger.child({ scope: 'endpoint' })
  )
  process.on('message', (msg) => endpoint.recv(<IRpcMsg>msg))
  const ctx = new ServiceContext(data, endpoint)
  applyWorkerImpl(endpoint, ctx)
  await plugin.main(ctx, data.params)
  initialization.resolve()
} catch (err) {
  console.error('Bootstrap failed')
  console.error(err)
  process.exit(2)
}
