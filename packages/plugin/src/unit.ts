import { RpcBaseDescriptor, RpcEndpoint, RpcTypeDescriptor } from '@chijs/rpc'
import type { ServerDescriptor } from '@chijs/server'
import { Logger, Static, TObject, TSchema, Type } from '@chijs/util'
import { EntityBuilder, IChiPluginEntityMeta } from './common.js'

export type UnitTypeDescriptor<A, B, P extends TSchema> = RpcTypeDescriptor<
  A,
  B
> & { params: P }

export type UnitBaseDescriptor = UnitTypeDescriptor<{}, {}, TSchema>

export interface IChiPluginUnit<
  D extends UnitBaseDescriptor = UnitBaseDescriptor
> {
  meta: IChiPluginEntityMeta

  params: D['params']
}

export interface IChiPluginUnitDefn<
  D extends UnitBaseDescriptor = UnitBaseDescriptor
> extends IChiPluginUnit<D> {
  impl(ctx: UnitContext, params: Static<D['params']>): unknown
}

export class UnitContext {
  server

  constructor(
    public readonly endpoint: RpcEndpoint<RpcTypeDescriptor<{}, {}>>,
    public readonly logger: Logger,
    public readonly pluginId: string,
    public readonly unitId: string,
    public readonly serviceId: string
  ) {
    this.server = endpoint.getHandle<ServerDescriptor>('@server')
  }
}

export class UnitBuilder<
  D extends UnitBaseDescriptor = UnitTypeDescriptor<{}, {}, TObject<{}>>
> extends EntityBuilder<IChiPluginUnitDefn<D>> {
  private _params: TSchema

  constructor() {
    super()
    this._params = Type.Object({})
  }

  clone() {
    const clone = new UnitBuilder<D>()
    clone._params = this._params
    clone.meta = this.meta
    return clone as this
  }

  build(
    impl: (ctx: UnitContext, params: Static<D['params']>) => unknown
  ): IChiPluginUnitDefn<D> {
    const clone = this.clone()
    return {
      meta: clone.meta,
      params: clone._params,
      impl
    }
  }

  attach<D1 extends RpcBaseDescriptor>(): UnitBuilder<
    UnitTypeDescriptor<D1['provide'], D1['publish'], D['params']>
  > {
    return this
  }

  params<T extends TSchema>(
    schema: T
  ): UnitBuilder<UnitTypeDescriptor<D['provide'], D['publish'], T>> {
    const clone = this.clone()
    clone._params = schema
    return <any>clone
  }
}
