import { RpcEndpoint } from '@chijs/rpc'
import { ActionTask } from '../db/task.js'
import { ChiApp } from '../index.js'

export interface IActionProvides {
  list(): Promise<void>
  dispatch(pluginId: string, actionId: string, params: unknown): Promise<string>
  run(
    taskId: string,
    jobId: string,
    pluginId: string,
    actionId: string,
    params: unknown
  ): Promise<string>
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IActionPublishes {}

export function applyActionImpl(
  endpoint: RpcEndpoint<ActionDescriptor>,
  app: ChiApp
) {
  endpoint.provide('list', () => {
    //
  })
}
