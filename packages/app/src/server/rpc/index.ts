import { RpcEndpoint, RpcRouter } from '@chijs/rpc'
import { createLogger } from '@chijs/util'
import { SERVER_RPCID } from '../../common/index.js'
import { ChiServer } from '../index.js'
import { applyServerImpl, ServerDescriptor } from './base.js'

export class RpcManager {
  router
  endpoint
  private adapter
  private logger

  constructor(private app: ChiServer) {
    this.logger = createLogger(['rpc'], {}, app.logger)
    this.router = new RpcRouter(this.logger.child({ scope: 'router' }))
    this.adapter = this.router.create(SERVER_RPCID, (msg) =>
      this.endpoint.recv(msg)
    )
    this.endpoint = new RpcEndpoint<ServerDescriptor>(
      SERVER_RPCID,
      (msg) => this.adapter.recv(msg),
      this.logger.child({ scope: 'endpoint' })
    )
    applyServerImpl(this.endpoint, this.app)
  }
}

export * from './action.js'
export * from './base.js'
export * from './misc.js'
export * from './plugin.js'
export * from './service.js'
