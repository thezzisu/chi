export interface IWorkerRpcFns {
  ['worker:exit'](): void
  ['worker:print'](msg: string): void
  ['worker:waitForInit'](): void
}
