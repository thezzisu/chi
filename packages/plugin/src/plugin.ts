import { Id } from '@chijs/util'
import {
  ActionBaseDescriptor,
  ActionBuilder,
  IChiPluginActionDefn
} from './action.js'
import { EntityBuilder, IChiPluginEntityMeta } from './common.js'
import { IChiPluginUnitDefn, UnitBaseDescriptor, UnitBuilder } from './unit.js'

export type PluginTypeDescriptor<A, U> = {
  actions: A
  units: U
}

type PluginBaseDescriptor = PluginTypeDescriptor<{}, {}>

export interface IChiPlugin<
  D extends PluginBaseDescriptor = PluginTypeDescriptor<
    Record<string, IChiPluginActionDefn>,
    Record<string, IChiPluginUnitDefn>
  >
> {
  meta: IChiPluginEntityMeta
  actions: D['actions']
  units: D['units']
}

export class PluginBuilder<
  D extends PluginBaseDescriptor = PluginBaseDescriptor
> extends EntityBuilder<IChiPlugin> {
  actions: Record<string, IChiPluginActionDefn>
  units: Record<string, IChiPluginUnitDefn>
  constructor() {
    super()
    this.actions = {}
    this.units = {}
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
      units: clone.units
    }
  }

  action<K extends string, D1 extends ActionBaseDescriptor>(
    id: K,
    action:
      | IChiPluginActionDefn<D1>
      | ((builder: ActionBuilder) => IChiPluginActionDefn<D1>)
  ): PluginBuilder<
    PluginTypeDescriptor<Id<D['actions'] & { [k in K]: D1 }>, D['units']>
  > {
    const clone = this.clone()
    if (typeof action === 'function') {
      clone.actions[id] = action(new ActionBuilder())
    } else {
      clone.actions[id] = action
    }
    return <any>clone
  }

  unit<K extends string, D1 extends UnitBaseDescriptor>(
    id: K,
    unit:
      | IChiPluginUnitDefn<D1>
      | ((builder: UnitBuilder) => IChiPluginUnitDefn<D1>)
  ): PluginBuilder<
    PluginTypeDescriptor<D['actions'], Id<D['units'] & { [k in K]: D1 }>>
  > {
    const clone = this.clone()
    if (typeof unit === 'function') {
      clone.units[id] = unit(new UnitBuilder())
    } else {
      clone.units[id] = unit
    }
    return <any>clone
  }
}
