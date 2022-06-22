import { RpcEndpoint } from '@chijs/rpc'
import fs from 'fs-extra'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ChiServer } from '../index.js'
import { ServerDescriptor } from './base.js'

/** @internal */
export interface IMiscProvides {
  versions(): Promise<Record<string, string>>
  startTime(): Promise<number>
}

const STARTUP_TIMESTAMP = Date.now()

export function applyMiscImpl(
  endpoint: RpcEndpoint<ServerDescriptor>,
  _app: ChiServer
) {
  endpoint.provide('#server:misc:versions', async () => {
    const content = await fs.readFile(
      join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'package.json')
    )
    const json = JSON.parse(content.toString())
    return { server: json.version }
  })

  endpoint.provide('#server:misc:startTime', () => STARTUP_TIMESTAMP)
}
