import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { deserialize } from 'node:v8'
import { IAppServiceApiFns } from '../app/api/impl.js'
import { RpcHub } from '../rpc/hub.js'
import { PluginContext } from './context/plugin.js'
import { ServiceBootstrapData } from './index.js'
import { IWorkerRpcFns, workerBaseImpl } from './rpc.js'

const payload = process.env.CHI_WORKER_OPTIONS
if (!payload) {
  console.error('CHI_WORKER_OPTIONS is not defined')
  process.exit(1)
}
const data: ServiceBootstrapData = deserialize(Buffer.from(payload, 'base64'))

try {
  const { default: plugin } = await import(
    pathToFileURL(join(process.cwd(), data.plugin)).href
  )
  const hub = new RpcHub<IAppServiceApiFns, IWorkerRpcFns>(
    (msg) => void process.send?.(msg),
    workerBaseImpl
  )
  process.on('message', (msg) => hub.handle(<never>msg))
  const ctx = new PluginContext(hub, data)
  plugin.main(ctx, data.params)
} catch (err) {
  console.error('Bootstrap failed')
  console.error(err)
  process.exit(2)
}
