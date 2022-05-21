import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { RpcHub } from '../../rpc/hub.js'
import { ForkWorkerOptions } from './common.js'
import { workerBaseImpl } from './rpc.js'

export async function bootstrap(options: ForkWorkerOptions) {
  const { default: plugin } = await import(
    pathToFileURL(join(process.cwd(), options.plugin)).href
  )
  const hub = new RpcHub((msg) => void process.send?.(msg), workerBaseImpl)
  process.on('message', (msg) => hub.handle(<never>msg))
  plugin.main(<never>options.params)
}
