import { nanoid } from 'nanoid'
import {
  CallId,
  decodeReject,
  encodeReject,
  Fn,
  IRpcCallRequest,
  IRpcCallResponse,
  IRpcDieMsg,
  IRpcEventMsg,
  IRpcExecRequest,
  IRpcMsg,
  RpcId,
  RpcMsgType,
  SubscriptionId
} from './base.js'
import type { Logger } from 'pino'
import type { Awaitable } from '../util/index.js'
import { createLogger } from '../logger/index.js'

export type WithThis<T, F> = F extends Fn<infer A, infer R>
  ? (this: T, ...args: A) => R
  : never

export interface RpcTypeDescriptor<A extends {}, B extends {}> {
  provide: A
  publish: B
}

export type ProvideKeys<T> = T extends RpcTypeDescriptor<infer A, infer _>
  ? keyof A
  : never

export type PublishKeys<T> = T extends RpcTypeDescriptor<infer _, infer B>
  ? keyof B
  : never

export type ProvideImpl<
  T,
  K extends ProvideKeys<T>
> = T extends RpcTypeDescriptor<infer A, infer _>
  ? A[K] extends Fn<infer A1, infer R>
    ? (...args: A1) => Awaitable<R>
    : never
  : never

export type ProvideArgs<
  T,
  K extends ProvideKeys<T>
> = T extends RpcTypeDescriptor<infer A, infer _>
  ? A[K] extends Fn<infer A1, infer _>
    ? A1
    : never
  : never

export type ProvideReturn<
  T,
  K extends ProvideKeys<T>
> = T extends RpcTypeDescriptor<infer A, infer _>
  ? A[K] extends Fn<infer _, infer R>
    ? R
    : never
  : never

export type PublishImpl<
  T,
  K extends PublishKeys<T>
> = T extends RpcTypeDescriptor<infer _, infer B>
  ? B[K] extends Fn<infer A, infer R>
    ? (
        cb: (data: R, err?: unknown) => void,
        ...args: A
      ) => Awaitable<() => Awaitable<void>>
    : never
  : never

export type PublishArgs<
  T,
  K extends PublishKeys<T>
> = T extends RpcTypeDescriptor<infer _, infer B>
  ? B[K] extends Fn<infer A, infer _>
    ? A
    : never
  : never

export type PublishCb<
  T,
  K extends PublishKeys<T>
> = T extends RpcTypeDescriptor<infer _, infer B>
  ? B[K] extends Fn<infer _, infer R>
    ? (data: R, err?: unknown) => void
    : never
  : never

export type RpcDescriptor = RpcTypeDescriptor<{}, {}>

export interface IRpcEndpointInfo {
  provides: string[]
  publishes: string[]
}

export type InternalDescriptor = RpcTypeDescriptor<
  {
    ['$:ping'](): void
    ['$:subscribe'](type: string, ...args: unknown[]): SubscriptionId
    ['$:unsubscribe'](id: SubscriptionId): void
    ['$:info'](): IRpcEndpointInfo
  },
  {}
>

function applyInternalImpl(endpoint: RpcEndpoint<InternalDescriptor>) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  endpoint.provide('$:ping', () => {})
  endpoint.provide('$:subscribe', async function (type, ...args) {
    const impl = this.endpoint.published(<never>type)
    const subscriptionId = nanoid()
    const cb = (data: unknown) =>
      this.endpoint.send(<IRpcEventMsg>{
        t: RpcMsgType.EVENT,
        s: this.endpoint.localId,
        d: this.remoteId,
        i: subscriptionId,
        p: data
      })
    const unpub = await impl.call(this, cb, ...args)
    this.publications.set(subscriptionId, { unpub })
    return subscriptionId
  })
  endpoint.provide('$:unsubscribe', async function (id) {
    const publication = this.publications.get(id)
    if (publication) {
      await publication.unpub()
      this.publications.delete(id)
    }
  })
  endpoint.provide('$:info', function () {
    return {
      provides: [...this.endpoint.provides.keys()],
      publishes: [...this.endpoint.publishes.keys()]
    }
  })
}

const defaultLogger = createLogger('core/rpc/endpoint')

