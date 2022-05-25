import { TSchema } from '../utils/index.js'

export interface IServiceInfo {
  name: string
  plugin: string
  params: Record<string, unknown>
  running: boolean
  logPath: string
}

export interface IPluginInfo {
  params: Record<string, TSchema>
  name: string
  resolved: string
}

export interface IServerBaseRpcFns {
  ['app:misc:versions'](): Record<string, string>
  ['app:misc:startTime'](): number

  ['app:plugin:load'](mod: string): void
  ['app:plugin:list'](): IPluginInfo[]

  ['app:service:add'](
    plugin: string,
    name: string,
    params: Record<string, unknown>
  ): void
  ['app:service:update'](name: string, params: Record<string, unknown>): void
  ['app:service:remove'](name: string): void
  ['app:service:start'](name: string): void
  ['app:service:stop'](name: string): void
  ['app:service:call'](
    name: string,
    method: string,
    ...args: unknown[]
  ): unknown
  ['app:service:exec'](
    name: string,
    method: string,
    ...args: unknown[]
  ): unknown
  ['app:service:list'](): IServiceInfo[]
}

export interface IServerClientRpcFns extends IServerBaseRpcFns {
  ['app:misc:readFile'](path: string): ArrayBuffer
}

export interface IServerWorkerRpcFns extends IServerBaseRpcFns {
  ['app:client:call'](id: string, method: string, ...args: unknown[]): unknown
  ['app:client:exec'](id: string, method: string, ...args: unknown[]): unknown
}
