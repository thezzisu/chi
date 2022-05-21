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
  main: (ctx: IPluginContext, params: MapStatic<M>) => unknown
}): IPluginDefn {
  return {
    ...options,
    params: Object.fromEntries(
      Object.entries(options.params).map(([k, v]) => [k, Type.Strict(v)])
    )
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export class PluginBuilder<M = {}> {
  private params: Record<string, TSchema>

  constructor() {
    this.params = {}
  }

  private clone() {
    const builder = new PluginBuilder<M>()
    builder.params = { ...this.params }
    return builder
  }

  param<K extends string, T extends TSchema>(
    name: K,
    schema: T
  ): PluginBuilder<Id<M & { [k in K]: T }>> {
    const builder = this.clone()
    builder.params[name] = Type.Strict(schema)
    return <never>builder
  }

  build(
    main: (ctx: IPluginContext, params: MapStatic<M>) => unknown
  ): IPluginDefn {
    return {
      params: { ...this.params },
      main: main
    }
  }
}
