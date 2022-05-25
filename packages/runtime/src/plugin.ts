import { IPluginInfo, Type } from '@chijs/core'
import { PluginContext } from './context/plugin.js'

import type { TSchema, SchemaMap, MapStatic, Id } from '@chijs/core'

export interface IPluginDefn extends Omit<IPluginInfo, 'resolved' | 'name'> {
  main: (
    ctx: PluginContext<unknown>,
    params: Record<string, unknown>
  ) => unknown
}

export function definePlugin<M extends SchemaMap>(options: {
  params: M
  main: (ctx: PluginContext<unknown>, params: MapStatic<M>) => unknown
}): IPluginDefn {
  return <never>{
    ...options,
    params: Object.fromEntries(
      Object.entries(options.params).map(([k, v]) => [k, Type.Strict(v)])
    )
  }
}

export class PluginBuilder<P = {}, M = {}> {
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
  ): IPluginDefn {
    return {
      params: { ...this.params },
      main: <never>main
    }
  }
}
