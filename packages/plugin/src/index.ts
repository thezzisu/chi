import { IChiPlugin, PluginBuilder, PluginTypeDescriptor } from './plugin.js'

export * from './action.js'
export * from './agent.js'
export * from './common.js'
export * from './plugin.js'
export * from './unit.js'

export type PluginDescriptorOf<T> = T extends PluginTypeDescriptor<any, any>
  ? T
  : T extends IChiPlugin<infer U>
  ? U
  : T extends PluginBuilder<infer U>
  ? U
  : never
