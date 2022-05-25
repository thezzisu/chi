import { RpcImpl, STARTUP_TIMESTAMP } from '@chijs/core'
import { ChiApp } from '../index.js'
import fs from 'fs-extra'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { IServerBaseRpcFns } from '@chijs/core'

export function createBaseImpl(app: ChiApp) {
  const baseImpl = new RpcImpl<IServerBaseRpcFns>()
  baseImpl.implement('app:misc:versions', async () => {
    const content = await fs.readFile(
      join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'package.json')
    )
    const json = JSON.parse(content.toString())
    return { server: json.version }
  })

  baseImpl.implement('app:misc:startTime', () => STARTUP_TIMESTAMP)

  baseImpl.implement('app:plugin:load', async (mod) => {
    await app.pluginRegistry.load(mod)
  })

  baseImpl.implement('app:plugin:list', () => {
    return app.pluginRegistry.list()
  })

  baseImpl.implement('app:service:add', (plugin, id, params) => {
    app.serviceManager.addService(id, plugin, params)
  })

  baseImpl.implement('app:service:update', (id, params) => {
    app.serviceManager.updateService(id, params)
  })

  baseImpl.implement('app:service:remove', (id) => {
    app.serviceManager.removeService(id)
  })

  baseImpl.implement('app:service:start', (id) => {
    app.serviceManager.startService(id)
  })

  baseImpl.implement('app:service:stop', (id) => {
    app.serviceManager.stopService(id)
  })

  baseImpl.implement('app:service:list', () => {
    return app.serviceManager.listServices()
  })

  baseImpl.implement('app:service:call', (id, method, ...args) => {
    const worker = app.serviceManager.getWorker(id)
    return worker.hub.client.call(<never>method, ...(args as never[]))
  })

  baseImpl.implement('app:service:exec', (id, method, ...args) => {
    const worker = app.serviceManager.getWorker(id)
    return worker.hub.client.exec(<never>method, ...(args as never[]))
  })

  return baseImpl
}
