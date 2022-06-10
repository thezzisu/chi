import {
  IPluginInfo,
  Type,
  TSchema,
  Static,
  TObject,
  removeUndefined
} from '@chijs/core'
import { ServiceContext } from './context/service.js'
import { PluginDescriptor } from './context/index.js'

export interface IPluginDefn<D extends PluginDescriptor>
  extends Omit<IPluginInfo, 'resolved' | 'id'> {
  main: (ctx: ServiceContext<D>, params: unknown) => unknown
}

/**
 * Define a Chi plugin
 * note: the context of main function is not typed
 * @param options Plugin definition
 */
export function definePlugin<M extends TSchema>(options: {
  params: M
  main: (ctx: ServiceContext<PluginDescriptor>, params: Static<M>) => unknown
}): IPluginDefn<PluginDescriptor> {
  return <never>{
    ...options,
    params: Object.fromEntries(
      Object.entries(options.params).map(([k, v]) => [k, Type.Strict(v)])
    )
  }
}

export class PluginBuilder<
  P extends PluginDescriptor,
  M extends TSchema = TObject<{}>
> {
  private _name?: string
  private _desc?: string
  private _params: unknown

  constructor() {
    this._params = Type.Strict(Type.Object({}))
  }

  private clone() {
    const builder = new PluginBuilder<P, M>()
    builder._params = this._params
    builder._name = this._name
    builder._desc = this._desc
    return builder
  }

  name(name: string) {
    const builder = this.clone()
    builder._name = name
    return builder
  }

  desc(desc: string) {
    const builder = this.clone()
    builder._desc = desc
    return builder
  }

  params<T extends TSchema>(schema: T): PluginBuilder<P, T> {
    const builder = this.clone()
    builder._params = Type.Strict(schema)
    return <never>builder
  }

  build(
    main: (ctx: ServiceContext<P>, params: Static<M>) => unknown
  ): IPluginDefn<P> {
    return removeUndefined({
      name: this._name,
      desc: this._desc,
      params: <never>this._params,
      main: <never>main
    })
  }
}
