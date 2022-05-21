import { TSchema } from '../utils'

export interface IPlugin {
  name: string
  params: Record<string, TSchema>
  main: (params: never) => unknown
}

export type PluginDefn = Omit<IPlugin, 'name'>

export type PluginInfo = Omit<IPlugin, 'main'>
