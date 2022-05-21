import { Awaitable } from '../utils'

export type Fn<A extends unknown[], R> = (...args: A) => Awaitable<R>
export type AnyFn = Fn<never[], unknown>

export type Args<T extends AnyFn> = T extends Fn<infer A, unknown>
  ? never[] extends A
    ? unknown[]
    : A
  : never

export type Return<T extends AnyFn> = T extends Fn<never[], infer R> ? R : never

export type FnMap = {
  [k: string]: AnyFn
}

export interface IRpcCallOptions {
  signal?: AbortSignal
  timeout?: number
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IRpcExecOptions {
  //
}

export interface IRpcClient<M extends FnMap> {
  call<K extends keyof M>(
    method: K,
    args: Args<M[K]>,
    options?: IRpcCallOptions
  ): Promise<Return<M[K]>>

  exec<K extends keyof M>(
    method: K,
    args: Args<M[K]>,
    options?: IRpcExecOptions
  ): Promise<void>
}

export enum RpcMsgType {
  Request = 0,
  Response = 1
}

export interface IRpcCallRequest {
  t: RpcMsgType.Request
  rpcId: string
  method: string
  args: unknown[]
}

export interface IRpcCallResponse {
  t: RpcMsgType.Response
  rpcId: string
  resolve?: unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject?: any
}

export interface IRpcExecRequest {
  t: RpcMsgType.Request
  method: string
  args: unknown[]
}

export type RpcRequest = IRpcCallRequest | IRpcExecRequest
export type RpcResponse = IRpcCallResponse
