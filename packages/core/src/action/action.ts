import { TSchema } from '../util/index.js'

export interface IActionInfo {
  id: string
  name?: string
  desc?: string
  params: TSchema
  return: TSchema
}

export enum JobState {
  RUNNING,
  SUCCESS,
  FAILED
}

export interface IJobInfo {
  id: string
  parent: string
  serviceId: string
  actionId: string
  params: unknown
  return: unknown
  state: JobState
  created: number
  finished: number
}

export interface ITaskInfo {
  id: string
  serviceId: string
  actionId: string
  state: JobState
  jobs: IJobInfo[]
  created: number
  finished: number
}
