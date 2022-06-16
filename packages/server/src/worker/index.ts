/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RpcId } from '@chijs/rpc'
import { Awaitable } from '@chijs/util'
import { ChiApp } from '../index.js'
import { forkWorker, IForkWorkerOptions } from './fork.js'

export class WorkerExitError extends Error {
  constructor(public code: number | null, public signal: string | null) {
    super(`Worker exited with ` + (code ? `code ${code}` : `signal ${signal}`))
    this.name = 'WorkerExitError'
  }
}

type ExitResult = [code: number | null, signal: NodeJS.Signals | null]

export class ChiWorker {
  adapter
  child
  whenExit
  private resolve!: (value: Awaitable<ExitResult>) => void

  constructor(
    public manager: WorkerManager,
    public options: IForkWorkerOptions
  ) {
    this.whenExit = new Promise<ExitResult>((resolve) => {
      this.resolve = resolve
    })

    try {
      this.adapter = manager.app.rpc.router.createAdapter(
        options.rpcId,
        (msg) =>
          new Promise<void>((resolve, reject) =>
            this.child!.send(msg, (err) => (err ? reject(err) : resolve()))
          )
      )
      this.child = forkWorker(options)
      this.child.on('message', (msg) => this.adapter!.recv(<never>msg))
      this.child.on('exit', this.exitHandler.bind(this))
    } catch (err) {
      this.adapter?.dispose(err)
      this.resolve([-1, null])
    }
  }

  exitHandler(code: number | null, signal: NodeJS.Signals | null) {
    this.adapter?.dispose(new WorkerExitError(code, signal))
    this.resolve([code, signal])
  }

  kill(signal?: number | NodeJS.Signals) {
    this.child?.kill(signal)
  }

  getHandle() {
    return this.manager.app.rpc.endpoint.getHandle(this.options.rpcId)
  }
}

export class WorkerManager {
  workers

  constructor(public app: ChiApp) {
    this.workers = new Map<RpcId, Worker>()
  }
}
