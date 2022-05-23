import {
  TSchema,
  SchemaMap,
  MapStatic,
  Id,
  IPluginDefn,
  IPluginContext,
  Type
} from '@chijs/core'

export function definePlugin<M extends SchemaMap>(options: {
  params: M
  main: <P>(ctx: IPluginContext<P>, params: MapStatic<M>) => unknown
}): IPluginDefn {
  return {
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
    main: (ctx: IPluginContext<P>, params: MapStatic<M>) => unknown
  ): IPluginDefn {
    return {
      params: { ...this.params },
      main: main
    }
  }
}
