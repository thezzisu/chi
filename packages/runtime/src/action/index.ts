import { TSchema } from '@chijs/util'

export interface IAction {
  id: string
  name: string
  description: string

  params: TSchema
  result: TSchema
}

export interface IActionDefn extends IAction {
  main: (ctx: ActionContext, params: unknown) => unknown
}

export type ActionTypeDescriptor<
  P extends TSchema = TSchema,
  R extends TSchema = TSchema
> = {
  $type: 'action'
  params: P
  result: R
}

export class ActionContext {
  constructor() {
    //
  }
}
