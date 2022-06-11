import {
  Awaitable,
  IActionInfo,
  removeUndefined,
  Static,
  TObject,
  TSchema,
  TVoid,
  Type
} from '@chijs/core'
import { PluginDescriptor, ActionContext } from './context/index.js'

export interface IActionDefn extends Omit<IActionInfo, 'id'> {
  main(
    ctx: ActionContext<PluginDescriptor>,
    params: unknown
  ): Awaitable<unknown>
}

export interface IAction<P extends TSchema, R extends TSchema>
  extends Omit<IActionDefn, 'params' | 'return'> {
  params: P
  return: R
}

export class ActionBuilder<
  D extends PluginDescriptor,
  P extends TSchema = TObject<{}>,
  R extends TSchema = TVoid
> {
  private _params: unknown
  private _return: TSchema
  private _name?: string
  private _desc?: string

  constructor() {
    this._params = Type.Strict(Type.Object({}))
    this._return = Type.Strict(Type.Void())
  }

  private clone() {
    const builder = new ActionBuilder()
    builder._params = this._params
    builder._return = this._return
    builder._name = this._name
    builder._desc = this._desc
    return builder
  }

  name(name: string) {
    const builder = this.clone()
    builder._name = name
    return builder
  }

  desc(desc: string) {
    const builder = this.clone()
    builder._desc = desc
    return builder
  }

  params<T extends TSchema>(schema: T): ActionBuilder<D, T, R> {
    const builder = this.clone()
    builder._params = Type.Strict(schema)
    return <never>builder
  }

  return<T extends TSchema>(schema: T): ActionBuilder<D, P, T> {
    const builder = this.clone()
    builder._return = Type.Strict(schema)
    return <never>builder
  }

  build(
    main: (ctx: ActionContext<D>, params: Static<P>) => Awaitable<Static<R>>
  ): IAction<P, R> {
    return removeUndefined({
      name: this._name,
      desc: this._desc,
      params: <never>this._params,
      return: <never>this._return,
      main: <never>main
    })
  }
}

export type Built<B> = B extends ActionBuilder<infer _, infer P, infer R>
  ? IAction<P, R>
  : IAction<TSchema, TSchema>
