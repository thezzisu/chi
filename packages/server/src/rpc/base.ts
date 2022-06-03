import { RpcEndpoint, ServerDescriptor } from '@chijs/core'
import { ChiApp } from '../index.js'
import { applyActionImpl } from './action.js'
import { applyMiscImpl } from './misc.js'
import { applyPluginImpl } from './plugin.js'
import { applyServiceImpl } from './service.js'

export function applyServerImpl(
  endpoint: RpcEndpoint<ServerDescriptor>,
  app: ChiApp
) {
  applyMiscImpl(endpoint, app)
  applyPluginImpl(endpoint, app)
  applyServiceImpl(endpoint, app)
  applyActionImpl(endpoint, app)
}
