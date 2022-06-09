import { RpcEndpoint, validateJsonSchema, WorkerDescriptor } from '@chijs/core'
import { ServiceContext, Descriptor, ActionContext } from './context/index.js'

/** @internal */
export const initialization = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  resolve: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reject: () => {},
  promise: <Promise<void>>(<unknown>null)
}
initialization.promise = new Promise<void>((resolve, reject) => {
  initialization.resolve = resolve
  initialization.reject = reject
})

/** @internal */
export function applyWorkerImpl(
  endpoint: RpcEndpoint<WorkerDescriptor>,
  ctx: ServiceContext<Descriptor>
) {
  endpoint.provide('$w:exit', () => process.exit(0))

  endpoint.provide('$w:waitReady', () => initialization.promise)

  endpoint.provide('$w:action:get', (id) => {
    const action = ctx.actions.get(id)
    if (!action) throw new Error(`Action ${id} not found`)
    const { main: _, ...info } = action
    return { ...info, id }
  })

  endpoint.provide('$w:action:list', () =>
    [...ctx.actions.entries()].map(([id, { main: _, ...info }]) => ({
      ...info,
      id
    }))
  )

  endpoint.provide(
    '$w:action:run',
    async (initiator, taskId, jobId, actionId, params) => {
      const action = ctx.actions.get(actionId)
      if (!action) throw new Error(`Action ${actionId} not found`)
      const validation = validateJsonSchema(params, action.params)
      if (validation.length) {
        ctx.logger.error(validation, `Invalid params`)
        throw new Error(`Invalid params`)
      }
      const context = new ActionContext(ctx, initiator, taskId, jobId)
      const result = await action.main(context, params)
      return result
    }
  )
}
