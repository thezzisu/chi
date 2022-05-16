import { IAction, IScript, IUnit } from '../interfaces'

export interface IScriptInfo {
  script: IScript
  actions: IAction[]
  units: IUnit[]
}

export interface IWorkerApis {
  ['worker:exit'](): void
  ['worker:get-script-info'](): IScriptInfo
  ['worker:run-action'](actionId: string, params: unknown): unknown
  ['worker:run-service'](serviceId: string, params: unknown): void
}
