import {
  IServerBaseRpcFns,
  IServerClientRpcFns,
  IServerWorkerRpcFns,
  RpcImpl
} from '@chijs/core'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ChiApp } from '../index.js'

export function createAppApiBaseImpls(app: ChiApp) {
  const baseImpl = new RpcImpl<IServerBaseRpcFns>()
  baseImpl.implement('app:versions', async () => {
    const content = await readFile(
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

  baseImpl.implement('app:service:call', (name, method, args) => {
    const worker = app.serviceManager.getWorker(name)
    return worker.hub.call(<never>method, <never>args)
  })

  baseImpl.implement('app:service:exec', (name, method, args) => {
    const worker = app.serviceManager.getWorker(name)
    return worker.hub.exec(<never>method, <never>args)
  })

  const workerImpl = new RpcImpl<IServerWorkerRpcFns>(baseImpl)

  workerImpl.implement('app:client:call', (id, method, args) => {
    const client = app.apiServer.getClient(id)
    return client.hub.call(<never>method, <never>args)
  })

  workerImpl.implement('app:client:exec', (id, method, args) => {
    const client = app.apiServer.getClient(id)
    return client.hub.exec(<never>method, <never>args)
  })

  const clientImpl = new RpcImpl<IServerClientRpcFns>(baseImpl)

  clientImpl.implement('app:util:readFile', async (path) => {
    const content = await readFile(path)
    return content
  })

  return { baseImpl, workerImpl, clientImpl }
}
