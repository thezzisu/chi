import { Logger } from 'pino'
import { encodeReject, RpcMsgType } from './base.js'

import type { RpcId, IRpcMsg, IRpcDieMsg } from './base.js'
import { createLogger } from '../logger/index.js'

function createRpcDieMsg(src: RpcId, dst: RpcId, reason: unknown): IRpcDieMsg {
  return {
    t: RpcMsgType.DIE,
    s: src,
    d: dst,
    j: encodeReject(reason)
  }
}

export class RpcAdapter {
  connections

  constructor(
    private router: RpcRouter,
    public id: RpcId,
    public send: (msg: IRpcMsg) => unknown
  ) {
    this.connections = new Set<RpcId>()
  }

  async recv(msg: IRpcMsg) {
    const remote = this.router.adapters.get(msg.d)
    if (remote) {
      this.connections.add(msg.d)
      remote.connections.add(msg.s)
      try {
        await remote.send(msg)
      } catch (e) {
        this.router.logger.error(
          e,
          `Error sending message from ${msg.s} to ${msg.d}`
        )
      }
    } else {
      this.disconnect(msg.d, new Error(`Remote ${msg.d} not found`))
    }
  }

  async disconnect(remote: RpcId, reason: unknown) {
    if (this.connections.delete(remote)) {
      try {
        await this.send(createRpcDieMsg(remote, this.id, reason))
      } catch (e) {
        this.router.logger.error(e, `Error sending message to ${this.id}`)
      }
    }
  }

  dispose(reason: unknown) {
    this.connections.forEach((dst) => {
      if (dst !== this.id) {
        this.router.adapters.get(dst)?.disconnect(this.id, reason)
      }
    })
    this.connections.clear()
    this.router.adapters.delete(this.id)
  }
}

const defaultLogger = createLogger('core/rpc/router')

export class RpcRouter {
  adapters

  constructor(public logger: Logger = defaultLogger) {
    this.adapters = new Map<RpcId, RpcAdapter>()
  }

  createAdapter(id: RpcId, send: (msg: IRpcMsg) => unknown) {
    if (this.adapters.has(id)) throw new Error('Adapter already exists')
    const adapter = new RpcAdapter(this, id, send)
    this.adapters.set(id, adapter)
    return adapter
  }
}
