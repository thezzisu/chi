import { RpcEndpoint, ServerDescriptor, STARTUP_TIMESTAMP } from '@chijs/core'
import { ChiApp } from '../index.js'
import fs from 'fs-extra'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export function applyServerImpl(
  endpoint: RpcEndpoint<ServerDescriptor>,
  app: ChiApp
) {
  endpoint.provide('$s:misc:versions', async () => {
    const content = await fs.readFile(
      join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'package.json')
    )
    const json = JSON.parse(content.toString())
    return { server: json.version }
  })

  endpoint.provide('$s:misc:startTime', () => STARTUP_TIMESTAMP)

  endpoint.provide('$s:plugin:load', (id) => app.pluginRegistry.load(id))

  endpoint.provide('$s:plugin:unload', (id) => app.pluginRegistry.unload(id))

  endpoint.provide('$s:plugin:list', () => app.pluginRegistry.list())

  endpoint.provide('$s:plugin:get', (id) => app.pluginRegistry.get(id))

  endpoint.provide('$s:service:add', (defn) => app.serviceManager.add(defn))

  endpoint.provide('$s:service:update', (id, attr) =>
    app.serviceManager.update(id, attr)
  )

  endpoint.provide('$s:service:remove', (id) => app.serviceManager.remove(id))

  endpoint.provide('$s:service:start', (id) => app.serviceManager.start(id))

  endpoint.provide('$s:service:stop', (id) => app.serviceManager.stop(id))

  endpoint.provide('$s:service:list', () => app.serviceManager.list())

  endpoint.provide('$s:service:get', (id) => app.serviceManager.get(id))
}
