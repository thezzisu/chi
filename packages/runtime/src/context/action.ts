import {
  AgentDescriptor,
  createActionWrapper,
  RpcId,
  Static,
  TSchema
} from '@chijs/core'
import { IAction } from '../action.js'
import { Descriptor, DescriptorOf, PluginTypeDescriptor } from './base.js'
import { ServiceContext } from './service.js'

export class ActionContext<D extends Descriptor> {
  handle
  agent

  constructor(
    public service: ServiceContext<D>,
    private initiator: RpcId,
    public taskId: string,
    public jobId: string
  ) {
    this.handle = service.endpoint.getHandle<AgentDescriptor>(initiator)
    this.agent = createActionWrapper(this.handle, {
      taskId,
      jobId
    })
  }

  use<M>(serviceId: string) {
    return new ActionHandle<M, D>(this, serviceId)
  }
}

export type ActionsOf<M> = DescriptorOf<M> extends PluginTypeDescriptor<
  infer _,
  infer _,
  infer C
>
  ? C
  : never

export type ActionKeys<M> = keyof ActionsOf<M>

export type ActionOf<M, K> = K extends keyof ActionsOf<M>
  ? ActionsOf<M>[K] extends IAction<infer _, infer _>
    ? ActionsOf<M>[K]
    : IAction<TSchema, TSchema>
  : IAction<TSchema, TSchema>

export type ParamOf<M, K> = ActionOf<M, K> extends IAction<infer P, infer _>
  ? Static<P>
  : never

export type ReturnOf<M, K> = ActionOf<M, K> extends IAction<infer _, infer R>
  ? Static<R>
  : never

export class ActionHandle<M, D extends Descriptor> {
  constructor(private ctx: ActionContext<D>, private serviceId: string) {}
  async run<K extends ActionKeys<M>>(
    actionId: K,
    params: ParamOf<M, K>
  ): Promise<ReturnOf<M, K>> {
    const result = await this.ctx.service.action.run(
      this.ctx.taskId,
      this.ctx.jobId,
      this.serviceId,
      <string>actionId,
      params
    )
    return <never>result
  }
}
