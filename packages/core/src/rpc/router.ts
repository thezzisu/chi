import { encodeReject, RpcMsgType } from './base.js'

import type { RpcId, IRpcMsg, IRpcDieMsg } from './base.js'

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

  recv(msg: IRpcMsg) {
    const remote = this.router.adapters.get(msg.d)
    if (remote) {
      this.connections.add(msg.d)
      remote.send(msg)
    }
  }

  disconnect(remote: RpcId, reason: unknown) {
    if (this.connections.delete(remote)) {
      this.send(createRpcDieMsg(remote, this.id, reason))
    }
  }

  dispose(reason: unknown) {
    this.connections.forEach((dst) =>
      this.router.adapters.get(dst)?.disconnect(this.id, reason)
    )
    this.connections.clear()
    this.router.adapters.delete(this.id)
  }
}

export class RpcRouter {
  adapters

  constructor() {
    this.adapters = new Map<RpcId, RpcAdapter>()
  }

  createAdapter(id: RpcId, send: (msg: IRpcMsg) => unknown) {
    const adapter = new RpcAdapter(this, id, send)
    this.adapters.set(id, adapter)
    return adapter
  }
}
