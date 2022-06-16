import { RpcEndpoint } from '@chijs/rpc'
import fs from 'fs-extra'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ChiApp } from '../index.js'
import { ServerDescriptor } from './base.js'

/** @internal */
export interface IMiscProvides {
  versions(): Promise<Record<string, string>>
  startTime(): Promise<number>
}

/** @internal */ // eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IMiscPublishes {}

const STARTUP_TIMESTAMP = Date.now()

export function applyMiscImpl(
  endpoint: RpcEndpoint<ServerDescriptor>,
  _app: ChiApp
) {
  endpoint.provide('$s:misc:versions', async () => {
    const content = await fs.readFile(
      join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'package.json')
    )
    const json = JSON.parse(content.toString())
    return { server: json.version }
  })

  endpoint.provide('$s:misc:startTime', () => STARTUP_TIMESTAMP)
}
