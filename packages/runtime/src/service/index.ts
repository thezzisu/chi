import { Awaitable, TSchema } from '@chijs/util'

export interface IService {
  id: string
  name: string
  description: string

  params: TSchema
}

export interface IServiceDefn extends IService {
  main: (ctx: ServiceContext, params: unknown) => Awaitable<void>
}

export type ServiceTypeDescriptor<P extends TSchema = TSchema> = {
  $type: 'service'
  params: P
}

export class ServiceContext {
  //
}
