import {
  Awaitable,
  IActionInfo,
  Id,
  MapStatic,
  Static,
  TSchema,
  TUnknown,
  Type
} from '@chijs/core'
import { Descriptor, ActionContext } from './context/index.js'

export interface IActionDefn extends Omit<IActionInfo, 'id'> {
  main(
    ctx: ActionContext<Descriptor>,
    params: Record<string, unknown>
  ): Awaitable<unknown>
}

export interface IAction<P, R> extends Omit<IActionDefn, 'params' | 'return'> {
  params: P
  return: R
}

export class ActionBuilder<
  D extends Descriptor,
  P extends Record<string, TSchema> = {},
  R extends TSchema = TUnknown
> {
  private _params: Record<string, TSchema>
  private _return: TSchema
  private _name?: string
  private _desc?: string

  constructor() {
    this._params = {}
    this._return = Type.Strict(Type.Unknown())
  }

  private clone() {
    const builder = new ActionBuilder()
    builder._params = { ...this._params }
    builder._return = this._return
    builder._name = this._name
    builder._desc = this._desc
    return builder
  }

  name(name: string) {
    this._name = name
  }

  desc(desc: string) {
    this._desc = desc
  }

  param<K extends string, T extends TSchema>(
    name: K,
    schema: T
  ): ActionBuilder<D, Id<P & { [k in K]: T }>, R> {
    const builder = this.clone()
    builder._params[name] = Type.Strict(schema)
    return <never>builder
  }

  return<T extends TSchema>(schema: T): ActionBuilder<D, P, T> {
    const builder = this.clone()
    builder._return = Type.Strict(schema)
    return <never>builder
  }

  build(
    main: (ctx: ActionContext<D>, params: MapStatic<P>) => Awaitable<Static<R>>
  ): IAction<P, R> {
    return {
      name: this._name,
      desc: this._desc,
      params: <never>{ ...this._params },
      return: <never>this._return,
      main: <never>main
    }
  }
}

export type Built<B> = B extends ActionBuilder<infer _, infer P, infer R>
  ? IAction<P, R>
  : IAction<Record<string, unknown>, unknown>
