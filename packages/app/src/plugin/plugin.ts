import { Id, TObject, TSchema, Type, TypeBuilder } from '@chijs/util'
import {
  ActionBaseDescriptor,
  ActionBuilder,
  IChiPluginActionDefn
} from './action.js'
import { EntityBuilder, IChiPluginEntityMeta } from './common.js'
import { IChiPluginUnitDefn, UnitBaseDescriptor, UnitBuilder } from './unit.js'

export type PluginTypeDescriptor<A, U, P extends TSchema> = {
  actions: A
  units: U
  params: P
}

export type PluginBaseDescriptor = PluginTypeDescriptor<{}, {}, TSchema>

export interface IChiPlugin<
  D extends PluginBaseDescriptor = PluginTypeDescriptor<
    Record<string, IChiPluginActionDefn>,
    Record<string, IChiPluginUnitDefn>,
    TSchema
  >
> {
  meta: IChiPluginEntityMeta
  actions: D['actions']
  units: D['units']
  params: D['params']
}

export class PluginBuilder<
  D extends PluginBaseDescriptor = PluginTypeDescriptor<{}, {}, TObject<{}>>
> extends EntityBuilder<IChiPlugin> {
  private actions: Record<string, IChiPluginActionDefn>
  private units: Record<string, IChiPluginUnitDefn>
  private _params: TSchema

  constructor() {
    super()
    this.actions = {}
    this.units = {}
    this._params = Type.Object({})
  }

  clone() {
    const clone = new PluginBuilder<D>()
    clone.meta = { ...this.meta }
    clone.actions = { ...this.actions }
    clone.units = { ...this.units }
    return clone as this
  }

  build(): IChiPlugin<D> {
    const clone = this.clone()
    return {
      meta: clone.meta,
      actions: clone.actions,
      units: clone.units,
      params: clone._params
    }
  }

  params<T extends TSchema>(
    schema: T | ((builder: TypeBuilder) => T)
  ): PluginBuilder<PluginTypeDescriptor<D['actions'], D['units'], T>> {
    const clone = this.clone()
    clone._params = schema instanceof Function ? schema(Type) : schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <any>clone
  }

  action<K extends string, D1 extends ActionBaseDescriptor>(
    id: K,
    action:
      | IChiPluginActionDefn<D1>
      | ((builder: ActionBuilder<D>) => IChiPluginActionDefn<D1>)
  ): PluginBuilder<
    PluginTypeDescriptor<
      Id<D['actions'] & { [k in K]: D1 }>,
      D['units'],
      D['params']
    >
  > {
    const clone = this.clone()
    if (typeof action === 'function') {
      clone.actions[id] = action(new ActionBuilder())
    } else {
      clone.actions[id] = action
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <any>clone
  }

  unit<K extends string, D1 extends UnitBaseDescriptor>(
    id: K,
    unit:
      | IChiPluginUnitDefn<D1>
      | ((builder: UnitBuilder<D>) => IChiPluginUnitDefn<D1>)
  ): PluginBuilder<
    PluginTypeDescriptor<
      D['actions'],
      Id<D['units'] & { [k in K]: D1 }>,
      D['params']
    >
  > {
    const clone = this.clone()
    if (typeof unit === 'function') {
      clone.units[id] = unit(new UnitBuilder())
    } else {
      clone.units[id] = unit
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <any>clone
  }
}

export function definePlugin<
  D extends PluginBaseDescriptor = PluginTypeDescriptor<{}, {}, TObject<{}>>
>(plugin: IChiPlugin<D> | ((builder: PluginBuilder) => IChiPlugin<D>)) {
  if (typeof plugin === 'function') {
    return plugin(new PluginBuilder())
  }
  return plugin
}
