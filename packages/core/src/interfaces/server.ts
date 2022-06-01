import { RpcTypeDescriptor } from '../rpc/index.js'
import { TSchema } from '../utils/index.js'

export enum ServiceState {
  STARTING,
  RUNNING,
  STOPPING,
  STOPPED,
  FAILED
}

export enum ServiceRestartPolicy {
  NEVER,
  ON_FAILURE,
  ALWAYS
}

export interface IServiceAttr {
  name?: string
  desc?: string
  params: Record<string, unknown>
  restartPolicy: ServiceRestartPolicy
  autostart: boolean
}

export interface IServiceDefn extends IServiceAttr {
  id: string
  plugin: string
}

export interface IServiceInfo extends IServiceDefn {
  state: ServiceState
  logPath: string
  workerId?: string
  error?: string
}

export interface IPluginInfo {
  id: string
  name?: string
  desc?: string
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

    ['$s:service:add'](defn: IServiceDefn): void
    ['$s:service:update'](id: string, attr: Partial<IServiceAttr>): void
    ['$s:service:remove'](id: string): void
    ['$s:service:start'](id: string): void
    ['$s:service:stop'](id: string): void
    ['$s:service:list'](): IServiceInfo[]
    ['$s:service:get'](id: string): IServiceInfo
  },
  {}
>
