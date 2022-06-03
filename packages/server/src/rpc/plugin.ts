import { RpcEndpoint, ServerDescriptor } from '@chijs/core'
import { ChiApp } from '../index.js'

export function applyPluginImpl(
  endpoint: RpcEndpoint<ServerDescriptor>,
  app: ChiApp
) {
  endpoint.provide('$s:plugin:load', (id) => app.plugins.load(id))

  endpoint.provide('$s:plugin:unload', (id) => app.plugins.unload(id))

  endpoint.provide('$s:plugin:list', () => app.plugins.list())

  endpoint.provide('$s:plugin:get', (id) => app.plugins.get(id))
}
