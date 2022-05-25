import { TSchema } from '../utils/index.js'

export interface IServiceInfo {
  id: string
  plugin: string
  params: Record<string, unknown>
  running: boolean
  logPath: string
}

export interface IPluginInfo {
  id: string
  params: Record<string, TSchema>
  resolved: string
}

export interface IServerBaseRpcFns {
  ['app:misc:versions'](): Record<string, string>
  ['app:misc:startTime'](): number

  ['app:plugin:load'](mod: string): void
  ['app:plugin:list'](): IPluginInfo[]

  ['app:service:add'](
    plugin: string,
    id: string,
    params: Record<string, unknown>
  ): void
  ['app:service:update'](id: string, params: Record<string, unknown>): void
  ['app:service:remove'](id: string): void
  ['app:service:start'](id: string): void
  ['app:service:stop'](id: string): void
  ['app:service:call'](id: string, method: string, ...args: unknown[]): unknown
  ['app:service:exec'](id: string, method: string, ...args: unknown[]): unknown
  ['app:service:list'](): IServiceInfo[]
}

export interface IServerClientRpcFns extends IServerBaseRpcFns {
  ['app:misc:readFile'](path: string): ArrayBuffer
}

export interface IServerWorkerRpcFns extends IServerBaseRpcFns {
  ['app:client:call'](id: string, method: string, ...args: unknown[]): unknown
  ['app:client:exec'](id: string, method: string, ...args: unknown[]): unknown
}
