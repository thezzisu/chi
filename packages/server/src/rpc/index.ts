import { RpcEndpoint, RPC, RpcRouter, ServerDescriptor } from '@chijs/core'
import { ChiApp } from '../index.js'
import { applyServerImpl } from './base.js'

export class RpcManager {
  router
  endpoint
  private adapter
  private logger

  constructor(private app: ChiApp) {
    this.logger = app.logger.child({ module: 'server/rpc' })
    this.router = new RpcRouter(this.logger.child({ scope: 'router' }))
    this.adapter = this.router.createAdapter(RPC.server(), (msg) =>
      this.endpoint.recv(msg)
    )
    this.endpoint = new RpcEndpoint<ServerDescriptor>(
      RPC.server(),
      (msg) => this.adapter.recv(msg),
      this.logger.child({ scope: 'endpoint' })
    )
    applyServerImpl(this.endpoint, this.app)
  }
}
