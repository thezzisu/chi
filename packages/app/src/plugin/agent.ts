import {
  Fn,
  RpcTypeDescriptor,
  RpcHandle,
  RpcId,
  RpcBaseDescriptor
} from '@chijs/rpc'
import { WithPrefix } from '@chijs/util'

export interface IAgentInteractContext {
  taskId?: string
  jobId?: string
  serviceId?: string
}

export interface IAgentInteractOptions {
  /** Interact id for autocompletion */
  id?: string
}

export interface IAgentNotifyOptions extends IAgentInteractOptions {
  message?: string
  caption?: string
}

export interface IAgentAlertOptions extends IAgentInteractOptions {
  message?: string
  caption?: string
}

export interface IAgentConfirmOptions extends IAgentInteractOptions {
  message?: string
  caption?: string
}

export interface IAgentPromptOptions extends IAgentInteractOptions {
  message?: string
  caption?: string
  label?: string
  placeholder?: string
}

export interface IAgentMethods {
  notify(options: IAgentNotifyOptions | string): Promise<void>
  alert(options: IAgentAlertOptions | string): Promise<void>
  confirm(options: IAgentConfirmOptions | string): Promise<boolean>
  prompt(options: IAgentPromptOptions | string): Promise<string>
}

type WithContext<T> = {
  [P in keyof T]: T[P] extends infer U
    ? U extends Fn<infer A, infer R>
      ? (ctx: IAgentInteractContext, ...args: A) => R
      : never
    : never
}

const prefix = '#action:'

export type AgentDescriptor = RpcTypeDescriptor<
  WithPrefix<WithContext<IAgentMethods>, typeof prefix>,
  {}
>

export function createActionWrapper(
  handle: RpcHandle<RpcBaseDescriptor>,
  context: IAgentInteractContext
) {
  return <IAgentMethods & { remoteId: RpcId }>new Proxy(
    {},
    {
      get(target, prop) {
        if (prop === 'then') return null
        if (prop === 'remoteId') return handle.remoteId
        if (typeof prop !== 'string') throw new Error('Invalid property')
        return (...args: unknown[]) =>
          handle.call(<never>`${prefix}${prop}`, context, ...args)
      }
    }
  )
}
