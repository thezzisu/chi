import { Descriptor, IPluginInfo, Type } from '@chijs/core'
import { PluginContext } from './context/plugin.js'

import type { TSchema, SchemaMap, MapStatic, Id } from '@chijs/core'

export interface IPluginDefn<D extends Descriptor>
  extends Omit<IPluginInfo, 'resolved' | 'id'> {
  main: (ctx: PluginContext<D>, params: Record<string, unknown>) => unknown
}

/**
 * Define a Chi plugin
 * note: the context of main function is not typed
 * @param options Plugin definition
 */
export function definePlugin<M extends SchemaMap>(options: {
  params: M
  main: (ctx: PluginContext<Descriptor>, params: MapStatic<M>) => unknown
}): IPluginDefn<Descriptor> {
  return <never>{
    ...options,
    params: Object.fromEntries(
      Object.entries(options.params).map(([k, v]) => [k, Type.Strict(v)])
    )
  }
}

export class PluginBuilder<P extends Descriptor, M = {}> {
  private params: Record<string, TSchema>

  constructor() {
    this.params = {}
  }

  private clone() {
    const builder = new PluginBuilder<P, M>()
    builder.params = { ...this.params }
    return builder
  }

  param<K extends string, T extends TSchema>(
    name: K,
    schema: T
  ): PluginBuilder<P, Id<M & { [k in K]: T }>> {
    const builder = this.clone()
    builder.params[name] = Type.Strict(schema)
    return <never>builder
  }

  build(
    main: (ctx: PluginContext<P>, params: MapStatic<M>) => unknown
  ): IPluginDefn<P> {
    return {
      params: { ...this.params },
      main: <never>main
    }
  }
}
