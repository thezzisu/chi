import { RpcEndpoint, ServerDescriptor, STARTUP_TIMESTAMP } from '@chijs/core'
import { ChiApp } from '../index.js'
import fs from 'fs-extra'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

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
