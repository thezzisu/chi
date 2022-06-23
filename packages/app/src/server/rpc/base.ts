import { RpcEndpoint, RpcTypeDescriptor } from '@chijs/rpc'
import { WithPrefix } from '@chijs/util'
import { ChiServer } from '../index.js'
import {
  applyActionImpl,
  IActionProvides,
  ITaskProvides,
  ITaskPublishes
} from './action.js'
import { applyMiscImpl, IMiscProvides } from './misc.js'
import { applyPluginImpl, IPluginProvides } from './plugin.js'
import {
  applyServiceImpl,
  IServiceProvides,
  IServicePublishes,
  IUnitProvides
} from './service.js'

export interface IServerProvides
  extends WithPrefix<IPluginProvides, 'plugin:'>,
    WithPrefix<IUnitProvides, 'unit:'>,
    WithPrefix<IServiceProvides, 'service:'>,
    WithPrefix<IActionProvides, 'action:'>,
    WithPrefix<ITaskProvides, 'task:'>,
    WithPrefix<IMiscProvides, 'misc:'> {}

export interface IServerPublishes
  extends WithPrefix<ITaskPublishes, 'task:'>,
    WithPrefix<IServicePublishes, 'service:'> {}

export type ServerPrefix = '#server:'

export type ServerDescriptor = RpcTypeDescriptor<
  WithPrefix<IServerProvides, ServerPrefix>,
  WithPrefix<IServerPublishes, ServerPrefix>
>

export function applyServerImpl(
  endpoint: RpcEndpoint<ServerDescriptor>,
  app: ChiServer
) {
  applyMiscImpl(endpoint, app)
  applyPluginImpl(endpoint, app)
  applyServiceImpl(endpoint, app)
  applyActionImpl(endpoint, app)
}
