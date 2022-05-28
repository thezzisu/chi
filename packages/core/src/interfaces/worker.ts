import { RpcTypeDescriptor } from '../rpc/index.js'

export type WorkerDescriptor = RpcTypeDescriptor<
  {
    ['$w:exit'](): void
    ['$w:waitReady'](): void
  },
  {}
>
