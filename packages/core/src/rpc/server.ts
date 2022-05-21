import { createLogger } from '../logger/index.js'
import { Awaitable } from '../utils/index.js'
import {
  FnMap,
  Args,
  Return,
  RpcResponse,
  RpcRequest,
  RpcMsgType
} from './base.js'

export class RpcImpl<M extends FnMap> {
  protected implementations: FnMap

  constructor(base: RpcImpl<FnMap> | null = null) {
    this.implementations = Object.create(base?.implementations || null)
  }

  implement<K extends keyof M>(method: K, implementation: M[K]) {
    this.implementations[<string>method] = implementation
  }
}

const logger = createLogger('core', 'rpc/server')

export class RpcServer<M extends FnMap> extends RpcImpl<M> {
  constructor(
    private send: (msg: RpcResponse) => Awaitable<void>,
    base: RpcImpl<FnMap> | null = null
  ) {
    super(base)
  }

  async call<K extends keyof M>(
    method: K,
    params: Args<M[K]>
  ): Promise<Return<M[K]>> {
    const implementation = this.implementations[<string>method]
    if (!implementation) {
      throw new Error(`Method ${method} not implemented`)
    }
    return <never>implementation(...(params as unknown[] as never[]))
  }

  async handle(msg: RpcRequest) {
    if ('rpcId' in msg) {
      // Call
      try {
        const resolve = await this.call(msg.method, <never>msg.args)
        await this.send({ t: RpcMsgType.Response, rpcId: msg.rpcId, resolve })
      } catch (reject) {
        try {
          await this.send({ t: RpcMsgType.Response, rpcId: msg.rpcId, reject })
        } catch (e) {
          logger.error(e)
        }
      }
    } else {
      // Dispatch
      this.call(msg.method, <never>msg.args)
    }
  }
}