type ProvidedFn = (...args: unknown[]) => unknown
type PublishedFn = (
  cb: (data: unknown, err?: unknown) => void,
  ...args: unknown[]
) => Awaitable<() => Awaitable<void>>

export class RpcEndpoint<D extends RpcDescriptor> {
  /** @internal */
  handles
  /** @internal */
  provides
  /** @internal */
  publishes

  disposed

  constructor(
    public localId: RpcId,
    public send: (msg: IRpcMsg) => unknown,
    public logger: Logger = defaultLogger
  ) {
    this.disposed = false
    this.handles = new Map<RpcId, RpcHandle<RpcTypeDescriptor<{}, {}>>>()
    this.provides = new Map<string, ProvidedFn>()
    this.publishes = new Map<string, PublishedFn>()
    applyInternalImpl(<never>this)
  }

  getHandle<D extends RpcDescriptor>(remoteId: RpcId): RpcHandle<D> {
    let handle = this.handles.get(remoteId)
    if (!handle) {
      handle = new RpcHandle(this, remoteId)
      this.handles.set(remoteId, handle)
    }
    return <never>handle
  }

  recv(msg: IRpcMsg) {
    const handle = this.getHandle(msg.s)
    handle.recv(msg)
  }

  provide<K extends ProvideKeys<D>>(
    name: K,
    fn: WithThis<RpcHandle<D>, ProvideImpl<D, K>>
  ) {
    this.provides.set(name, fn)
  }

  provided<K extends ProvideKeys<D>>(name: K) {
    const impl = this.provides.get(name)
    if (!impl) throw new Error(`No implementation for ${name}`)
    return <ProvideImpl<D, K>>impl
  }

  publish<K extends PublishKeys<D>>(
    name: K,
    fn: WithThis<RpcHandle<D>, PublishImpl<D, K>>
  ) {
    this.publishes.set(name, fn)
  }

  published<K extends PublishKeys<D>>(name: K) {
    const impl = this.publishes.get(name)
    if (!impl) throw new Error(`No implementation for ${name}`)
    return <PublishImpl<D, K>>impl
  }

  async dispose(reason: unknown) {
    this.disposed = true
    for (const [, handle] of this.handles) {
      await handle.dispose(reason)
    }
  }
}

export interface IRpcInvocation {
  resolve: (value: never) => void
  reject: (reason: unknown) => void
}

export interface ISubscription {
  cb: (data: unknown, err?: unknown) => void
}

export interface IPublication {
  unpub: () => Awaitable<void>
}

export interface IRpcCallable<D extends RpcDescriptor> {
  call<K extends ProvideKeys<D>>(
    name: K,
    ...args: ProvideArgs<D, K>
  ): Promise<ProvideReturn<D, K>>
}

export class RpcHandle<D extends RpcDescriptor> {
  /** @internal */
  invocations
  /** @internal */
  subscriptions
  /** @internal */
  publications

  disposed

  constructor(
    public endpoint: RpcEndpoint<RpcDescriptor>,
    public remoteId: RpcId
  ) {
    this.invocations = new Map<CallId, IRpcInvocation>()
    this.subscriptions = new Map<SubscriptionId, ISubscription>()
    this.publications = new Map<SubscriptionId, IPublication>()
    this.disposed = false
  }

  async connect() {
    await (this as RpcHandle<InternalDescriptor>).call('$:ping')
  }

  private handleDie(msg: IRpcDieMsg) {
    this.dispose(decodeReject(msg.j))
  }

  private async handleCallRequest(msg: IRpcCallRequest) {
    const { i, m, a } = msg
    try {
      const resolve = await this.endpoint.provided(<never>m).call(this, ...a)
      const msg: IRpcCallResponse = {
        t: RpcMsgType.CALL_RESPONSE,
        s: this.endpoint.localId,
        d: this.remoteId,
        i: i,
        l: resolve
      }
      await this.endpoint.send(msg)
    } catch (e) {
      try {
        const msg: IRpcCallResponse = {
          t: RpcMsgType.CALL_RESPONSE,
          s: this.endpoint.localId,
          d: this.remoteId,
          i: i,
          j: encodeReject(e)
        }
        await this.endpoint.send(msg)
      } catch (e) {
        this.endpoint.logger.error(e)
      }
    }
  }

