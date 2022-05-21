import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { RpcHub } from '../rpc/hub.js'
import { ServiceBootstrapData } from './index.js'
import { workerBaseImpl } from './rpc.js'

export async function bootstrap(data: ServiceBootstrapData) {
  const { default: plugin } = await import(
    pathToFileURL(join(process.cwd(), data.plugin)).href
  )
  const hub = new RpcHub((msg) => void process.send?.(msg), workerBaseImpl)
  process.on('message', (msg) => hub.handle(<never>msg))
  // TODO: add context
  plugin.main(data.params)
}
