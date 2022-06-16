import { RpcBaseDescriptor, RpcEndpoint } from '@chijs/rpc'
import type { Logger, Static } from '@chijs/util'
import type { ServerDescriptor } from '@chijs/server'
import { PluginBaseDescriptor } from './plugin'

export interface IChiPluginEntityMeta {
  name?: string
  description?: string

  [key: string]: unknown
}

export class BaseContext<
  P extends PluginBaseDescriptor,
  D extends RpcBaseDescriptor
> {
  server

  constructor(
    public readonly endpoint: RpcEndpoint<D>,
    public readonly logger: Logger,
    public readonly params: Static<P['params']>
  ) {
    this.server = endpoint.getHandle<ServerDescriptor>('@server')
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
  abstract build(...args: any[]): T
}
