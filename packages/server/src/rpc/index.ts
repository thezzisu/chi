import { RpcEndpoint, RpcId, RpcRouter, ServerDescriptor } from '@chijs/core'
import { ChiApp } from '../index.js'
import { applyServerImpl } from './base.js'

export class RpcManager {
  router
  private adapter
  endpoint

  constructor(private app: ChiApp) {
    this.router = new RpcRouter()
    this.adapter = this.router.createAdapter(RpcId.server(), (msg) =>
      this.endpoint.recv(msg)
    )
    this.endpoint = new RpcEndpoint<ServerDescriptor>(RpcId.server(), (msg) =>
      this.adapter.recv(msg)
    )
    applyServerImpl(this.endpoint, this.app)
  }
}
