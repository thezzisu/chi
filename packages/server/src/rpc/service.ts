import { RpcEndpoint, ServerDescriptor } from '@chijs/core'
import { ChiApp } from '../index.js'

export function applyServiceImpl(
  endpoint: RpcEndpoint<ServerDescriptor>,
  app: ChiApp
) {
  endpoint.provide('$s:service:add', (defn) => app.services.add(defn))

  endpoint.provide('$s:service:update', (id, attr) =>
    app.services.update(id, attr)
  )

  endpoint.provide('$s:service:remove', (id) => app.services.remove(id))

  endpoint.provide('$s:service:start', (id) => app.services.start(id))

  endpoint.provide('$s:service:stop', (id) => app.services.stop(id))

  endpoint.provide('$s:service:list', () => app.services.list())

  endpoint.provide('$s:service:get', (id) => app.services.get(id))

  endpoint.publish('$s:service:update', (cb, serviceId) => {
    if (!app.services.map.has(serviceId))
      throw new Error(`Service ${serviceId} not found`)
    app.services.emitter.on(serviceId, cb)
    return () => {
      app.services.emitter.off(serviceId, cb)
    }
  })
}
