import { RpcBaseDescriptor, RpcEndpoint, RpcTypeDescriptor } from '@chijs/rpc'
import {
  Logger,
  Static,
  TObject,
  TSchema,
  Type,
  TypeBuilder
} from '@chijs/util'
import { BaseContext, EntityBuilder, IChiPluginEntityMeta } from './common.js'
import { PluginBaseDescriptor } from './plugin.js'

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
  impl(ctx: UnitContext<D>, params: Static<D['params']>): unknown
}

export class UnitContext<
  D extends UnitBaseDescriptor,
  P extends PluginBaseDescriptor = PluginBaseDescriptor
> extends BaseContext<P, D> {
  constructor(
    endpoint: RpcEndpoint<RpcTypeDescriptor<{}, {}>>,
    logger: Logger,
    params: Static<P['params']>,
    pluginId: string,
    public readonly unitId: string,
    public readonly serviceId: string
  ) {
    super(endpoint, logger, params, pluginId)
  }
}

export class UnitBuilder<
  P extends PluginBaseDescriptor,
  D extends UnitBaseDescriptor = UnitTypeDescriptor<{}, {}, TObject<{}>>
> extends EntityBuilder<IChiPluginUnitDefn<D>> {
  private _params: TSchema

  constructor() {
    super()
    this._params = Type.Strict(Type.Object({}))
  }

  clone() {
    const clone = new UnitBuilder<P, D>()
    clone._params = this._params
    clone.meta = this.meta
    return clone as this
  }

  build(
    impl: (ctx: UnitContext<D, P>, params: Static<D['params']>) => unknown
  ): IChiPluginUnitDefn<D> {
    const clone = this.clone()
    return {
      meta: clone.meta,
      params: clone._params,
      impl
    }
  }

  attach<D1 extends RpcBaseDescriptor>(): UnitBuilder<
    P,
    UnitTypeDescriptor<D1['provide'], D1['publish'], D['params']>
  > {
    return this
  }

  params<T extends TSchema>(
    schema: T | ((builder: TypeBuilder) => T)
  ): UnitBuilder<P, UnitTypeDescriptor<D['provide'], D['publish'], T>> {
    const clone = this.clone()
    clone._params = Type.Strict(
      schema instanceof Function ? schema(Type) : schema
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <any>clone
  }
}
