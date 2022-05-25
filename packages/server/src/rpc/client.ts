import fs from 'fs-extra'
import { RpcImpl } from '@chijs/core'

import type { IServerClientRpcFns, IServerBaseRpcFns } from '@chijs/core'
import type { ChiApp } from '../index.js'

export function createClientImpl(
  app: ChiApp,
  baseImpl: RpcImpl<IServerBaseRpcFns>
) {
  const clientImpl = new RpcImpl<IServerClientRpcFns>(baseImpl)

  clientImpl.implement('app:misc:readFile', async (path) => {
    const content = await fs.readFile(path)
    return content
  })

  return clientImpl
}
