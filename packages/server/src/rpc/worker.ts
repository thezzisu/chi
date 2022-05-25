import { RpcImpl } from '@chijs/core'

import type { IServerBaseRpcFns, IServerWorkerRpcFns } from '@chijs/core'
import type { ChiApp } from '../index.js'

export function createWorkerImpl(
  app: ChiApp,
  baseImpl: RpcImpl<IServerBaseRpcFns>
) {
  const workerImpl = new RpcImpl<IServerWorkerRpcFns>(baseImpl)

  workerImpl.implement('app:client:call', (id, method, ...args) => {
    const client = app.webServer.getClient(id)
    return client.hub.client.call(<never>method, ...(args as never[]))
  })

  workerImpl.implement('app:client:exec', (id, method, ...args) => {
    const client = app.webServer.getClient(id)
    return client.hub.client.exec(<never>method, ...(args as never[]))
  })

  return workerImpl
}
