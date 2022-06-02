import { RpcEndpoint, ServerDescriptor } from '@chijs/core'
import { ChiApp } from '../index.js'

export function applyActionImpl(
  endpoint: RpcEndpoint<ServerDescriptor>,
  app: ChiApp
) {
  endpoint.provide(
    '$s:action:dispatch',
    function (serviceId, actionId, params) {
      return app.actions.dispatch(this.remoteId, serviceId, actionId, params)
    }
  )

  endpoint.provide(
    '$s:action:run',
    (taskId, parent, serviceId, actionId, params) => {
      return app.actions.run(taskId, parent, serviceId, actionId, params)
    }
  )
}
