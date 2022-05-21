import { IPluginInfo, IServiceInfo } from '../entities/index.js'

export interface IServerBaseRpcFns {
  ['app:versions'](): Record<string, string>
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
  ['app:service:call'](name: string, method: string, args: unknown[]): unknown
  ['app:service:exec'](name: string, method: string, args: unknown[]): unknown
  ['app:service:list'](): IServiceInfo[]
}

export interface IServerWorkerRpcFns extends IServerBaseRpcFns {
  ['app:client:call'](id: string, method: string, args: unknown[]): unknown
  ['app:client:exec'](id: string, method: string, args: unknown[]): unknown
}

export interface IServerClientRpcFns extends IServerBaseRpcFns {
  ['app:util:readFile'](path: string): ArrayBuffer
}
