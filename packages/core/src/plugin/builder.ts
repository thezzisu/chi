import { MapStatic, SchemaMap } from '../utils'
import { PluginDefn } from './common'

export function definePlugin<M extends SchemaMap>(options: {
  params: M
  main: (params: MapStatic<M>) => unknown
}): PluginDefn {
  return options
}
