import { RpcTypeDescriptor } from '../../rpc/index.js'
import { TSchema, WithPrefix } from '../../util/index.js'
import { IActionInfo, ITaskInfo } from '../../action/index.js'

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

interface IServerMiscAPI {
  versions(): Promise<Record<string, string>>
  startTime(): Promise<number>
}

interface IServerPluginAPI {
  load(id: string): Promise<[ok: boolean, reason?: string]>
  unload(id: string): Promise<void>
  list(): Promise<IPluginInfo[]>
  get(id: string): Promise<IPluginInfo>
}

interface IServerServiceAPI {
  add(defn: IServiceDefn): Promise<void>
  update(id: string, attr: Partial<IServiceAttr>): Promise<void>
  remove(id: string): Promise<void>
  start(id: string): Promise<void>
  stop(id: string): Promise<void>
  list(): Promise<IServiceInfo[]>
  get(id: string): Promise<IServiceInfo>
}

interface IServerActionAPI {
  dispatch(
    serviceId: string,
    actionId: string,
    params: Record<string, unknown>
  ): Promise<string>
  run(
    taskId: string,
    parent: string,
    serviceId: string,
    actionId: string,
    params: Record<string, unknown>
  ): Promise<unknown>
  get(serviceId: string, actionId: string): Promise<IActionInfoWithService>
  list(): Promise<IActionInfoWithService[]>
  listByService(serviceId: string): Promise<IActionInfoWithService[]>
  getTask(id: string): Promise<ITaskInfo>
  listTask(): Promise<ITaskInfo[]>
  listTaskByService(serviceId: string): Promise<ITaskInfo[]>
  listTaskByAction(serviceId: string, actionId: string): Promise<ITaskInfo[]>
}

export interface IServerAPI
  extends WithPrefix<IServerMiscAPI, 'misc:'>,
    WithPrefix<IServerPluginAPI, 'plugin:'>,
    WithPrefix<IServerServiceAPI, 'service:'>,
    WithPrefix<IServerActionAPI, 'action:'> {}

export type ServerDescriptor = RpcTypeDescriptor<
  WithPrefix<IServerAPI, '$s:'>,
  {
    ['$s:action:taskUpdate'](taskId: string): ITaskInfo
  }
>
