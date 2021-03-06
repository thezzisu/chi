/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RpcId } from '@chijs/rpc'
import { Awaitable } from '@chijs/util'
import { setTimeout } from 'node:timers/promises'
import { ChiServer } from '../index.js'
import { WorkerDescriptor } from './boot.js'
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
    public options: IForkWorkerOptions,
    meta?: unknown
  ) {
    this.whenExit = new Promise<ExitResult>((resolve) => {
      this.resolve = resolve
    })

    try {
      this.adapter = manager.app.rpc.router.create(
        options.rpcId,
        (msg) =>
          new Promise<void>((resolve, reject) =>
            this.child!.send(msg, (err) => (err ? reject(err) : resolve()))
          ),
        meta
      )
      this.child = forkWorker(options)
      this.child.on('message', (msg) => this.adapter!.recv(<never>msg))
      this.child.on('exit', this.exitHandler.bind(this))
      this.manager.workers.set(this.options.rpcId, this)
    } catch (err) {
      this.adapter?.dispose(err)
      this.resolve([-1, null])
    }
  }

  exitHandler(code: number | null, signal: NodeJS.Signals | null) {
    this.manager.workers.delete(this.options.rpcId)
    this.adapter?.dispose(new WorkerExitError(code, signal))
    this.resolve([code, signal])
  }

  exit(reason?: unknown) {
    try {
      const handle = this.getHandle()
      handle.exec('#worker:exit', reason)
    } catch {
      // ignore error here
    }
    // TODO: configurable timeout
    Promise.race([this.whenExit, setTimeout(1000, null)]).then((value) => {
      if (value === null) {
        this.child?.kill()
      }
    })
  }

  kill(signal?: number | NodeJS.Signals) {
    if (!this.child?.killed) this.child?.kill(signal)
  }

  getHandle() {
    return this.manager.app.rpc.endpoint.getHandle<WorkerDescriptor>(
      this.options.rpcId
    )
  }
}

export class WorkerManager {
  workers

  constructor(public app: ChiServer) {
    this.workers = new Map<RpcId, ChiWorker>()
  }

  fork(options: IForkWorkerOptions, meta?: unknown) {
    return new ChiWorker(this, options, meta)
  }
}
