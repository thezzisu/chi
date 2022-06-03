import {
  IPluginInfo,
  Type,
  TSchema,
  SchemaMap,
  MapStatic,
  Id
} from '@chijs/core'
import { ServiceContext } from './context/service.js'
import { Descriptor } from './context/index.js'

export interface IPluginDefn<D extends Descriptor>
  extends Omit<IPluginInfo, 'resolved' | 'id'> {
  main: (ctx: ServiceContext<D>, params: Record<string, unknown>) => unknown
}

/**
 * Define a Chi plugin
 * note: the context of main function is not typed
 * @param options Plugin definition
 */
export function definePlugin<M extends SchemaMap>(options: {
  params: M
  main: (ctx: ServiceContext<Descriptor>, params: MapStatic<M>) => unknown
}): IPluginDefn<Descriptor> {
  return <never>{
    ...options,
    params: Object.fromEntries(
      Object.entries(options.params).map(([k, v]) => [k, Type.Strict(v)])
    )
  }
}

export class PluginBuilder<P extends Descriptor, M = {}> {
  private _name?: string
  private _desc?: string
  private _params: Record<string, TSchema>

  constructor() {
    this._params = {}
  }

  private clone() {
    const builder = new PluginBuilder<P, M>()
    builder._params = { ...this._params }
    builder._name = this._name
    builder._desc = this._desc
    return builder
  }

  name(name: string) {
    this._name = name
  }

  desc(desc: string) {
    this._desc = desc
  }

  param<K extends string, T extends TSchema>(
    name: K,
    schema: T
  ): PluginBuilder<P, Id<M & { [k in K]: T }>> {
    const builder = this.clone()
    builder._params[name] = Type.Strict(schema)
    return <never>builder
  }

  build(
    main: (ctx: ServiceContext<P>, params: MapStatic<M>) => unknown
  ): IPluginDefn<P> {
    return {
      name: this._name,
      desc: this._desc,
      params: { ...this._params },
      main: <never>main
    }
  }
}
