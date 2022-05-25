import type { Awaitable } from '../utils'

export type Fn<A extends unknown[], R> = (...args: A) => Awaitable<R>
export type AnyFn = Fn<never[], unknown>

export type Args<T> = T extends AnyFn
  ? T extends Fn<infer A, unknown>
    ? never[] extends A
      ? unknown[]
      : A
    : never
  : never

export type Return<T> = T extends AnyFn
  ? T extends Fn<never[], infer R>
    ? R
    : never
  : never

export type ArgsOf<M, K extends string> = K extends keyof M
  ? Args<M[K]>
  : unknown[]

export type ReturnOf<M, K extends string> = K extends keyof M
  ? Return<M[K]>
  : unknown

export type FnMap = {
  [k: string]: AnyFn
}

export type MapAsync<M> = {
  [K in keyof M]: M[K] extends Fn<infer A, infer R>
    ? (...args: A) => Promise<R>
    : never
}

export enum RpcMsgType {
  CallRequest,
  CallResponse,
  ExecRequest
}

export interface IRpcMsg {
  t: RpcMsgType
}

export interface IRpcCallRequest {
  t: RpcMsgType.CallRequest
  i: string
  m: string
  a: unknown[]
}

export interface IRpcCallResponse {
  t: RpcMsgType.CallResponse
  i: string
  l?: unknown
  j?: ReturnType<typeof encodeReject>
}

export interface IRpcExecRequest {
  t: RpcMsgType.ExecRequest
  m: string
  a: unknown[]
}

export type RpcRequest = IRpcCallRequest | IRpcExecRequest
export type RpcResponse = IRpcCallResponse

export function encodeReject(reject: unknown) {
  if (reject instanceof Error) {
    return { e: 1, msg: reject.message }
  }
  return { e: 0, reject }
}

export function decodeReject(reject: ReturnType<typeof encodeReject>) {
  if (reject.e) {
    return new Error(reject.msg)
  }
  return reject.reject
}