  private finalizeRpcCall(callId: CallId, resolve: unknown, reject: unknown) {
    const invocation = this.invocations.get(callId)
    if (!invocation) return
    this.invocations.delete(callId)
    if (reject) {
      invocation.reject(reject)
    } else {
      invocation.resolve(<never>resolve)
    }
  }

  private handleCallResponse(msg: IRpcCallResponse) {
    const { i, l, j } = msg
    if (j) return this.finalizeRpcCall(i, l, decodeReject(j))
    this.finalizeRpcCall(i, l, undefined)
  }

  private async handleExecRequest(msg: IRpcExecRequest) {
    const { m, a } = msg
    try {
      await this.endpoint.provided(<never>m).call(this, ...a)
    } catch (e) {
      this.endpoint.logger.error(e)
    }
  }

  private async handleEvent(msg: IRpcEventMsg) {
    const { i, p } = msg
    const subscription = this.subscriptions.get(i)
    if (!subscription) return
    try {
      await subscription.cb(p)
    } catch (err) {
      this.endpoint.logger.error(err, 'Error occurred in subscription callback')
    }
  }

  recv(msg: IRpcMsg) {
    switch (msg.t) {
      case RpcMsgType.CALL_REQUEST:
        this.handleCallRequest(<IRpcCallRequest>msg)
        break
      case RpcMsgType.CALL_RESPONSE:
        this.handleCallResponse(<IRpcCallResponse>msg)
        break
      case RpcMsgType.EXEC_REQUEST:
        this.handleExecRequest(<IRpcExecRequest>msg)
        break
      case RpcMsgType.EVENT:
        this.handleEvent(<IRpcEventMsg>msg)
        break
      case RpcMsgType.DIE:
        this.handleDie(<IRpcDieMsg>msg)
        break
    }
  }

  async dispose(reason: unknown) {
    this.disposed = true
    if (this.endpoint.handles.delete(this.remoteId)) {
      for (const [, { reject }] of this.invocations) {
        reject(reason)
      }
      this.invocations.clear()
      for (const [, { unpub }] of this.publications) {
        await unpub()
      }
      this.publications.clear()
      for (const [, { cb }] of this.subscriptions) {
        cb(undefined, reason)
      }
      this.subscriptions.clear()
    }
  }

  async call<K extends ProvideKeys<D>>(
    name: K,
    ...args: ProvideArgs<D, K>
  ): Promise<ProvideReturn<D, K>> {
    if (this.disposed) throw new Error('RpcHandle is disposed')
    const callId = nanoid()
    const msg: IRpcCallRequest = {
      t: RpcMsgType.CALL_REQUEST,
      i: callId,
      s: this.endpoint.localId,
      d: this.remoteId,
      m: name,
      a: args
    }
    const ret = new Promise<ProvideReturn<D, K>>((resolve, reject) => {
      this.invocations.set(callId, { resolve, reject })
    })
    queueMicrotask(async () => {
      try {
        await this.endpoint.send(msg)
      } catch (e) {
        this.finalizeRpcCall(callId, undefined, e)
      }
    })
    return ret
  }

  async exec<K extends ProvideKeys<D>>(
    name: K,
    ...args: ProvideArgs<D, K>
  ): Promise<void> {
    if (this.disposed) throw new Error('RpcHandle is disposed')
    const msg: IRpcExecRequest = {
      t: RpcMsgType.EXEC_REQUEST,
      s: this.endpoint.localId,
      d: this.remoteId,
      m: name,
      a: args
    }
    await this.endpoint.send(msg)
  }

  async subscribe<K extends PublishKeys<D>>(
    name: K,
    cb: PublishCb<D, K>,
    ...args: PublishArgs<D, K>
  ): Promise<SubscriptionId> {
    const subscription = await (this as RpcHandle<InternalDescriptor>).call(
      '$:subscribe',
      name,
      ...args
    )
    this.subscriptions.set(subscription, { cb })
    return subscription
  }

  async unsubscribe(id: SubscriptionId): Promise<void> {
    if (this.subscriptions.delete(id)) {
      await (this as RpcHandle<InternalDescriptor>).call('$:unsubscribe', id)
    }
  }
}
