import {
  AgentDescriptor,
  createActionWrapper,
  MapStatic,
  RpcId,
  Static,
  TSchema
} from '@chijs/core'
import { IAction } from '../action.js'
import { Descriptor } from './base.js'
import { ServiceContext } from './service.js'

export type ParamOf<M, K> = K extends keyof M
  ? M[K] extends IAction<infer P, infer _>
    ? MapStatic<P>
    : Record<string, unknown>
  : Record<string, unknown>

export type ReturnOf<M, K> = K extends keyof M
  ? M[K] extends IAction<infer _, infer R>
    ? R extends TSchema
      ? Static<R>
      : unknown
    : unknown
  : unknown

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

export class ActionHandle<M, D extends Descriptor> {
  constructor(private ctx: ActionContext<D>, private serviceId: string) {}
  async run<K extends keyof M>(
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
