import {
  RPC,
  RpcEndpoint,
  WorkerDescriptor,
  createLogger,
  IRpcMsg
} from '@chijs/core'
import { deserialize } from 'node:v8'
import { PluginContext } from './context/plugin.js'
import { ServiceBootstrapData } from './index.js'
import { initialization, applyWorkerImpl } from './rpc.js'

const payload = process.env.CHI_WORKER_OPTIONS
if (!payload) {
  console.error('CHI_WORKER_OPTIONS is not defined')
  process.exit(1)
}
const data: ServiceBootstrapData = deserialize(Buffer.from(payload, 'base64'))

try {
  const { default: plugin } = await import(data.resolved)
  const endpoint = new RpcEndpoint<WorkerDescriptor>(
    RPC.worker(data.workerId),
    (msg) => process.send?.(msg),
    createLogger('runtime', 'rpc')
  )
  process.on('message', (msg) => endpoint.recv(<IRpcMsg>msg))
  applyWorkerImpl(endpoint)
  const ctx = new PluginContext(data, endpoint)
  await plugin.main(ctx, data.params)
  initialization.resolve()
} catch (err) {
  console.error('Bootstrap failed')
  console.error(err)
  process.exit(2)
}
