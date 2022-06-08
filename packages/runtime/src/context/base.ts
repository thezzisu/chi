import { RpcTypeDescriptor, IPluginDescriptors, TUnknown } from '@chijs/core'
import { IAction } from '../action'

export type PluginTypeDescriptor<A = {}, B = {}, C = {}> = RpcTypeDescriptor<
  A,
  B
> & { action: C }
export type Descriptor = PluginTypeDescriptor<{}, {}, {}>

export type DescriptorOf<P> = P extends string
  ? P extends keyof IPluginDescriptors
    ? IPluginDescriptors[P]
    : {}
  : P

export type ActionOf<
  D extends Descriptor,
  K extends string
> = D extends PluginTypeDescriptor<infer _, infer _, infer C>
  ? K extends keyof C
    ? C[K]
    : IAction<TUnknown, unknown>
  : IAction<TUnknown, unknown>

export type ActionsOf<P> = P extends string
  ? DescriptorOf<P> extends PluginTypeDescriptor<infer _, infer _, infer C>
    ? C
    : {}
  : P extends PluginTypeDescriptor<infer _, infer _, infer C>
  ? C
  : P
