import { RpcEndpoint } from '@chijs/rpc'
import { ChiServer } from '../index.js'
import { IPluginInfo } from '../plugin/index.js'
import { ServerDescriptor } from './base.js'

export interface IPluginProvides {
  load(id: string): Promise<[ok: boolean, reason?: string]>
  unload(id: string): Promise<void>
  list(): Promise<IPluginInfo[]>
  get(id: string): Promise<IPluginInfo>
}

export function applyPluginImpl(
  endpoint: RpcEndpoint<ServerDescriptor>,
  app: ChiServer
) {
  endpoint.provide('#server:plugin:load', (id) => app.plugins.load(id))

  endpoint.provide('#server:plugin:unload', (id) => app.plugins.unload(id))

  endpoint.provide('#server:plugin:list', () => app.plugins.list())

  endpoint.provide('#server:plugin:get', (id) => app.plugins.get(id))
}
