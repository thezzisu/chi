import {
  createRpcWrapper,
  RpcBaseDescriptor,
  RpcEndpoint,
  RpcHandle,
  RpcId
} from '@chijs/rpc'
import type { Logger, Static } from '@chijs/util'
import { SERVER_RPCID } from '../common/index.js'
import { IPluginDescriptors } from '../injections.js'
import { ServerDescriptor } from '../server/index.js'
import { ServiceRestartPolicy } from '../server/service/index.js'
import { TrustMe } from '../util/index.js'
import { ActionBaseDescriptor, ActionContext } from './action.js'
import { PluginBaseDescriptor } from './plugin.js'
import { UnitBaseDescriptor } from './unit.js'

export interface IChiPluginEntityMeta {
  name?: string
  description?: string

  [key: string]: unknown
}

export type InjectedPluginDescriptor<P extends string> =
  P extends keyof IPluginDescriptors
    ? IPluginDescriptors[P] extends PluginBaseDescriptor
      ? IPluginDescriptors[P]
      : PluginBaseDescriptor
    : PluginBaseDescriptor

export class ServiceHandler<D extends UnitBaseDescriptor> {
  constructor(
    private readonly ctx: BaseContext<PluginBaseDescriptor, RpcBaseDescriptor>,
    private readonly unit: UnitHandler<D>,
    public readonly id: string
  ) {}

  async getHandle(): Promise<RpcHandle<D>> {
    const info = await this.ctx.api.service.get(this.id)
    if (!info) throw new Error(`Service ${this.id} not found`)
    if (!info.rpcId) throw new Error(`Service ${this.id} not started`)
    return this.ctx.endpoint.getHandle(info.rpcId)
  }
}

export class UnitHandler<D extends UnitBaseDescriptor> {
  constructor(
    private readonly ctx: BaseContext<PluginBaseDescriptor, RpcBaseDescriptor>,
    private readonly plugin: PluginHandler<PluginBaseDescriptor>,
    public readonly id: string
  ) {}

  async create(
    id: string,
    params: Static<D['params']>,
    restartPolicy?: ServiceRestartPolicy
  ): Promise<ServiceHandler<D>> {
    this.ctx.api.service.add(id, this.plugin.id, this.id, params, restartPolicy)
    return new ServiceHandler(this.ctx, this, id)
  }

  service(id: string): ServiceHandler<D> {
    return new ServiceHandler(this.ctx, this, id)
  }
}

export class ActionHandler<D extends ActionBaseDescriptor> {
  constructor(
    private readonly ctx: BaseContext<PluginBaseDescriptor, RpcBaseDescriptor>,
    private readonly plugin: PluginHandler<PluginBaseDescriptor>,
    public readonly id: string
  ) {}

  run(params: Static<D['params']>): Promise<Static<D['result']>> {
    if (this.ctx instanceof ActionContext) {
      return this.ctx.api.action.run(
        this.ctx.taskId,
        this.ctx.jobId,
        this.plugin.id,
        this.id,
        params
      )
    }
    throw new Error('ActionHandler.run() can only be called from ActionContext')
  }

  dispatch(initiator: RpcId, params: Static<D['params']>): Promise<string> {
    return this.ctx.api.action.dispatch(
      initiator,
      this.plugin.id,
      this.id,
      params
    )
  }
}

export class PluginHandler<D extends PluginBaseDescriptor> {
  constructor(
    private readonly ctx: BaseContext<PluginBaseDescriptor, RpcBaseDescriptor>,
    public readonly id: string
  ) {}

  unit<K extends keyof D['units']>(
    id: K
  ): UnitHandler<TrustMe<D['units'][K], UnitBaseDescriptor>> {
    return new UnitHandler(this.ctx, this, <string>id)
  }

  action<K extends keyof D['actions']>(
    id: K
  ): ActionHandler<TrustMe<D['units'][K], ActionBaseDescriptor>> {
    return new ActionHandler(this.ctx, this, <string>id)
  }
}

export class BaseContext<
  P extends PluginBaseDescriptor,
  D extends RpcBaseDescriptor
> {
  readonly server
  readonly api

  constructor(
    public readonly endpoint: RpcEndpoint<D>,
    public readonly logger: Logger,
    public readonly params: Static<P['params']>
  ) {
    this.server = endpoint.getHandle<ServerDescriptor>(SERVER_RPCID)
    this.api = {
      service: createRpcWrapper(this.server, '#server:service:'),
      plugin: createRpcWrapper(this.server, '#server:plugin:'),
      misc: createRpcWrapper(this.server, '#server:misc:'),
      action: createRpcWrapper(this.server, '#server:action:'),
      task: createRpcWrapper(this.server, '#server:task:')
    }
  }

  plugin<
    K extends string,
    T extends PluginBaseDescriptor = InjectedPluginDescriptor<K>
  >(id: K): PluginHandler<T> {
    return new PluginHandler(this, id)
  }
}

export abstract class EntityBuilder<T> {
  meta: IChiPluginEntityMeta

  constructor() {
    this.meta = {}
  }

  name(name: string): this {
    const clone = this.clone()
    clone.meta.name = name
    return clone
  }

  description(description: string): this {
    const clone = this.clone()
    clone.meta.description = description
    return clone
  }

  abstract clone(): this
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract build(...args: any[]): T
}
