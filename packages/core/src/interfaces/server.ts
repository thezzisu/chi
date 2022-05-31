import { RpcTypeDescriptor } from '../rpc/index.js'
import { TSchema } from '../utils/index.js'

export interface IServiceInfo {
  id: string
  plugin: string
  params: Record<string, unknown>
  running: boolean
  logPath: string
  workerId?: string
}

export interface IPluginInfo {
  id: string
  params: Record<string, TSchema>
  resolved: string
}

export type ServerDescriptor = RpcTypeDescriptor<
  {
    ['$s:misc:versions'](): Record<string, string>
    ['$s:misc:startTime'](): number

    ['$s:plugin:load'](mod: string): [ok: boolean, reason?: string]
    ['$s:plugin:list'](): IPluginInfo[]
    ['$s:plugin:get'](id: string): IPluginInfo

    ['$s:service:add'](
      plugin: string,
      id: string,
      params: Record<string, unknown>
    ): void
    ['$s:service:update'](id: string, params: Record<string, unknown>): void
    ['$s:service:remove'](id: string): void
    ['$s:service:start'](id: string): void
    ['$s:service:stop'](id: string): void
    ['$s:service:list'](): IServiceInfo[]
    ['$s:service:get'](id: string): IServiceInfo
  },
  {}
>
