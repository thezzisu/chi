import { RpcTypeDescriptor } from '../rpc/index.js'
import { TSchema } from '../utils/index.js'
import { IActionInfo, ITaskInfo } from './action.js'

export interface IActionInfoWithService extends IActionInfo {
  serviceId: string
}

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
}

export interface IServiceDefn extends IServiceAttr {
  id: string
  pluginId: string
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

export interface IPaginationOptions {
  skip: number
  take: number
}

export type ServerDescriptor = RpcTypeDescriptor<
  {
    ['$s:misc:versions'](): Record<string, string>
    ['$s:misc:startTime'](): number

    ['$s:plugin:load'](id: string): [ok: boolean, reason?: string]
    ['$s:plugin:unload'](id: string): void
    ['$s:plugin:list'](): IPluginInfo[]
    ['$s:plugin:get'](id: string): IPluginInfo

    ['$s:service:add'](defn: IServiceDefn): void
    ['$s:service:update'](id: string, attr: Partial<IServiceAttr>): void
    ['$s:service:remove'](id: string): void
    ['$s:service:start'](id: string): void
    ['$s:service:stop'](id: string): void
    ['$s:service:list'](): IServiceInfo[]
    ['$s:service:get'](id: string): IServiceInfo

    ['$s:action:dispatch'](
      serviceId: string,
      actionId: string,
      params: Record<string, unknown>
    ): string
    ['$s:action:run'](
      taskId: string,
      parent: string,
      serviceId: string,
      actionId: string,
      params: Record<string, unknown>
    ): unknown
    ['$s:action:get'](
      serviceId: string,
      actionId: string
    ): IActionInfoWithService
    ['$s:action:list'](): IActionInfoWithService[]
    ['$s:action:listByService'](serviceId: string): IActionInfoWithService[]
    ['$s:action:getTask'](id: string): ITaskInfo
    ['$s:action:listTask'](): ITaskInfo[]
    ['$s:action:listTaskByService'](serviceId: string): ITaskInfo[]
    ['$s:action:listTaskByAction'](
      serviceId: string,
      actionId: string
    ): ITaskInfo[]
  },
  {
    ['$s:action:taskUpdate'](taskId: string): ITaskInfo
  }
>
