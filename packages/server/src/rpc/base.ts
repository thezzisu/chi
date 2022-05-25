import { RpcImpl } from '@chijs/core'
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

  baseImpl.implement('app:plugin:load', async (mod) => {
    await app.pluginRegistry.load(mod)
  })

  baseImpl.implement('app:plugin:list', () => {
    return app.pluginRegistry.list()
  })

  baseImpl.implement('app:service:add', (plugin, name, params) => {
    app.serviceManager.addService(name, plugin, params)
  })

  baseImpl.implement('app:service:update', (name, params) => {
    app.serviceManager.updateService(name, params)
  })

  baseImpl.implement('app:service:remove', (name) => {
    app.serviceManager.removeService(name)
  })

  baseImpl.implement('app:service:start', (name) => {
    app.serviceManager.startService(name)
  })

  baseImpl.implement('app:service:stop', (name) => {
    app.serviceManager.stopService(name)
  })

  baseImpl.implement('app:service:list', () => {
    return app.serviceManager.listServices()
  })

  baseImpl.implement('app:service:call', (name, method, ...args) => {
    const worker = app.serviceManager.getWorker(name)
    return worker.hub.client.call(<never>method, ...(args as never[]))
  })

  baseImpl.implement('app:service:exec', (name, method, ...args) => {
    const worker = app.serviceManager.getWorker(name)
    return worker.hub.client.exec(<never>method, ...(args as never[]))
  })

  return baseImpl
}
