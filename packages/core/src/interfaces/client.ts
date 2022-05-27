import { RpcTypeDescriptor } from '../rpc/index.js'

export type ClientDescriptor = RpcTypeDescriptor<
  {
    ['$c:agent:notify'](msg: string): void
  },
  {}
>
