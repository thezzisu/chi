import { TSchema } from '../utils'

export interface IAction {
  id: string
  scriptId: string

  description: string
  params: Record<string, TSchema>
  return: TSchema
}

export interface ITask {
  id: string
  scriptId: string
  actionId: string

  params: unknown
  return: unknown
  status: 'running' | 'finished' | 'failed'
}

export interface IJob {
  id: string
  taskId: string
  actionId: string

  params: unknown
  return: unknown
  status: 'running' | 'finished' | 'failed'
}
