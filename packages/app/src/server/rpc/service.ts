import { RpcEndpoint } from '@chijs/rpc'
import { ServerDescriptor } from './base.js'
import { IServiceInfo, ServiceRestartPolicy } from '../service/index.js'
import { ChiServer } from '../index.js'
import { IChiPluginUnit } from '../../plugin/index.js'

export interface IUnitInfo extends IChiPluginUnit {
  id: string
  pluginId: string
}

export interface IUnitProvides {
  list(pluginId?: string): Promise<IUnitInfo[]>
  get(pluginId: string, unitId: string): Promise<IUnitInfo | null>
}

export interface IServiceProvides {
  add(
    id: string,
    pluginId: string,
    unitId: string,
    params: unknown,
    restartPolicy?: ServiceRestartPolicy
  ): Promise<void>
  remove(id: string): Promise<void>
  start(id: string): Promise<void>
  stop(id: string): Promise<void>
  list(): Promise<IServiceInfo[]>
  get(id: string): Promise<IServiceInfo | null>
}

export interface IServicePublishes {
  update(id: string): IServiceInfo
}

export function applyServiceImpl(
  endpoint: RpcEndpoint<ServerDescriptor>,
  app: ChiServer
) {
  endpoint.provide('#server:unit:list', (pluginId) => {
    const plugins = pluginId
      ? [app.plugins.getOrFail(pluginId)]
      : app.plugins.list()
    return plugins.flatMap((plugin) =>
      Object.entries(plugin.units).map(([id, unit]) => ({
        id,
        pluginId: plugin.id,
        ...unit
      }))
    )
  })

  endpoint.provide('#server:unit:get', (pluginId, unitId) => {
    const unit = app.plugins.get(pluginId)?.units[unitId]
    if (!unit) return null
    return { id: unitId, pluginId, ...unit }
  })

  endpoint.provide('#server:service:add', (...args) =>
    app.services.create(...args)
  )

  endpoint.provide('#server:service:remove', (...args) =>
    app.services.remove(...args)
  )

  endpoint.provide('#server:service:start', (...args) =>
    app.services.start(...args)
  )

  endpoint.provide('#server:service:stop', (...args) =>
    app.services.stop(...args)
  )

  endpoint.provide('#server:service:list', () => app.services.list())

  endpoint.provide('#server:service:get', (id) => app.services.get(id))

  endpoint.publish('#server:service:update', (cb, serviceId) => {
    if (!app.services.has(serviceId))
      throw new Error(`Service ${serviceId} not found`)
    app.services.on(serviceId, cb)
    return () => {
      app.services.off(serviceId, cb)
    }
  })
}
