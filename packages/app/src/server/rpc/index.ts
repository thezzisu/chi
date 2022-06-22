import { RpcEndpoint, RpcRouter } from '@chijs/rpc'
import { ChiServer } from '../index.js'
import { applyServerImpl, ServerDescriptor } from './base.js'

export class RpcManager {
  router
  endpoint
  private adapter
  private logger

  constructor(private app: ChiServer) {
    this.logger = app.logger.child({ module: 'server/rpc' })
    this.router = new RpcRouter(this.logger.child({ scope: 'router' }))
    this.adapter = this.router.createAdapter('#server', (msg) =>
      this.endpoint.recv(msg)
    )
    this.endpoint = new RpcEndpoint<ServerDescriptor>(
      '#server',
      (msg) => this.adapter.recv(msg),
      this.logger.child({ scope: 'endpoint' })
    )
    applyServerImpl(this.endpoint, this.app)
  }
}
