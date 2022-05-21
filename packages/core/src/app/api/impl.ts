import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ChiApp } from '../index.js'
import { RpcImpl } from '../../rpc/index.js'
import { IServiceInfo } from '../service/index.js'

export interface IAppBaseApiFns {
  ['app:version'](): string
  ['app:plugin:load'](mod: string): void

  ['app:service:add'](
    plugin: string,
    name: string,
    params: Record<string, unknown>
  ): void
  ['app:service:update'](name: string, params: Record<string, unknown>): void
  ['app:service:remove'](name: string): void
  ['app:service:start'](name: string): void
  ['app:service:stop'](name: string): void
  ['app:service:call'](name: string, method: string, args: unknown[]): unknown
  ['app:service:exec'](name: string, method: string, args: unknown[]): unknown
  ['app:service:list'](): IServiceInfo[]
}

export interface IAppServiceApiFns extends IAppBaseApiFns {
  ['app:client:call'](id: string, method: string, args: unknown[]): unknown
  ['app:client:exec'](id: string, method: string, args: unknown[]): unknown
}

export interface IAppClientApiFns extends IAppBaseApiFns {
  ['app:util:readFile'](path: string): ArrayBuffer
}

export function createAppApiBaseImpls(app: ChiApp) {
  const baseImpl = new RpcImpl<IAppBaseApiFns>()
  baseImpl.implement('app:version', async () => {
    const content = await readFile(
      join(
        dirname(fileURLToPath(import.meta.url)),
        '..',
        '..',
        '..',
        'package.json'
      )
    )
    const json = JSON.parse(content.toString())
    return json.version
  })

  baseImpl.implement('app:plugin:load', async (mod) => {
    await app.pluginRegistry.register(mod)
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

  const serviceImpl = new RpcImpl<IAppServiceApiFns>(baseImpl)

  serviceImpl.implement('app:client:call', (id, method, args) => {
    const client = app.apiServer.getClient(id)
    return client.hub.call(<never>method, <never>args)
  })

  serviceImpl.implement('app:client:exec', (id, method, args) => {
    const client = app.apiServer.getClient(id)
    return client.hub.exec(<never>method, <never>args)
  })

  const clientImpl = new RpcImpl<IAppClientApiFns>(baseImpl)

  clientImpl.implement('app:util:readFile', async (path) => {
    const content = await readFile(path)
    return content
  })

  return { baseImpl, serviceImpl, clientImpl }
}
