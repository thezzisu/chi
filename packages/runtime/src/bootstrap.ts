import { IServerWorkerRpcFns, IWorkerRpcFns, RpcHub } from '@chijs/core'
import { deserialize } from 'node:v8'
import { PluginContext } from './context/plugin.js'
import { ServiceBootstrapData } from './index.js'
import { initialization, workerBaseImpl } from './rpc.js'

const payload = process.env.CHI_WORKER_OPTIONS
if (!payload) {
  console.error('CHI_WORKER_OPTIONS is not defined')
  process.exit(1)
}
const data: ServiceBootstrapData = deserialize(Buffer.from(payload, 'base64'))

try {
  const { default: plugin } = await import(data.resolved)
  const hub = new RpcHub<IServerWorkerRpcFns, IWorkerRpcFns>(
    (msg) => void process.send?.(msg),
    workerBaseImpl
  )
  process.on('message', (msg) => hub.handle(<never>msg))
  const ctx = new PluginContext(hub, data)
  await plugin.main(ctx, data.params)
  initialization.resolve()
} catch (err) {
  console.error('Bootstrap failed')
  console.error(err)
  process.exit(2)
}
