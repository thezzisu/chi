import { RpcTypeDescriptor, IPluginDescriptors, TSchema } from '@chijs/core'
import { IAction } from '../action'

export type PluginTypeDescriptor<A = {}, B = {}, C = {}> = RpcTypeDescriptor<
  A,
  B
> & { action: C }
export type Descriptor = PluginTypeDescriptor<{}, {}, {}>
export type UnknownDescriptor = PluginTypeDescriptor<
  Record<string, (...args: unknown[]) => Promise<unknown>>,
  Record<string, (...args: unknown[]) => unknown>,
  Record<string, IAction<TSchema, TSchema>>
>

export type DescriptorOf<P> = P extends string
  ? P extends keyof IPluginDescriptors
    ? IPluginDescriptors[P] extends Descriptor
      ? IPluginDescriptors[P]
      : UnknownDescriptor
    : Descriptor
  : P extends Descriptor
  ? P
  : UnknownDescriptor
