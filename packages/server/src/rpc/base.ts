import { RpcEndpoint, RpcTypeDescriptor } from '@chijs/rpc'
import { WithPrefix } from '@chijs/util'
import { ChiApp } from '../index.js'
import { applyActionImpl, IActionProvides, IActionPublishes } from './action.js'
import { applyMiscImpl, IMiscProvides, IMiscPublishes } from './misc.js'
import { applyPluginImpl } from './plugin.js'
import { applyServiceImpl } from './service.js'

export interface IServerProvides
  extends WithPrefix<IActionProvides, 'action:'>,
    WithPrefix<IMiscProvides, 'misc:'> {}
export interface IServerPublishes
  extends WithPrefix<IActionPublishes, 'action:'>,
    WithPrefix<IMiscPublishes, 'misc:'> {}
export type ServerDescriptor = RpcTypeDescriptor<
  WithPrefix<IServerProvides, '$s:'>,
  WithPrefix<IServerPublishes, '$s:'>
>

export function applyServerImpl(
  endpoint: RpcEndpoint<ServerDescriptor>,
  app: ChiApp
) {
  applyMiscImpl(endpoint, app)
  applyPluginImpl(endpoint, app)
  applyServiceImpl(endpoint, app)
  applyActionImpl(endpoint, app)
}
