import { IScript, IAction, ITask, IJob, IUnit, IService } from '../interfaces'

export interface IServerApis {
  ['script:get'](id: string): IScript
  ['script:list-all'](): IScript[]

  ['action:get'](id: string): IScript
  ['action:list-all'](): IAction[]
  ['action:list-by-script'](scriptId: string): IAction[]

  ['task:get'](id: string): ITask
  ['task:list-all'](): ITask[]
  ['task:list-by-script'](scriptId: string): ITask[]
  ['task:list-by-action'](actionId: string): ITask[]

  ['job:get'](id: string): IJob
  ['job:list-by-task'](taskId: string): IJob[]

  ['unit:get'](id: string): IUnit
  ['unit:list-by-script'](scriptId: string): IUnit[]

  ['service:get'](id: string): IService
  ['service:list-by-script'](scriptId: string): IService[]
  ['service:list-by-unit'](unitId: string): IService[]

  ['dispatch-action'](actionId: string, params: unknown): unknown
}
