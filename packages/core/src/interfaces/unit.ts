import { TSchema } from '../utils'

export interface IUnit {
  id: string
  scriptId: string

  description: string
  params: Record<string, TSchema>
}

export interface IService {
  id: string
  unitId: string

  description: string
  params: unknown
  status: 'running' | 'stopped'
}
