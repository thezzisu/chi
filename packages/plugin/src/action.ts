import { RpcEndpoint, RpcTypeDescriptor } from '@chijs/rpc'
import type { ServerDescriptor } from '@chijs/server'
import {
  Awaitable,
  Logger,
  Static,
  TObject,
  TSchema,
  TUnknown,
  Type
} from '@chijs/util'
import { BaseContext, EntityBuilder, IChiPluginEntityMeta } from './common.js'

export type ActionTypeDescriptor<P extends TSchema, R extends TSchema> = {
  params: P
  result: R
}

export type ActionBaseDescriptor = ActionTypeDescriptor<TSchema, TSchema>

export interface IChiPluginAction<
  D extends ActionBaseDescriptor = ActionBaseDescriptor
> {
  meta: IChiPluginEntityMeta

  params: D['params']
  result: D['result']
}

export interface IChiPluginActionDefn<
  D extends ActionBaseDescriptor = ActionBaseDescriptor
> extends IChiPluginAction<D> {
  impl(
    ctx: ActionContext,
    params: Static<D['params']>
  ): Awaitable<Static<D['result']>>
}

export class ActionContext extends BaseContext<RpcTypeDescriptor<{}, {}>> {
  server

  constructor(
    endpoint: RpcEndpoint<RpcTypeDescriptor<{}, {}>>,
    logger: Logger,
    public readonly pluginId: string,
    public readonly actionId: string,
    public readonly taskId: string,
    public readonly jobId: string
  ) {
    super(endpoint, logger)
    this.server = endpoint.getHandle<ServerDescriptor>('@server')
  }
}

export class ActionBuilder<
  D extends ActionBaseDescriptor = ActionTypeDescriptor<TObject<{}>, TUnknown>
> extends EntityBuilder<IChiPluginActionDefn<D>> {
  private _params: TSchema
  private _result: TSchema

  constructor() {
    super()
    this._params = Type.Object({})
    this._result = Type.Unknown()
  }

  clone() {
    const clone = new ActionBuilder<D>()
    clone._params = this._params
    clone._result = this._result
    clone.meta = this.meta
    return clone as this
  }

  build(
    impl: (
      ctx: ActionContext,
      params: Static<D['params']>
    ) => Awaitable<Static<D['result']>>
  ): IChiPluginActionDefn<D> {
    const clone = this.clone()
    return {
      meta: clone.meta,
      params: clone._params,
      result: clone._result,
      impl
    }
  }

  params<T extends TSchema>(
    schema: T
  ): ActionBuilder<ActionTypeDescriptor<T, D['result']>> {
    const clone = this.clone()
    clone._params = schema
    return <any>clone
  }

  result<T extends TSchema>(
    schema: T
  ): ActionBuilder<ActionTypeDescriptor<D['params'], T>> {
    const clone = this.clone()
    clone._result = schema
    return <any>clone
  }
}
